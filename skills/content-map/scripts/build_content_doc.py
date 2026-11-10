#!/usr/bin/env python3
"""Build docs/content/CONTENT.md: the whole site's content as one document.

    python -I build_content_doc.py --root <project root> [--config <path>] [--date YYYY-MM-DD]

Reads   the config (default <root>/docs/content/content-map.json), the map's page files, and
        the optional labels file the config names (`labels_file`).
Writes  the file the config names as `content_doc` (default docs/content/CONTENT.md), UTF-8, LF.

The document goes page by page in the config's order, area by area in the page file's order.
Text areas carry the text as it is in the map. An area marked "ask" or "write" carries one
plain line that says it is missing, who supplies it and what exactly is missing. A summary of
those lines opens the document, in two tables: needed from the client, to be written by the
studio. Pointer areas are skipped (the global block is printed once, on its own page). The
map's remark lines (`Missing:`, `Unconfirmed:`, `Draft:`, `Note:`) never reach the document.

Names and wording:
  - A page heading is the page's `title` from the config. Consecutive pages that share a
    `group` are printed under one group heading and numbered.
  - An area heading is the area's name, translated through `area_labels` in the config and
    `areas` in the labels file (the file wins). No entry: the name is used as it is.
  - The text of a "missing" line is the map's `Missing:` line, unless the labels file gives a
    reader's wording under `missing` -> `<page file>` -> `<area name>`.
  - The document's own strings (title, intro, the "missing" labels) come from `doc` in the
    config; the defaults are English. `{date}` in the intro becomes the build date.

The labels file is JSON: {"areas": {"<area name>": "<label>"},
                          "missing": {"<page file>": {"<area name>": "<reader's wording>"}}}

Exit code: 0 built; 1 the config, a path or the labels file is wrong.
Python standard library only. Loads build_map_index.py (same folder) for the config and parser.
"""
from __future__ import annotations

import argparse
import datetime
import importlib.util
import json
import re
import sys
from pathlib import Path

DOC_DEFAULTS = {
    "title": "Site content",
    "intro": "One document with every text the site will carry, page by page, as it stands "
             "today. Where a text or a fact is missing, the line says so and says what exactly "
             "is missing: what is needed from you, and what we will write and send for your "
             "approval. The texts were not edited or rewritten. As of {date}.",
    "summary_heading": "What is missing, in short",
    "ask_heading": "Needed from you",
    "write_heading": "We will write it, for your approval",
    "table_header": ["Page", "What", "Detail"],
    "missing_ask": "Missing — needed from you:",
    "missing_write": "Missing — we will write it, for your approval:",
    "draft_note": "Draft, for your approval.",
    "legacy_note": "",
    "nothing": "Nothing.",
    "group_intro": {},
}


