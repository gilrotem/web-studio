#!/usr/bin/env python3
"""Build docs/content/map/INDEX.md from the content map's page files.

    python -I build_map_index.py --root <project root> [--config <path>] [--check] [--strict]

Reads   the config (default <root>/docs/content/content-map.json), the page files it lists
        in the map folder, and the text files named as a page's `source`.
Writes  <map folder>/INDEX.md (UTF-8, LF). Nothing else. `--check` writes nothing.

The index holds: the page list with area counts per marker, the totals, the gaps table (one
row for every area marked "ask" or "write", with its `Missing:` line), the list of what waits
for the client's confirmation, a verbatim check of every page that names a source text, and a
"Problems" list when the files break the format.

Hand-written sections survive a rebuild: everything from the first line that starts with
`## Spot-checks` or `## Notes` to the end of an existing INDEX.md is kept as it is. The part
above that line is rebuilt on every run. On a first run two empty sections are added.

The map file format (see the skill's references/map-page-template.md):

    # <page title>

    Source: <where the text comes from>

    ---

    ## <area name> · <marker>

    <the raw text, one paragraph per line; `### ` for the client's own sub-headings>

    Missing: <what exactly is missing>      (areas marked "ask" or "write")

A line that is exactly `---` separates areas. The marker is the last ` · ` part of the area
heading and must be one of the four words of the config's vocabulary. An area whose name ends
in `(global)` is a pointer to a global block: `→ `00-global.md`, area "<name>"`. Lines that
start with `Missing:`, `Unconfirmed:`, `Draft:` or `Note:` are the map's own remarks (each
runs to the next blank line); everything else in an area is site text.

Exit code: 0 built; 1 the config or a path is wrong; 2 with `--strict` when problems were found.
Python standard library only. build_content_doc.py loads this file for the config and the parser.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from collections import Counter
from pathlib import Path

CONTENT_DIR = "docs/content"
DEFAULT_CONFIG = "docs/content/content-map.json"
PATH_DEFAULTS = {
    "source_dir": "docs/content/source",
    "text_dir": "docs/content/text",
    "map_dir": "docs/content/map",
    "content_doc": "docs/content/CONTENT.md",
}
VOCABULARIES = {
    "he": {"have": "יש", "ask": "לבקש", "write": "לכתוב", "legacy": "אתר ישן"},
    "en": {"have": "have", "ask": "ask", "write": "write", "legacy": "legacy"},
}
ROLES = ("have", "legacy", "ask", "write")  # the order they are shown in
ROLE_MEANING = {
    "have": "the client's text exists",
    "legacy": "taken from the client's previous site, verbatim, only where the client's files "
              "lack it; waits for the client's confirmation",
    "ask": "only the client can supply it",
    "write": "the studio drafts it for approval",
}
POINTER_SUFFIX = "(global)"
MISSING, UNCONFIRMED, DRAFT, NOTE = "Missing:", "Unconfirmed:", "Draft:", "Note:"
KEEP_FROM = ("## Spot-checks", "## Notes")
ZERO_WIDTH = {0x200B: None, 0xFEFF: None}
POINTER_RE = re.compile(r'^(?:→|->)\s*`([^`]+)`,\s*area\s*"(.+)"\s*$')
DEFAULT_TAIL = """## Spot-checks

Hand-written. Everything from this heading to the end of the file is kept when the index is rebuilt.

| File | What was read against its source | Result |
|---|---|---|

## Notes

