#!/usr/bin/env node
/**
 * fal-guard — PreToolUse hook on Bash, Write and Edit, shipped with the
 * web-studio plugin (hooks/hooks.json) and active in every project that has
 * the plugin enabled. A vendored project wires it in its own settings.
 *
 * Why this exists: on 2026-09-20 a session in a client project wanted a vector
 * illustration, found no route for it in the shared toolkit, and wrote its own
 * fal caller in ten lines. It re-generated 36 images from scratch instead of
 * editing, spent $2.88, and left no ledger line — so nothing about it was
 * visible until the credit ran out. Documentation did not prevent that, because
 * documentation is advice. This is the part that is not advice.
 *
 * The rule: fal is reached through the kit's `skills/fal-image/` and nowhere
 * else (in the plugin cache, in a vendored `.claude/skills/fal-image/`, or in the
 * kit's own repository). Inside that directory everything is allowed, including
 * adding a new model or endpoint. Outside it, a direct call is refused before
 * it runs.
 *
 * Contract:
 *   "deny"  -> the call does not happen; the reason tells the agent what to use.
 *   silence -> no opinion; the normal permission rules decide.
 *
 * It never returns "allow": it can only pull the brake, never widen anything.
 */

import { readFileSync } from "node:fs";

const TOOLKIT = "skills/fal-image";

// A fal endpoint, in any of its spellings.
const FAL_ENDPOINT = /https?:\/\/(?:queue\.)?fal\.run\b|https?:\/\/api\.fal\.ai\b|['"`]@fal-ai\/client['"`]/i;

// Files where a fal call would actually run. A .md that merely mentions a URL
// is documentation, and documentation is not a bypass.
const CODE_FILE = /\.(mjs|cjs|js|ts|tsx|py|sh|ps1|rb|php)$/i;

// A Bash command that PERFORMS a request, as opposed to one that searches for
// the string. `grep -rn "fal.run" .` must stay free.
const BASH_PERFORMS = [
  /\bcurl\b[^|;&]*fal\.run/i,
  /\bcurl\b[^|;&]*api\.fal\.ai/i,
  /\bwget\b[^|;&]*fal\.run/i,
  /\bnode\s+(-e|--eval)\b[\s\S]*fal\.run/i,
  /\bnode\s+(-e|--eval)\b[\s\S]*api\.fal\.ai/i,
  /\bpython3?\s+-c\b[\s\S]*fal\.run/i,
  /\bpython3?\s+-c\b[\s\S]*api\.fal\.ai/i,
];

const norm = (p) => String(p || "").replace(/\\/g, "/");
const insideToolkit = (p) => norm(p).includes(TOOLKIT);

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

const USE_INSTEAD =
  " Use the kit's toolkit instead (the fal-image skill): `generate.mjs --routes` lists every job class, " +
  "`edit.mjs` covers image-in work, `batch.mjs --file prompts.json` runs a whole round. " +
  "They check the project's imagery cap, cap the size to one billing unit, write every paid call to " +
  "design/spend.jsonl, and never silently change model. If no route fits what you need, the fix is a new " +
  "model in " + TOOLKIT + "/fal.mjs with a job in routes.mjs, made in the kit's own repository; from a " +
  "project, write the need under 'For the kit' in the project's status.";

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let tool = "";
  let input = {};
  try {
    const j = JSON.parse(raw);
    tool = j?.tool_name ?? "";
    input = j?.tool_input ?? {};
  } catch {
    process.exit(0); // unparseable input is not our business
  }

  if (tool === "Bash") {
    const cmd = String(input.command || "");
    if (!cmd) process.exit(0);
    if (insideToolkit(cmd)) process.exit(0); // running or editing the toolkit itself

    if (BASH_PERFORMS.some((re) => re.test(cmd))) {
      deny(
        "fal-guard: this command calls fal.ai directly. Ad-hoc callers bypass the size cap, the " +
          "cost ledger and the model routing, which is how a round once cost $2.88 with no record." +
          USE_INSTEAD
      );
    }

    // Blocking the WRITING of a bypass is not enough: a caller written before
    // this guard existed is still sitting on disk and `node that-file.mjs`
    // carries no fal URL in the command string. So look at what is about to be
    // executed. (A scratch Recraft caller left in a project's tools/ was exactly this case.)
    for (const m of cmd.matchAll(/\b(?:node|python3?|bun|deno\s+run)\s+(?:[-\w=]+\s+)*["']?([^\s"';|&]+\.(?:mjs|cjs|js|ts|py))["']?/gi)) {
      const script = m[1];
      if (insideToolkit(script)) continue;
      let body = "";
      try {
        body = readFileSync(script, "utf8");
      } catch {
        continue; // not a path we can resolve from here; nothing to judge
      }
      if (FAL_ENDPOINT.test(body)) {
        deny(
          "fal-guard: " + script + " contains a direct fal.ai call and sits outside " + TOOLKIT +
            ". Running it would spend without a ledger line. Delete it, or move what it does into " +
            "the toolkit as a job class." + USE_INSTEAD
        );
      }
    }
    process.exit(0);
  }

  if (tool === "Write" || tool === "Edit" || tool === "MultiEdit") {
    const file = norm(input.file_path);
    if (!file || insideToolkit(file)) process.exit(0);
    if (!CODE_FILE.test(file)) process.exit(0); // docs and records may name the endpoint

    const body = [
      input.content,
      input.new_string,
      ...(Array.isArray(input.edits) ? input.edits.map((e) => e?.new_string) : []),
    ]
      .filter(Boolean)
      .join("\n");

    if (body && FAL_ENDPOINT.test(body)) {
      deny(
        "fal-guard: this writes a direct fal.ai caller to " + file + ", outside " + TOOLKIT + "." +
          USE_INSTEAD
      );
    }
    process.exit(0);
  }

  process.exit(0);
});
