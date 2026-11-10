---
name: mobbin-research
description: The studio's protocol for using the Mobbin MCP (600k+ shipped product screens) as its research library. Use whenever the user asks for design inspiration or references ("what do good X screens look like"), asks to audit a system for missing screens or flows, or asks to pull a specific app's screens from Mobbin. Also use when the user says "mobbin", "inspiration", "השראה", "reference hunt", or "screen coverage". Research output is ALWAYS reference material — it feeds the extraction protocol, never code directly.
---

# Mobbin Research — Reference Library Protocol

## Why this exists
Mobbin is the studio's reference library: 600k+ real, shipped screens and flows.
Raw access to it is not a workflow. This skill defines the three sanctioned ways
the studio uses it, so every Mobbin session ends in curated references on disk —
not a pile of screenshots in context and a vibe-coded build.

## Prerequisites (check before anything)
1. The `mobbin` MCP server is registered: by the web-studio plugin's own
   `.mcp.json`, or by the project's root `.mcp.json` when the kit is vendored
   into the project. Its tools appear as `mcp__mobbin__*` (the prefix differs
   when the server comes from a plugin or a connector). Load them via ToolSearch (query: "mobbin") —
   do NOT assume tool names; discover what the server actually exposes and
   plan searches around the real toolset.
2. Mobbin MCP requires OAuth (paid Mobbin plan). If the tools are listed as
   requiring authentication, STOP and tell the Art Director:
   run `/mcp` in an interactive Claude Code session inside this project and
   complete the browser sign-in for `mobbin`. Do not improvise alternatives
   (no scraping, no Playwright against mobbin.com).

## The Three Modes

### MODE 1 — INSPIRE (`/inspire <what we're designing>`)
Input: a plain-language description of what we want to design.
1. Derive 3–5 distinct search angles: the pattern name (e.g. "pricing page",
   "onboarding checklist"), the industry, 2–3 best-in-class competitor apps,
   and the emotional register from the contract's Aesthetic and Intent blocks.
2. Search Mobbin per angle. Collect candidates broadly, then CURATE: present
   the Art Director a shortlist of 5–10 screens/flows max — for each: app
   name, screen/flow title, one line on why it's relevant to our brief.
3. WAIT for the Art Director's selection. Never auto-select.
4. Save the selected screens into the project's
   `design/references/source/mobbin/`. Then hand off by mode: PORT → `/extract`; every other
   mode → straight into the mode's own loop, tagged `TASTE` or `STRUCTURE` in
   the contract's Reference block.

### MODE 2 — AUDIT (`/screen-audit <system description or spec path>`)
Purpose: find the screens and flows we didn't think of.
Input: the system's planned or existing screen list — from `spec/`, from a
REDESIGN target repo's routes, or listed by the Art Director.
1. Establish OUR inventory first: enumerate the screens/flows we have or plan.
2. Pick 2–4 comparable products on Mobbin (same category; confirm the picks
   with the Art Director if the category is ambiguous — one question).
3. Walk each comparable's FULL screen set and flows. Build a coverage matrix:
   which screen/flow types appear across comparables vs. ours.
4. Deliver a gap report:
   - **Missing screens** — ranked by how many comparables have them. Pay
     special attention to the unglamorous ones: empty states, error states,
     loading, permissions/consent, settings, account/billing, offboarding.
   - **Missing flows** — multi-screen sequences (onboarding, KYC, recovery,
     upsell) we have no path for.
   - **Upgrade notes** — for screens we DO have, patterns the comparables use
     that ours lacks, each with its Mobbin screen reference.
5. The report is a decision document for the Art Director. Nothing enters
   `spec/` or the contract until they approve. On a redesign job, the approved
   gaps become rows in the site architecture (`design/spec/ia.md`).

### MODE 3 — PULL (`/pull-app <app name on Mobbin>`)
Purpose: exhaustive capture of one specific app as reference material.
1. Locate the app on Mobbin; confirm with the Art Director if the name
   matches more than one entry.
2. Pull ALL its screens and flows plus available metadata. Save to
   `design/references/source/mobbin/<app-slug>/` — images on disk, plus a
   `manifest.json`: per screen — title, flow membership and order, tags/
   pattern labels, and Mobbin URL. The manifest is what later sessions read;
   it must let /extract find any screen without re-searching Mobbin.
3. Large pulls: write to disk as you go, do not hold the images in context.
   Report the count and the manifest path, then offer /extract as next step.

## Laws (binding)
- Mobbin output is REFERENCE, never design. What "reference" means is
  mode-dependent, and getting this wrong is how V1 flattened its own output:
  in PORT a reference is a thing to reproduce and extraction is mandatory; in
  every other mode it is a taste or structure anchor that informs a decision,
  and extracting it converts design work into transcription.
- A screen pulled here is never reproduced by eye at pixel level. Either it
  goes through extraction, or it is used as an anchor and not copied.
- The Art Director curates; the agent shortlists. Selection of which
  references drive a project is a human decision in every mode.
- What we take from a reference is governed by the contract's Aesthetic and
  Guardrails blocks — this skill only supplies the references. Gate 1 of the
  studio (`studio` skill) still applies: a `TASTE` anchor must be genuinely
  excellent work.
- Folder discipline: pulled images live in
  `design/references/source/mobbin/`, never at the repository root.

## Context hygiene
- Research is its own session. Search + curate + save to disk here; extract
  in a fresh session per the Context Hygiene law.
- Screens are images and images are expensive. View selectively during
  curation (shortlist first from titles/metadata, then open images), and
  never load a full app pull into context at once.