Hand-written: the judgement calls, the gaps that were closed and why, anything a rebuild must not lose.
"""


class ConfigError(Exception):
    pass


# ---------------------------------------------------------------- config
def content_path(root: Path, rel: str, key: str) -> Path:
    """A root-relative path that must stay inside <root>/docs/content."""
    base = (root / CONTENT_DIR).resolve()
    path = (root / str(rel)).resolve()
    try:
        path.relative_to(base)
    except ValueError:
        raise ConfigError(f"`{key}` must be under {CONTENT_DIR}/ (got {rel})")
    return path


def load_config(root: Path, config_arg: str | None = None) -> dict:
    """Read and check the config. Paths in it are relative to the project root."""
    root = Path(root).resolve()
    path = Path(config_arg).resolve() if config_arg else root / DEFAULT_CONFIG
    try:
        raw = json.loads(path.read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        raise ConfigError(f"config not found: {path}")
    except json.JSONDecodeError as exc:
        raise ConfigError(f"config is not valid JSON: {path}: {exc}")
    if not isinstance(raw, dict):
        raise ConfigError("the config must be a JSON object")

    cfg = {"root": root, "config_path": path}
    for key, default in PATH_DEFAULTS.items():
        cfg[key] = raw.get(key) or default
        cfg["_" + key] = content_path(root, cfg[key], key)
    cfg["_labels_file"] = None
    if raw.get("labels_file"):
        cfg["_labels_file"] = content_path(root, raw["labels_file"], "labels_file")

    markers = raw.get("markers", "he")
    if isinstance(markers, str):
        if markers not in VOCABULARIES:
            raise ConfigError(f'`markers` must be "he", "en" or an object with the four words')
        markers = dict(VOCABULARIES[markers])
    elif isinstance(markers, dict):
        lost = [r for r in ROLES if not str(markers.get(r, "")).strip()]
        if lost:
            raise ConfigError("`markers` lacks a word for: " + ", ".join(lost))
        markers = {r: str(markers[r]).strip() for r in ROLES}
        if len(set(markers.values())) != 4:
            raise ConfigError("`markers` must hold four different words")
    else:
        raise ConfigError("`markers` must be a string or an object")
    cfg["markers"] = markers
    cfg["roles"] = {word: role for role, word in markers.items()}

    pages = raw.get("pages")
    if not isinstance(pages, list) or not pages:
        raise ConfigError("`pages` must be a non-empty list")
    cfg["pages"], seen = [], set()
    for i, page in enumerate(pages, 1):
        if not isinstance(page, dict):
            raise ConfigError(f"pages[{i}] must be an object")
        for key in ("number", "slug", "title"):
            if page.get(key) in (None, ""):
                raise ConfigError(f"pages[{i}] lacks `{key}`")
        number = page["number"]
        number = f"{number:02d}" if isinstance(number, int) else str(number).strip()
        source = page.get("source") or []
        if isinstance(source, str):
            source = [source]
        if not isinstance(source, list) or not all(isinstance(s, str) for s in source):
            raise ConfigError(f"pages[{i}].source must be a file stem, a list of stems or null")
        name = f"{number}-{str(page['slug']).strip()}.md"
        if name in seen:
            raise ConfigError(f"two pages share the file name {name}")
        seen.add(name)
        cfg["pages"].append({
            "number": number, "slug": str(page["slug"]).strip(), "title": str(page["title"]),
            "source": source, "group": page.get("group") or None, "file": name,
        })

    phrases = raw.get("confirm_phrases") or []
    if not isinstance(phrases, list):
        raise ConfigError("`confirm_phrases` must be a list of strings")
    cfg["confirm_phrases"] = [str(p) for p in phrases if str(p).strip()]
    cfg["area_labels"] = raw.get("area_labels") or {}
    cfg["doc"] = raw.get("doc") or {}
    if not isinstance(cfg["area_labels"], dict) or not isinstance(cfg["doc"], dict):
        raise ConfigError("`area_labels` and `doc` must be objects")
    return cfg


# ---------------------------------------------------------------- the map parser
def parse_map_file(path: Path, cfg: dict) -> dict:
    """-> {'title', 'source_line', 'areas': [...], 'problems': [...]}.

    An area: name, marker (the word), role (have/legacy/ask/write), pointer (bool), target
    ((file, area) for a pointer), paragraphs (the site text), missing, unconfirmed (list),
    draft, notes (list), line.
    """
    text = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
    chunks, current, start = [], [], 1
    for number, line in enumerate(text.split("\n"), 1):
        if line.strip() == "---":
            chunks.append((start, current))
            current, start = [], number + 1
        else:
            current.append(line)
    chunks.append((start, current))

    problems = []
    header = chunks[0][1]
    title = next((l[2:].strip() for l in header if l.startswith("# ")), "")
    if not title:
        problems.append("no `# <page title>` line at the top")
    source_line = next((l.strip() for l in header if l.strip().startswith("Source:")), "")
    if not source_line:
        problems.append("no `Source:` line under the title")

    words = sorted(cfg["roles"], key=len, reverse=True)
    head_re = re.compile(r"^##\s+(.+?)\s+·\s+(" + "|".join(map(re.escape, words)) + r")\s*$")
    other_words = {w for vocab in VOCABULARIES.values() for w in vocab.values()} - set(words)

    areas, names = [], Counter()
    for start, lines in chunks[1:]:
        first = next((k for k, l in enumerate(lines) if l.strip()), None)
        if first is None:
            continue
        heading = lines[first].strip()
        match = head_re.match(heading)
        if not match:
            where = f"line {start + first}"
            if heading.startswith("## "):
                last = heading.rsplit("·", 1)[-1].strip()
                hint = (f" (`{last}` is from the other vocabulary; this config uses "
                        f"{' / '.join(cfg['markers'][r] for r in ROLES)})"
                        if last in other_words else "")
                problems.append(f"{where}: area heading without a known marker: `{heading}`{hint}")
            else:
                problems.append(f"{where}: text after `---` with no `## <area> · <marker>` heading")
            continue

        area = {
            "name": match.group(1).strip(), "marker": match.group(2),
            "role": cfg["roles"][match.group(2)], "line": start + first,
            "paragraphs": [], "missing": None, "unconfirmed": [], "draft": None, "notes": [],
            "target": None,
        }
        area["pointer"] = area["name"].endswith(POINTER_SUFFIX)
        remarks = {MISSING: [], UNCONFIRMED: [], DRAFT: [], NOTE: []}
        open_remark = None
        for line in lines[first + 1:]:
            stripped = line.translate(ZERO_WIDTH).strip()
            if not stripped:
                open_remark = None
                continue
            prefix = next((p for p in remarks if stripped.startswith(p)), None)
            if prefix:
                remarks[prefix].append(stripped[len(prefix):].strip())
                open_remark = remarks[prefix]
            elif open_remark is not None:
                open_remark[-1] += " " + stripped
            else:
                area["paragraphs"].append(stripped)
        area["missing"] = " ".join(remarks[MISSING]) or None
        area["draft"] = (" ".join(remarks[DRAFT]).strip() or "undated") if remarks[DRAFT] else None
        area["unconfirmed"] = remarks[UNCONFIRMED]
        area["notes"] = remarks[NOTE]

        names[area["name"]] += 1
        label = f"area `{area['name']}`"
        if area["pointer"]:
            target = POINTER_RE.match(area["paragraphs"][0]) if len(area["paragraphs"]) == 1 else None
            if target:
                area["target"] = (target.group(1), target.group(2))
            else:
                problems.append(f'{label}: a pointer area holds one line, '
                                f'→ `<file>`, area "<name>"')
        elif area["role"] in ("ask", "write"):
            if not area["missing"] and not area["draft"]:
                problems.append(f"{label}: marked {area['marker']} but has no `{MISSING}` line")
            if area["role"] == "ask" and area["draft"]:
                problems.append(f"{label}: a `{DRAFT}` line belongs to a "
                                f"{cfg['markers']['write']} area")
            if area["draft"] and not area["paragraphs"]:
                problems.append(f"{label}: has a `{DRAFT}` line but no draft text")
        else:
            if area["missing"]:
                problems.append(f"{label}: marked {area['marker']} but still has a `{MISSING}` line")
            if not area["paragraphs"]:
                problems.append(f"{label}: marked {area['marker']} but has no text")
        areas.append(area)

    for name, count in names.items():
        if count > 1:
            problems.append(f"area name `{name}` appears {count} times; names are unique in a file")
    if not areas:
        problems.append("no areas")
    return {"title": title, "source_line": source_line, "areas": areas, "problems": problems}


def load_pages(cfg: dict) -> tuple:
    """-> ([(page, parsed or None)], problems). Cross-file checks included."""
    map_dir = cfg["_map_dir"]
    pages, problems = [], []
    for page in cfg["pages"]:
        path = map_dir / page["file"]
        parsed = parse_map_file(path, cfg) if path.is_file() else None
        if parsed:
            problems += [f"{page['file']}: {p}" for p in parsed["problems"]]
        pages.append((page, parsed))
    known = {page["file"] for page in cfg["pages"]} | {"INDEX.md"}
    if map_dir.is_dir():
        for extra in sorted(f.name for f in map_dir.glob("*.md") if f.name not in known):
            problems.append(f"{extra}: in the map folder but not in the config's page list "
                            f"(not counted)")
    by_file = {page["file"]: parsed for page, parsed in pages if parsed}
    for page, parsed in pages:
        for area in (parsed["areas"] if parsed else []):
            if not area["pointer"] or not area["target"]:
                continue
            file_name, area_name = area["target"]
            target_page = by_file.get(file_name)
            target = next((a for a in target_page["areas"] if a["name"] == area_name),
                          None) if target_page else None
            if target is None:
                problems.append(f"{page['file']}: pointer `{area['name']}` leads to "
                                f"`{file_name}`, area \"{area_name}\", which does not exist")
            elif target["marker"] != area["marker"]:
                problems.append(f"{page['file']}: pointer `{area['name']}` is marked "
                                f"{area['marker']} but its block is marked {target['marker']}")
    return pages, problems


# ---------------------------------------------------------------- the verbatim check
def clean_paragraph(text: str) -> str:
    text = re.sub(r"^#{1,6}\s+", "", text.translate(ZERO_WIDTH).strip())
    return re.sub(r"\s+", " ", text).strip()


def count_words(paragraph: str) -> int:
    return len(re.sub(r"^- ", "", paragraph).split())


def source_paragraphs(path: Path) -> list:
    text = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
    out = []
    for line in text.split("\n"):
        line = clean_paragraph(line)
        if line and not re.fullmatch(r"(?:[-_*=]\s*){3,}", line):
            out.append(line)
    return out


def verbatim_rows(cfg: dict, pages: list) -> tuple:
    """Every source paragraph must appear in the page file, once, in the source's order."""
    rows, problems = [], []
    for page, parsed in pages:
        if not parsed or not page["source"]:
            continue
        mapped = [clean_paragraph(p) for a in parsed["areas"] if not a["pointer"]
                  for p in a["paragraphs"]]
        for stem in page["source"]:
            path = cfg["_text_dir"] / f"{stem}.md"
            if not path.is_file():
                rows.append((page["file"], stem, "-", "-", "-", "-", "source text not found"))
                problems.append(f"{page['file']}: source text `{cfg['text_dir']}/{stem}.md` not found")
                continue
            source = source_paragraphs(path)
            matcher = difflib.SequenceMatcher(None, source, mapped, autojunk=False)
            hit = set()
            for block in matcher.get_matching_blocks():
                hit.update(range(block.a, block.a + block.size))
            lost = [p for i, p in enumerate(source) if i not in hit]
            result = "ok" if not lost else f"{len(lost)} paragraphs not found"
            rows.append((page["file"], stem, sum(map(count_words, source)),
                         sum(count_words(source[i]) for i in hit), len(source), len(hit), result))
            for paragraph in lost[:3]:
                short = paragraph if len(paragraph) <= 70 else paragraph[:70] + "..."
                problems.append(f"{page['file']}: source paragraph not in the map, or out of "
                                f"order: \"{short}\"")
            if len(lost) > 3:
                problems.append(f"{page['file']}: and {len(lost) - 3} more source paragraphs")
    return rows, problems


