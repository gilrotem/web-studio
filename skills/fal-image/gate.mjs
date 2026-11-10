#!/usr/bin/env node
/**
 * The pre-filter. Sits between the generation loop and the folder the Art
 * Director opens, and removes the obvious misses so a human only spends
 * attention on candidates that are actually in the running.
 *
 *   node gate.mjs --in round3-medal --spec ../../spec/icon-language.md
 *   node gate.mjs --in round3-medal --dry          # calibrate, move nothing
 *
 * WHAT IT DOES NOT DO, and this is the design, not a limitation:
 *   - it never ranks aesthetics
 *   - it never picks a winner
 *   - it never deletes anything
 * Vision models agree with human reviewers about 86% of the time, which is
 * enough to sort a pile and nowhere near enough to make a call. A gate tuned
 * tight enough to have opinions silently kills the interesting candidates, so
 * this one is tuned for RECALL on objective misses and nothing else.
 *
 * --in      directory of candidates (required)
 * --spec    world-spec / contract file; its text becomes the checklist context
 * --checks  extra checks inline, semicolon separated
 * --model   vision model (default google/gemini-2.5-flash-lite)
 * --dry     report only, move nothing
 * --strict  treat "flag" as "fail" (not recommended; raises the kill rate)
 */

import { readdir, readFile, rename, mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveKey, callFal, toDataUri, ENDPOINTS } from './fal.mjs';

ENDPOINTS['any-llm-vision'] = 'https://fal.run/fal-ai/any-llm/vision';

const args = parseArgs();
if (!args.in || args.in === true) {
  console.error('usage: node gate.mjs --in DIR [--spec FILE] [--checks "a; b; c"] [--dry]');
  process.exit(1);
}

const inDir = path.resolve(args.in);
const model = args.model && args.model !== true ? args.model : 'google/gemini-2.5-flash-lite';
const dry = Boolean(args.dry);
const strict = Boolean(args.strict);

// --- the checklist -----------------------------------------------------
let specText = '';
if (args.spec && args.spec !== true && existsSync(args.spec)) {
  specText = (await readFile(args.spec, 'utf8')).slice(0, 6000);
}
const extraChecks = args.checks && args.checks !== true ? String(args.checks) : '';

// Per-image prompts, if the generator logged them.
const prompts = new Map();
const ledger = path.join(inDir, 'runs.jsonl');
if (existsSync(ledger)) {
  for (const line of (await readFile(ledger, 'utf8')).split('\n')) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      if (r.dest && r.prompt) prompts.set(path.basename(r.dest), r.prompt);
    } catch { /* a malformed line is not worth failing the run over */ }
  }
}

// Standing studio law, applied to EVERY image whatever the prompt says.
// Calibration on eight judged rounds showed that prompt-derived context alone
// is too soft: the prompts hedge their own negatives ("no OTHER text", because
// the scene deliberately wants a 7 on a chip), so the gate waved through the
// baked-in lettering that later cost a whole extra round to edit out.
const STANDING = [
  'READABLE LETTERING: no words, sentences, UI labels, nameplates, captions, chat lines, buttons or signage anywhere in the frame. A single stylised glyph or numeral on a prop (a "7" or "XL" on a chip, a suit on a card) is fine. Words are not, even when the prompt only forbade "other" text.',
  'BRAND MARKS: no logos, wordmarks or watermarks. Branding lives in the DOM layer, never inside the image.',
  'ANATOMY: hands, faces and limbs structurally intact where visible.',
];

// Some defects end a candidate; others are removed by one pass of the edit
// pipeline. Killing an otherwise-best frame over a fixable defect is the
// expensive mistake, so fixable defects flag rather than fail.
const SYSTEM = [
  'You are a production quality gate for generated imagery. You judge OBJECTIVE, checkable facts only.',
  'You do NOT judge beauty, style, taste, composition quality, or which image is best. Those belong to the Art Director.',
  '',
  'Standing rules that apply to EVERY image regardless of what the prompt says:',
  ...STANDING.map((s) => '  - ' + s),
  '',
  'Choose the verdict by whether the defect is FATAL or FIXABLE.',
  '"fail" - fatal, the frame cannot be rescued:',
  '  - anatomy clearly broken (malformed hands, extra or missing limbs, collapsed faces)',
  '  - a subject the prompt explicitly required is plainly absent',
  '  - a count the prompt specified is plainly wrong',
  '  - severe artefacts: melted geometry, duplicated subjects, heavy banding',
  '"flag" - real defect, but one edit pass removes it, so the Art Director still gets to see it:',
  '  - readable lettering, signage or a watermark',
  '  - a brand mark',
  '  - a reserved-empty zone lightly occupied by something removable',
  '  - anything questionable or arguable',
  '"pass" - nothing objectively wrong.',
  '',
  'If you are unsure, pass it. If a rule seems to contradict the prompt, prefer "flag" over "fail" and say so in the reason.',
  'Never fail an image for a composition or framing preference. That is taste, and taste is not yours.',
  'Answer with STRICT JSON only, no prose and no code fence:',
  '{"verdict":"pass|flag|fail","reason":"one short sentence"}',
].join('\n');