def load_sibling(name: str):
    """Load a script from this folder by path (works under `python -I`)."""
    sys.dont_write_bytecode = True  # leave no __pycache__ in the kit
    path = Path(__file__).resolve().with_name(name + ".py")
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def load_labels(cfg: dict, error) -> tuple:
    areas = dict(cfg["area_labels"])
    missing = {}
    path = cfg["_labels_file"]
    if path is None:
        return areas, missing
    try:
        raw = json.loads(path.read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        raise error(f"labels file not found: {path}")
    except json.JSONDecodeError as exc:
        raise error(f"labels file is not valid JSON: {path}: {exc}")
    if not isinstance(raw, dict) or not isinstance(raw.get("areas", {}), dict) \
            or not isinstance(raw.get("missing", {}), dict):
        raise error("the labels file must be an object with `areas` and `missing` objects")
    areas.update(raw.get("areas", {}))
    missing = raw.get("missing", {})
    return areas, missing


def cell(text: str) -> str:
    return re.sub(r"\s+", " ", str(text)).replace("|", "/").strip()


def build_doc(cfg: dict, mapindex, date: str) -> tuple:
    doc = dict(DOC_DEFAULTS)
    doc.update(cfg["doc"])
    labels, reader_missing = load_labels(cfg, mapindex.ConfigError)
    pages, _problems = mapindex.load_pages(cfg)

    def label(name: str) -> str:
        return str(labels.get(name, name))

    def missing_text(page: dict, area: dict) -> str:
        return str(reader_missing.get(page["file"], {}).get(area["name"]) or area["missing"] or "")

    def shown(page: dict, parsed: dict) -> list:
        """The areas the reader sees: no pointers, no area that only repeats the page heading."""
        return [a for a in parsed["areas"]
                if not a["pointer"]
                and not (a["role"] == "have" and a["paragraphs"] == [page["title"]])]

    def is_gap(area: dict) -> bool:
        return area["role"] in ("ask", "write") and (not area["draft"] or bool(area["missing"]))

    def render_area(page: dict, area: dict, level: int) -> list:
        sub = "#" * min(level + 1, 6) + " "
        text = "\n\n".join(sub + p[4:] if p.startswith("### ") else p for p in area["paragraphs"])
        out = ["#" * level + " " + label(area["name"]), ""]
        if text:
            out += [text, ""]
        if area["draft"] and text and doc["draft_note"]:
            out += [f"*{doc['draft_note']}*", ""]
        if is_gap(area):
            lead = doc["missing_ask"] if area["role"] == "ask" else doc["missing_write"]
            out += [f"**{lead}** {missing_text(page, area)}".rstrip(), ""]
        elif area["role"] == "legacy" and doc["legacy_note"]:
            out += [f"*{doc['legacy_note']}*", ""]
        return out

    out = [f"# {doc['title']}", "", str(doc["intro"]).replace("{date}", date), ""]

    rows = {"ask": [], "write": []}
    for page, parsed in pages:
        for area in (shown(page, parsed) if parsed else []):
            if is_gap(area):
                rows[area["role"]].append((page["title"], label(area["name"]),
                                           missing_text(page, area)))
    out += [f"## {doc['summary_heading']}", ""]
    header = doc["table_header"]
    for role, heading in (("ask", doc["ask_heading"]), ("write", doc["write_heading"])):
        out += [f"### {heading}", ""]
        if rows[role]:
            out += ["| " + " | ".join(map(str, header)) + " |", "|---|---|---|"]
            out += [f"| {cell(a)} | {cell(b)} | {cell(c)} |" for a, b, c in rows[role]]
        else:
            out.append(str(doc["nothing"]))
        out.append("")

    group, number, skipped = None, 0, []
    for page, parsed in pages:
        if not parsed:
            skipped.append(page["file"])
            continue
        if page["group"] != group:
            group, number = page["group"], 0
            if group:
                out += [f"## {group}", ""]
                intro = doc["group_intro"].get(group) if isinstance(doc["group_intro"], dict) else None
                if intro:
                    out += [str(intro), ""]
        if group:
            number += 1
            out += [f"### {number}. {page['title']}", ""]
            level = 4
        else:
            out += [f"## {page['title']}", ""]
            level = 3
        for area in shown(page, parsed):
            out += render_area(page, area, level)

    text = re.sub(r"\n{3,}", "\n\n", "\n".join(out)).rstrip("\n") + "\n"
    stats = {"words": len(text.split()), "ask": len(rows["ask"]), "write": len(rows["write"]),
             "skipped": skipped}
    return text, stats


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    parser = argparse.ArgumentParser(description="Build the single-document CONTENT.md.")
    parser.add_argument("--root", default=".", help="project root (default: current directory)")
    parser.add_argument("--config", default=None,
                        help="config path (default: docs/content/content-map.json under the root)")
    parser.add_argument("--date", default=None, help="the date printed for {date} (default: today)")
    args = parser.parse_args()

    mapindex = load_sibling("build_map_index")
    try:
        cfg = mapindex.load_config(Path(args.root), args.config)
        if not cfg["_map_dir"].is_dir():
            raise mapindex.ConfigError(f"map folder not found: {cfg['_map_dir']}")
        text, stats = build_doc(cfg, mapindex, args.date or datetime.date.today().isoformat())
    except mapindex.ConfigError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    out_path = cfg["_content_doc"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf8", newline="\n")
    print(f"wrote {out_path}: {stats['words']} words, {stats['ask']} needed from the client, "
          f"{stats['write']} to be written by the studio")
    for name in stats["skipped"]:
        print(f"skipped {name}: not built yet", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
