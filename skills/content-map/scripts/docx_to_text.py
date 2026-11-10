#!/usr/bin/env python3
"""Content library intake: extract every .docx in the source folder to plain text.

    python -I docx_to_text.py --root <project root> [--config <path>] [--plain]
    python -I docx_to_text.py --root <project root> --report-only
    python -I docx_to_text.py --root <project root> --compare <folder with re-received files>

Reads   <root>/docs/content/source/**/*.docx      (never written, never renamed)
Writes  <root>/docs/content/text/<same name>.md   (UTF-8, LF; rewritten on every run)

The two folders come from the config (`source_dir`, `text_dir`) when one exists at
`docs/content/content-map.json`; without a config the defaults above are used, so this script
can run on day one, before the page list is known.

What lands in a text file:
  - one paragraph per block, blank line between blocks, the words exactly as typed;
  - list items (paragraphs with Word numbering) as `- item`;
  - headings as `### heading`. A heading is a paragraph with a Word heading style, or a
    paragraph whose every text run is bold and that does not end in a full stop, or the
    paragraph right after a divider line (`---`, `***`, `___`). List items are never headings.
    The first paragraph of a file is its title and gets no mark;
  - divider lines are dropped (they are layout, not text);
  - zero-width spaces (U+200B) and byte-order marks are removed. Nothing else is touched.
`--plain` writes no heading marks and keeps the dividers as `---`.

What is printed: a Markdown table, one row per file, with the word count (whitespace tokens of
the paragraph text, without the `###` and `-` marks), paragraphs, headings by cause, list items
and a hash of the extracted text; then every group of files whose extracted text is identical.
Two files with different names and the same text mean one of them is the wrong file.

`--compare <folder>` writes nothing. It extracts the .docx files of another folder (a second
delivery of the same material) in memory and says, per file, whether its text is the same as
the library copy of the same name, differs from it, or is new.

Limits: text boxes, footnotes, headers and footers are not read; a bold that comes from a
paragraph style rather than from the runs is not seen; table cells come out as paragraphs.
Python standard library only.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

CONTENT_DIR = "docs/content"
DEFAULT_CONFIG = "docs/content/content-map.json"
DEFAULT_DIRS = {"source_dir": "docs/content/source", "text_dir": "docs/content/text"}

ZERO_WIDTH = {0x200B: None, 0xFEFF: None}
EMPTY_P_RE = re.compile(r"<w:p(?:\s[^>]*)?/>")
P_RE = re.compile(r"<w:p(?:\s[^>]*)?>(.*?)</w:p>", re.S)
PPR_RE = re.compile(r"<w:pPr>(.*?)</w:pPr>", re.S)
RUN_RE = re.compile(r"<w:r(?:\s[^>]*)?>(.*?)</w:r>", re.S)
RPR_RE = re.compile(r"<w:rPr>(.*?)</w:rPr>", re.S)
BOLD_RE = re.compile(r'<w:b(?:Cs)?(?:\s+w:val="([^"]*)")?\s*/>')
TOKEN_RE = re.compile(
    r"<w:t(?:\s[^>]*)?>(.*?)</w:t>|<w:(tab|br|cr|noBreakHyphen)\b[^>]*/>", re.S)
STYLE_RE = re.compile(r"<w:style\b([^>]*)>(.*?)</w:style>", re.S)
HEADING_STYLE_RE = re.compile(r"^(heading ?\d+|title|subtitle)$")
DIVIDER_RE = re.compile(r"^(?:[-_*=–—]\s*){3,}$")


def fail(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def content_path(root: Path, rel: str, key: str) -> Path:
    """A root-relative path that must stay inside <root>/docs/content."""
    base = (root / CONTENT_DIR).resolve()
    path = (root / rel).resolve()
    try:
        path.relative_to(base)
    except ValueError:
        fail(f"`{key}` must be under {CONTENT_DIR}/ (got {rel})")
    return path


def load_dirs(root: Path, config_arg: str | None) -> dict:
    dirs = dict(DEFAULT_DIRS)
    path = Path(config_arg) if config_arg else root / DEFAULT_CONFIG
    if path.exists():
        try:
            raw = json.loads(path.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError as exc:
            fail(f"config is not valid JSON: {path}: {exc}")
        for key in dirs:
            if raw.get(key):
                dirs[key] = raw[key]
    elif config_arg:
        fail(f"config not found: {path}")
    return dirs


# ---------------------------------------------------------------- reading a .docx
def style_names(archive: zipfile.ZipFile) -> dict:
    """styleId -> built-in style name, lower case (the names stay English in every locale)."""
    try:
        xml = archive.read("word/styles.xml").decode("utf8")
    except KeyError:
        return {}
    names = {}
    for match in STYLE_RE.finditer(xml):
        style_id = re.search(r'w:styleId="([^"]*)"', match.group(1))
        name = re.search(r'<w:name w:val="([^"]*)"', match.group(2))
        if style_id and name:
            names[style_id.group(1)] = name.group(1).lower()
    return names


def run_is_bold(run_xml: str) -> bool:
    props = RPR_RE.search(run_xml)
    if not props:
        return False
    for match in BOLD_RE.finditer(props.group(1)):
        if match.group(1) is None or match.group(1) in ("1", "true", "on"):
            return True
    return False


def run_text(run_xml: str) -> str:
    out = []
    for match in TOKEN_RE.finditer(run_xml):
        if match.group(2) is None:
            out.append(html.unescape(match.group(1)))
        elif match.group(2) == "tab":
            out.append(" ")
        elif match.group(2) == "noBreakHyphen":
            out.append("‑")
        else:  # br, cr: a line break inside the paragraph
            out.append("\n")
    return "".join(out)


def read_docx(path: Path) -> list:
    """-> [{'text', 'list', 'bold', 'style_heading'}] for every paragraph that has text."""
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml").decode("utf8")
        styles = style_names(archive)
    xml = EMPTY_P_RE.sub("", xml)
    paragraphs = []
    for body in P_RE.findall(xml):
        props = PPR_RE.search(body)
        props = props.group(1) if props else ""
        style_id = re.search(r'<w:pStyle w:val="([^"]*)"', props)
        style = ""
        if style_id:
            style = styles.get(style_id.group(1), style_id.group(1).lower())
        runs = [(run_text(r), run_is_bold(r)) for r in RUN_RE.findall(body)]
        text = "".join(t for t, _ in runs)
        if not text.strip():
            continue
        # bold is judged on the runs that carry visible text; a stray space run does not count
        visible = [bold for t, bold in runs if t.strip()]
        paragraphs.append({
            "text": text,
            "list": "<w:numPr>" in props,
            "bold": all(visible),
            "style_heading": bool(HEADING_STYLE_RE.match(style)),
        })
    return paragraphs


# ---------------------------------------------------------------- paragraphs -> lines
def to_items(paragraphs: list) -> tuple:
    """-> ([(text, kind)], stats). kind: title / heading / list / text / divider."""
    items, stats = [], Counter()
    after_divider = False
    for par in paragraphs:
        for raw in par["text"].split("\n"):
            stats["zero_width"] += sum(1 for ch in raw if ord(ch) in ZERO_WIDTH)
            line = raw.translate(ZERO_WIDTH).strip()
            if not line:
                continue
            if DIVIDER_RE.match(line):
                items.append((line, "divider"))
                stats["dividers"] += 1
                after_divider = True
                continue
            first = not any(kind != "divider" for _, kind in items)
            kind = "text"
            if first:
                kind = "title"
            elif par["list"]:
                kind = "list"
                stats["list"] += 1
            elif par["style_heading"]:
                kind = "heading"
                stats["h_style"] += 1
            elif after_divider:
                kind = "heading"
                stats["h_divider"] += 1
            elif par["bold"] and not line.endswith("."):
                kind = "heading"
                stats["h_bold"] += 1
            if par["style_heading"]:
                stats["styled"] += 1
            items.append((line, kind))
            after_divider = False
    return items, stats


def render(items: list, plain: bool) -> str:
    out = []
    for text, kind in items:
        if kind == "divider":
            if plain:
                out.append("---")
        elif kind == "list":
            out.append("- " + text)
        elif kind == "heading" and not plain:
            out.append("### " + text)
        else:
            out.append(text)
    return "\n\n".join(out) + "\n" if out else ""


def text_hash(items: list) -> str:
    body = "\n".join(re.sub(r"\s+", " ", t) for t, kind in items if kind != "divider")
    return hashlib.sha256(body.encode("utf8")).hexdigest() if body else ""


def extract(path: Path) -> dict:
    """One file -> its items, numbers and hash; 'error' is set when it cannot be read."""
    try:
        items, stats = to_items(read_docx(path))
    except (zipfile.BadZipFile, KeyError, UnicodeDecodeError, OSError) as exc:
        return {"path": path, "error": f"{type(exc).__name__}: {exc}"}
    real = [(t, k) for t, k in items if k != "divider"]
    return {
        "path": path, "error": None, "items": items, "stats": stats,
        "words": sum(len(t.split()) for t, _ in real),
        "paragraphs": len(real),
        "hash": text_hash(items),
    }


def find_docx(folder: Path) -> list:
    return sorted((p for p in folder.rglob("*.docx") if not p.name.startswith("~$")),
                  key=lambda p: p.as_posix())


# ---------------------------------------------------------------- modes
def run_compare(source: Path, other: Path) -> int:
    if not other.is_dir():
        fail(f"--compare folder not found: {other}")
    library = {}
    for path in find_docx(source):
        library.setdefault(path.name, extract(path))
    seen = set()
    print(f"Compared {other} against {source} (extracted text, not file bytes).\n")
    print("| File | Words | Text hash | Against the library |")
    print("|---|---|---|---|")
    counts = Counter()
    for path in find_docx(other):
        new = extract(path)
        seen.add(path.name)
        if new["error"]:
            status = "CANNOT READ: " + new["error"]
            counts["unreadable"] += 1
            print(f"| `{path.name}` | - | - | {status} |")
            continue
        old = library.get(path.name)
        if old is None:
            status = "new file (not in the library)"
            counts["new"] += 1
        elif old["error"]:
            status = "library copy cannot be read"
            counts["unreadable"] += 1
        elif old["hash"] == new["hash"]:
            status = "same text"
            counts["same"] += 1
        else:
            status = f"TEXT DIFFERS (library: {old['words']} words, {old['hash'][:12]})"
            counts["differs"] += 1
        print(f"| `{path.name}` | {new['words']} | {new['hash'][:12] or '-'} | {status} |")
    gone = sorted(set(library) - seen)
    print()
    print(f"same text: {counts['same']}; differs: {counts['differs']}; new: {counts['new']}; "
          f"unreadable: {counts['unreadable']}; in the library only: {len(gone)}")
    for name in gone:
        print(f"- in the library only: `{name}`")
    return 0


def run_extract(source: Path, out_dir: Path, plain: bool, report_only: bool) -> int:
    files = find_docx(source)
    if not files:
        fail(f"no .docx files under {source}")
    results, used = [], {}
    for path in files:
        result = extract(path)
        result["flags"] = []
        stem = path.stem
        if stem in used:  # same name in two sub-folders
            n = 2
            while f"{stem}-{n}" in used:
                n += 1
            result["flags"].append(f"same name as `{used[stem].relative_to(source).as_posix()}`; "
                                   f"written as `{stem}-{n}.md`")
            stem = f"{stem}-{n}"
        used[stem] = path
        result["out"] = out_dir / f"{stem}.md"
        results.append(result)

    by_hash = {}
    for result in results:
        if not result["error"] and result["hash"]:
            by_hash.setdefault(result["hash"], []).append(result)
    duplicates = [group for group in by_hash.values() if len(group) > 1]

    if not report_only:
        out_dir.mkdir(parents=True, exist_ok=True)
    styled_files = 0
    print("| File | Words | Paragraphs | Headings (bold / style / after divider) | List items "
          "| Text hash | Flags |")
    print("|---|---|---|---|---|---|---|")
    for result in results:
        name = result["path"].relative_to(source).as_posix()
        if result["error"]:
            print(f"| `{name}` | - | - | - | - | - | CANNOT READ: {result['error']} |")
            continue
        stats = result["stats"]
        flags = result["flags"]
        if not result["hash"]:
            flags.append("NO TEXT")
        else:
            twins = [r for r in by_hash[result["hash"]] if r is not result]
            if twins:
                flags.append("IDENTICAL TEXT to " + ", ".join(
                    f"`{t['path'].relative_to(source).as_posix()}`" for t in twins))
        headings = stats["h_bold"] + stats["h_style"] + stats["h_divider"]
        if result["hash"] and not headings:
            flags.append("no headings detected")
        if stats["zero_width"]:
            flags.append(f"zero-width characters removed: {stats['zero_width']}")
        if stats["dividers"]:
            flags.append(f"divider lines {'kept' if plain else 'dropped'}: {stats['dividers']}")
        if stats["styled"]:
            styled_files += 1
        print(f"| `{name}` | {result['words']} | {result['paragraphs']} | "
              f"{headings} ({stats['h_bold']} / {stats['h_style']} / {stats['h_divider']}) | "
              f"{stats['list']} | {result['hash'][:12] or '-'} | {'; '.join(flags)} |")
        if not report_only:
            result["out"].write_text(render(result["items"], plain), encoding="utf8", newline="\n")

    readable = [r for r in results if not r["error"]]
    print()
    print(f"{len(results)} files, {len(readable)} read, "
          f"{sum(r['words'] for r in readable)} words in all. "
          + ("Nothing written (--report-only)." if report_only
             else f"Text written to {out_dir}."))
    print(f"Word heading styles: used in {styled_files} of {len(readable)} files"
          + (". Headings are read from bold paragraphs and dividers only: the outline is "
             "the studio's reading, not something the files carry." if not styled_files else "."))
    if duplicates:
        print()
        print("Identical extracted text (a wrong or duplicated file; ask which one is right):")
        for group in duplicates:
            names = " = ".join(f"`{r['path'].relative_to(source).as_posix()}`" for r in group)
            print(f"- {names} ({group[0]['words']} words, hash {group[0]['hash'][:12]})")
    else:
        print("No two files carry identical text.")
    return 0


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    parser = argparse.ArgumentParser(description="Extract the library's .docx files to text.")
    parser.add_argument("--root", default=".", help="project root (default: current directory)")
    parser.add_argument("--config", default=None,
                        help=f"config path (default: {DEFAULT_CONFIG} under the root)")
    parser.add_argument("--plain", action="store_true",
                        help="no heading marks; divider lines kept as ---")
    parser.add_argument("--report-only", action="store_true",
                        help="print the table, write nothing")
    parser.add_argument("--compare", metavar="FOLDER", default=None,
                        help="compare another folder's .docx text with the library; writes nothing")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    dirs = load_dirs(root, args.config)
    source = content_path(root, dirs["source_dir"], "source_dir")
    out_dir = content_path(root, dirs["text_dir"], "text_dir")
    if not source.is_dir():
        fail(f"source folder not found: {source}")
    if args.compare:
        return run_compare(source, Path(args.compare).resolve())
    return run_extract(source, out_dir, args.plain, args.report_only)


if __name__ == "__main__":
    sys.exit(main())