function checklistFor(file) {
  const parts = [];
  if (specText) parts.push('Project spec (context for what this world requires):\n' + specText);
  const p = prompts.get(path.basename(file));
  if (p) parts.push('The prompt this image was generated from:\n' + p);
  if (extraChecks) parts.push('Additional required checks:\n' + extraChecks);
  parts.push('Judge the attached image against the rules in the system message. Respond with the JSON object only.');
  return parts.join('\n\n');
}

// --- run ---------------------------------------------------------------
const files = (await readdir(inDir))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

if (!files.length) { console.log('no images in ' + inDir); process.exit(0); }

console.log('gate  ' + files.length + ' candidates  model ' + model + (dry ? '  [DRY RUN, nothing moves]' : ''));
if (specText) console.log('spec  ' + args.spec);
console.log('');

const key = await resolveKey();

async function judge(file) {
  const full = path.join(inDir, file);
  try {
    const data = await callFal('any-llm-vision', {
      model,
      system_prompt: SYSTEM,
      prompt: checklistFor(full),
      image_url: await toDataUri(full),
    }, { key, quiet: true, timeoutMs: 120000 });

    const raw = String(data.output ?? data.response ?? '').trim();
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { file, verdict: 'flag', reason: 'gate returned unparseable output' };
    const parsed = JSON.parse(m[0]);
    const verdict = ['pass', 'flag', 'fail'].includes(parsed.verdict) ? parsed.verdict : 'flag';
    return { file, verdict, reason: String(parsed.reason || '').slice(0, 160) };
  } catch (e) {
    // A gate that cannot reach its model must not block the work.
    return { file, verdict: 'flag', reason: 'gate error: ' + e.message.slice(0, 100) };
  }
}

// Modest concurrency: the gate should never be the slow part of a round.
const results = [];
const QUEUE = [...files];
async function worker() {
  while (QUEUE.length) {
    const f = QUEUE.shift();
    results.push(await judge(f));
  }
}
await Promise.all(Array.from({ length: Math.min(4, files.length) }, worker));
results.sort((a, b) => a.file.localeCompare(b.file));

const buckets = { pass: [], flag: [], fail: [] };
for (const r of results) buckets[r.verdict].push(r);

for (const r of results) {
  const mark = r.verdict === 'pass' ? 'pass' : r.verdict === 'flag' ? 'FLAG' : 'FAIL';
  console.log('  ' + mark + '  ' + r.file + (r.verdict === 'pass' ? '' : '  - ' + r.reason));
}

// --- move, never delete ------------------------------------------------
if (!dry) {
  const rejects = path.join(inDir, 'rejects');
  const flagged = path.join(inDir, 'flagged');
  const toReject = strict ? [...buckets.fail, ...buckets.flag] : buckets.fail;
  const toFlag = strict ? [] : buckets.flag;

  if (toReject.length) await mkdir(rejects, { recursive: true });
  if (toFlag.length) await mkdir(flagged, { recursive: true });

  for (const r of toReject) await rename(path.join(inDir, r.file), path.join(rejects, r.file));
  for (const r of toFlag) await rename(path.join(inDir, r.file), path.join(flagged, r.file));

  await appendFile(
    path.join(inDir, 'gate.jsonl'),
    results.map((r) => JSON.stringify({ at: new Date().toISOString(), model, ...r })).join('\n') + '\n',
    'utf8',
  );
}

const kept = buckets.pass.length;
console.log('');
console.log('  ' + kept + ' to review, ' + buckets.flag.length + ' flagged, ' + buckets.fail.length + ' rejected'
  + (dry ? '  (dry run - nothing moved)' : '  -> rejects/ and flagged/, never deleted'));
if (!dry && buckets.fail.length) console.log('  check rejects/ once this week. If the gate killed something good, loosen the checks.');
