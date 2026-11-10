---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the guidelines from the dated snapshot below (nothing is fetched at run time)
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

The rules and the output format are in a dated snapshot carried in this skill:

```
${CLAUDE_SKILL_DIR}/references/guidelines-2026-11-10.md
```

It is a copy of `command.md` from `vercel-labs/web-interface-guidelines` (upstream commit
4ecfb9f, 2026-10-05), read on 2026-11-10, so a review gives the same answer on any machine and on
any day. Refreshing it is a deliberate kit change: fetch the upstream file, diff it against the
snapshot, save it under a new date, and update this path.

## Usage

When a user provides a file or pattern argument:
1. Read the snapshot above
2. Read the specified files
3. Apply all rules from the guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
