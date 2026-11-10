# Content library — index

<!--
Skeleton of docs/content/INDEX.md. Replace every <...>, delete the sections the project does
not have, delete this comment. Numbers come from the table docx_to_text.py prints; do not
count by another method. Content strings quoted here are the client's, word for word.
-->

Copied <date> from `<the folder the client's files came from>` (<n> files). That folder was
not touched. Copies with their original names are in `source/`; a plain-text extraction of
every `.docx` (paragraph text, list items as `- `, detected headings as `### `) is in `text/`,
built by `docx_to_text.py`. Content strings are the client's: never paraphrased, improved or
translated.

Word counts are whitespace tokens of the extracted text, from the script's table (<date>).
Heading styles: <"none of the files uses Word heading styles: headings are plain bold
paragraphs, so the page outline is the studio's reading of the text, not something the files
carry" | "n of m files use Word heading styles">.

## Deliveries

| Date | From | What | Result |
|---|---|---|---|
| <date> | <folder or channel> | First delivery, <n> files | Copied to `source/` |
| <date> | <folder or channel> | Same material again | `--compare`: <n> same text, <n> differ, <n> new; copied: <which> |

## Pages with a text file (one `.docx` = one page)

| # | File | Page | Words | Text hash | What is missing |
|---|---|---|---|---|---|
| 1 | `<file name>.docx` | <page, in English> | <n> | `<12 chars>` | <what a page built from this file still lacks> |
| 2 | `<file name>.docx` | <page> | <n> | `<12 chars>` | **Wrong text**: identical to #<n> (same text hash; the file bytes differ). The text for this page is missing; ask the client for it |

## About and profile texts

| File | Use | Words | What is missing |
|---|---|---|---|
| `<file name>.docx` | <where it is used> | <n> | <for example: credentials claimed, never stated> |

## Images and logo

| File | What it is | Size | Note |
|---|---|---|---|
| `<file name>` | <logo, portrait, mock-up> | <w × h> | <identical bytes to another file; approved for the site or not; needs a vector> |

## The previous site (`previous-site/`)

<What was captured and when, how many captures, where the verbatim extraction is. What it
adds that the files lack, each item subject to the client's confirmation. See
`previous-site/README.md`.>

## Other material

- `<path>`: <a brief from the client, a spec, notes from a call; what it settles>

## Missing across the whole library

- Contact facts: <email, address, hours, phone; which are in no file, which are known from the previous site only>
- Credentials: <licence, years, education, memberships>
- Proof: <testimonials, case examples, client logos>
- Pages with no text: <home, a service whose file is wrong>
- Images: <people, premises, services>
- Legal pages: <privacy policy, accessibility statement>
- Offers and promises to confirm: <the wording, where it appears>