# ---------------------------------------------------------------- the index
def cell(text: str) -> str:
    return re.sub(r"\s+", " ", str(text)).replace("|", "/").strip()


def build_index(cfg: dict) -> tuple:
    """-> (text of the rebuilt part, stats, problems)."""
    markers = cfg["markers"]
    pages, problems = load_pages(cfg)
    built = [(page, parsed) for page, parsed in pages if parsed]
    rows, verbatim_problems = verbatim_rows(cfg, pages)
    problems += verbatim_problems

    word = lambda role: markers[role]
    try:
        config_ref = cfg["config_path"].relative_to(cfg["root"]).as_posix()
    except ValueError:
        config_ref = cfg["config_path"].name
    out = [
        "# Content map — index", "",
        f"Built by `build_map_index.py` from the page files in this folder (config: `{config_ref}`). "
        f"Everything above the first `{KEEP_FROM[0]}` or `{KEEP_FROM[1]}` heading is rebuilt on "
        "every run; the hand-written sections from that heading down are kept. Nothing in the map "
        "is rewritten: every string of the client's is cut from a source.", "",
        "Markers: " + " · ".join(f"**{word(r)}** {ROLE_MEANING[r]}" for r in ROLES) + ".", "",
        "## Pages", "",
    ]
    total, total_real = Counter(), Counter()
    n_areas = n_pointers = 0
    for page, parsed in pages:
        if not parsed:
            out.append(f"- {page['file']} — {page['title']} — not built yet")
            continue
        counts = Counter(a["role"] for a in parsed["areas"])
        total.update(counts)
        total_real.update(a["role"] for a in parsed["areas"] if not a["pointer"])
        n_areas += len(parsed["areas"])
        n_pointers += sum(1 for a in parsed["areas"] if a["pointer"])
        by_marker = ", ".join(f"{word(r)} {counts[r]}" for r in ROLES if counts[r])
        out.append(f"- [{page['file']}]({page['file']}) — {page['title']} — "
                   f"{len(parsed['areas'])} areas ({by_marker})")
    out += ["", f'Pointer areas ("… {POINTER_SUFFIX}") stand in for a global block and carry its '
            "marker; they are not repeated in the gaps table.", "",
            f"Totals: {n_areas} areas in {len(built)} files ({n_pointers} of them pointers, "
            f"{n_areas - n_pointers} real areas).", "",
            "| Marker | All areas | Without pointers |", "|---|---|---|"]
    for role in ROLES:
        out.append(f"| {word(role)} | {total[role]} | {total_real[role]} |")
    out += [f"| Total | {sum(total.values())} | {sum(total_real.values())} |", ""]

    out += [f"## Gaps — every {word('ask')} and {word('write')} area", "",
            "| # | Page | Area | Marker | What exactly is missing |", "|---|---|---|---|---|"]
    gaps = Counter()
    for page, parsed in built:
        for area in parsed["areas"]:
            if area["pointer"] or area["role"] not in ("ask", "write"):
                continue
            gaps[area["role"]] += 1
            if area["draft"]:
                gaps["drafted"] += 1
                what = f"Draft in place, waits for approval ({area['draft'].rstrip('.')})."
                if area["missing"]:
                    what += " Still missing: " + area["missing"]
            else:
                what = area["missing"] or f"(no `{MISSING}` line in the page file)"
            out.append(f"| {gaps['ask'] + gaps['write']} | {page['file']} | {cell(area['name'])} | "
                       f"{area['marker']} | {cell(what)} |")
    n_gaps = gaps["ask"] + gaps["write"]
    out += ["", f"{n_gaps} rows: {gaps['ask']} {word('ask')}, {gaps['write']} {word('write')}"
            + (f" ({gaps['drafted']} of them drafted)" if gaps["drafted"] else "")
            + f". Every area marked {word('ask')} or {word('write')} in a page file is a row here; "
            "a closed gap leaves the table (record it under Notes).", ""]

    out += ["## Awaiting the client's confirmation (not gaps)", ""]
    waiting = []
    for page, parsed in built:
        for area in parsed["areas"]:
            if area["pointer"]:
                continue
            if area["role"] == "legacy":
                waiting.append(f"- {page['file']} — {area['name']} — {word('legacy')}: "
                               "from the previous site")
            for remark in area["unconfirmed"]:
                waiting.append(f"- {page['file']} — {area['name']} — unconfirmed: {remark}")
    for phrase in cfg["confirm_phrases"]:
        hits = [f"{page['file']} ({area['name']})" for page, parsed in built
                for area in parsed["areas"]
                if not area["pointer"] and any(phrase in p for p in area["paragraphs"])]
        waiting.append(f'- The wording "{phrase}" — ' + ("found in: " + "; ".join(hits) if hits
                                                           else "not found in the map"))
    out += (waiting or ["Nothing."]) + [""]

    out += ["## Verbatim check (script)", ""]
    if rows:
        out += ["Each page that names a source text in the config: the paragraphs of the text "
                "file against the paragraphs in the page's areas (heading marks, dividers and "
                "zero-width characters aside). \"Found\" counts the source paragraphs that "
                "appear in the page file in the source's order. Words are whitespace tokens.", "",
                "| File | Source text | Source words | Found words | Source paragraphs "
                "| Found paragraphs | Result |", "|---|---|---|---|---|---|---|"]
        out += [f"| {r[0]} | `{r[1]}.md` | {r[2]} | {r[3]} | {r[4]} | {r[5]} | {r[6]} |" for r in rows]
    else:
        out.append("No page names a source text in the config.")
    out.append("")

    if problems:
        out += ["## Problems", "", "Found by the script. Fix them in the page files or the "
                "config and rebuild.", ""] + [f"- {p}" for p in problems] + [""]

    stats = {"files": len(built), "missing_files": len(pages) - len(built), "areas": n_areas,
             "pointers": n_pointers, "gaps": n_gaps, "ask": gaps["ask"], "write": gaps["write"],
             "total": dict(total), "verbatim": rows}
    return "\n".join(out), stats, problems


def kept_tail(index_path: Path) -> str | None:
    """The hand-written end of an existing index: from the first KEEP_FROM heading down."""
    if not index_path.is_file():
        return None
    lines = index_path.read_text(encoding="utf-8-sig").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    for i, line in enumerate(lines):
        if line.startswith(KEEP_FROM):
            return "\n".join(lines[i:]).rstrip("\n") + "\n"
    return None


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    parser = argparse.ArgumentParser(description="Build the content map's INDEX.md.")
    parser.add_argument("--root", default=".", help="project root (default: current directory)")
    parser.add_argument("--config", default=None,
                        help=f"config path (default: {DEFAULT_CONFIG} under the root)")
    parser.add_argument("--check", action="store_true", help="report only, write nothing")
    parser.add_argument("--strict", action="store_true", help="exit 2 when problems are found")
    args = parser.parse_args()

    try:
        cfg = load_config(Path(args.root), args.config)
        if not cfg["_map_dir"].is_dir():
            raise ConfigError(f"map folder not found: {cfg['_map_dir']}")
        body, stats, problems = build_index(cfg)
    except ConfigError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    index_path = cfg["_map_dir"] / "INDEX.md"
    tail = kept_tail(index_path)
    if not args.check:
        index_path.write_text(body + "\n" + (tail or DEFAULT_TAIL), encoding="utf8", newline="\n")

    markers = cfg["markers"]
    print(("checked" if args.check else f"wrote {index_path}")
          + f": {stats['files']} files, {stats['areas']} areas ({stats['pointers']} pointers), "
          f"{stats['gaps']} gaps ({stats['ask']} {markers['ask']}, {stats['write']} {markers['write']})")
    if stats["missing_files"]:
        print(f"not built yet: {stats['missing_files']} of the config's pages")
    if not args.check:
        print("hand-written sections: " + ("kept" if tail else "none found, empty ones added"))
    for row in stats["verbatim"]:
        print(f"verbatim {row[0]}: {row[5]}/{row[4]} paragraphs, {row[3]}/{row[2]} words, {row[6]}")
    if problems:
        sys.stdout.flush()
        print(f"{len(problems)} problems:", file=sys.stderr)
        for problem in problems:
            print(f"- {problem}", file=sys.stderr)
        if args.strict:
            return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
