#!/usr/bin/env node
/**
 * The pre-filter. OPTIONAL. Sorts a folder of candidates so a human spends
 * attention only on the ones actually in the running.
 *
 *   node gate.mjs --in round3-medal --spec ../../spec/icon-language.md
 *   node gate.mjs --in round3-medal --dry          # calibrate, move nothing
 *
 * What it costs, and what it does not save: every call is $0.01 on fal's vision
 * endpoint, and it runs AFTER the generation is paid for. It saves review time,
 * never fal spend. Images are judged in batches (default 4 per call), so a
 * round of three costs one cent, not three.
 *
 * WHAT IT DOES NOT DO, and this is the design, not a limitation:
 *   - it never ranks aesthetics
 *   - it never picks a winner
 *   - it never deletes anything
 * Vision models agree with human reviewers well enough to sort a pile and
 * nowhere near enough to make a call, so this is tuned for RECALL on objective
 * misses and nothing else.
 *
 * --in      directory of candidates (required)
 * --spec    world-spec / contract file; its text becomes the checklist context
 * --checks  extra checks inline, semicolon separated
 * --batch   images per vision call, 1-6 (default 4)
 * --model   vision model (default google/gemini-2.5-flash-lite)
 * --dry     report only, move nothing (the vision calls still run and still cost)
 *
 * The calls are paid, so the run is checked against the project's imagery cap
 * first (fal.mjs, "the cap") and every call is a line in design/spend.jsonl.
 * --strict  treat "flag" as "fail" (not recommended; raises the kill rate)
 */

import { readdir, readFile, rename, mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseArgs, str, resolveKey, callFal, toDataUri, actualCost, MODELS, enforceCap, logSpend } from './fal.mjs';

const args = parseArgs();
if (!str(args.in)) {
  console.error('usage: node gate.mjs --in DIR [--spec FILE] [--checks "a; b; c"] [--batch 4] [--dry]');
  process.exit(1);
}

const inDir = path.resolve(args.in);
const model = str(args.model, 'google/gemini-2.5-flash-lite');
const dry = Boolean(args.dry);
const strict = Boolean(args.strict);
const batchSize = Math.max(1, Math.min(6, Number(args.batch) || 4));

// --- the checklist -----------------------------------------------------
let specText = '';
if (str(args.spec) && existsSync(args.spec)) {
  specText = (await readFile(args.spec, 'utf8')).slice(0, 6000);
}
const extraChecks = str(args.checks, '');

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

// Standing law, applied to EVERY image whatever the prompt says. Prompts hedge
// their own negatives ("no OTHER text", because the scene wants a 7 on a chip),
// so prompt context alone waves baked-in lettering through.
//
// One rule cannot serve every project: a stylised illustrated world bans
// lettering outright, a photoreal car necessarily carries a plate. A project
// overrides in `design/gate.config.json`:
// { "standing": { "lettering": "...", "brand": "...", "anatomy": "..." } }.
const STANDING_DEFAULT = {
  lettering: 'READABLE LETTERING: no words, sentences, UI labels, nameplates, captions, chat lines, buttons or signage anywhere in the frame. A single stylised glyph or numeral on a prop (a numeral on a token, a suit on a card) is fine. Words are not, even when the prompt only forbade "other" text.',
  brand: 'BRAND MARKS: no logos, wordmarks or watermarks. Branding lives in the DOM layer, never inside the image.',
  anatomy: 'ANATOMY: hands, faces and limbs structurally intact where visible.',
};

/** Walk up from the candidate folder looking for the project's gate config. */
async function loadStanding(fromDir) {
  let dir = path.resolve(fromDir);
  for (let i = 0; i < 8; i += 1) {
    const cfg = [path.join(dir, 'gate.config.json'), path.join(dir, 'design', 'gate.config.json')].find((p) => existsSync(p));
    if (cfg) {
      try {
        const json = JSON.parse(await readFile(cfg, 'utf8'));
        return [{ ...STANDING_DEFAULT, ...(json.standing || {}) }, cfg];
      } catch (e) {
        console.log('note: ignoring unreadable ' + cfg + ' (' + e.message + ')');
      }
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return [STANDING_DEFAULT, null];
}

const [STANDING, standingFrom] = await loadStanding(inDir);

// The model DETECTS; this file DECIDES. Asking a vision model for the verdict
// itself proved unstable: the same three images came back pass/pass/fail,
// flag/flag/flag and flag/flag/fail on three runs (21/9/2026). So the model
// only names the worst defect from a closed list, at temperature 0, and the
// verdict follows from that list by fixed policy below.
//
// Fatal defects end a candidate. Fixable ones are removed by one edit pass,
// and killing an otherwise-best frame over a fixable defect is the expensive
// mistake, so they only flag.
const FATAL = new Set(['anatomy', 'missing-subject', 'wrong-count', 'artefact']);
const FIXABLE = new Set(['lettering', 'brand', 'zone', 'other']);

const SYSTEM = [
  'You are a production quality inspector for generated imagery. You report OBJECTIVE, checkable defects only.',
  'You do NOT judge beauty, style, taste, composition quality, or which image is best.',
  '',
  'Standing rules that apply to EVERY image regardless of what the prompt says:',
  ...Object.values(STANDING).filter(Boolean).map((s) => '  - ' + s),
  '',
  'For each image report its single WORST defect as one of these codes:',
  '  none            - nothing objectively wrong',
  '  anatomy         - hands, faces or limbs clearly malformed',
  '  missing-subject - something the prompt explicitly required is plainly absent',
  '  wrong-count     - a count the prompt specified is plainly wrong',
  '  artefact        - melted geometry, duplicated subjects, heavy banding',
  '  lettering       - readable words, UI labels, captions or signage that break the lettering rule',
  '  brand           - a logo, wordmark or watermark',
  '  zone            - an area the prompt reserved as empty is occupied',
  '  other           - a real objective defect not listed above',
  'If you are unsure whether something is a defect, report none. Composition and framing are never defects.',
  'Several images may be attached, numbered in the order given. Judge each on its own; never compare them.',
  'Answer with a STRICT JSON array only, one object per image in order, no prose and no code fence:',
  '[{"image":1,"defect":"none|anatomy|missing-subject|wrong-count|artefact|lettering|brand|zone|other","reason":"one short sentence"}]',
].join('\n');

function verdictOf(defect) {
  if (defect === 'none') return 'pass';
  if (FATAL.has(defect)) return 'fail';
  if (FIXABLE.has(defect)) return 'flag';
  return 'flag';
}

function checklistFor(batch) {
  const parts = [];
  if (specText) parts.push('Project spec (context for what this world requires):\n' + specText);
  batch.forEach((file, i) => {
    const p = prompts.get(file);
    parts.push('Image ' + (i + 1) + ' (' + file + ')' + (p ? ', generated from this prompt:\n' + p : ': no prompt on record.'));
  });
  if (extraChecks) parts.push('Additional required checks for every image:\n' + extraChecks);
  parts.push('Judge the ' + batch.length + ' attached image(s) against the rules in the system message. Respond with the JSON array only.');
  return parts.join('\n\n');
}

// --- run ---------------------------------------------------------------
const files = (await readdir(inDir))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

if (!files.length) { console.log('no images in ' + inDir); process.exit(0); }

const batches = [];
for (let i = 0; i < files.length; i += batchSize) batches.push(files.slice(i, i + batchSize));

console.log('gate  ' + files.length + ' candidates in ' + batches.length + ' call(s)  est $'
  + (batches.length * MODELS.vision.rate).toFixed(2) + '  model ' + model + (dry ? '  [DRY RUN, nothing moves]' : ''));
if (specText) console.log('spec  ' + args.spec);
if (standingFrom) console.log('rules ' + path.relative(process.cwd(), standingFrom));
console.log('');

enforceCap(batches.length * MODELS.vision.rate, 'gate (' + batches.length + ' vision call(s))');
const key = await resolveKey();
let spent = 0;

async function judgeBatch(batch) {
  const soft = (reason) => batch.map((file) => ({ file, verdict: 'flag', reason }));
  try {
    const data = await callFal('vision', {
      model,
      system_prompt: SYSTEM,
      prompt: checklistFor(batch),
      image_urls: await Promise.all(batch.map((f) => toDataUri(path.join(inDir, f)))),
      temperature: 0,
    }, { key, quiet: true, waitMs: 180000 });
    const usd = actualCost('vision', data);
    spent += usd ?? MODELS.vision.rate;
    await logSpend({ tool: 'gate', job: 'gate', model: 'vision', usd: usd ?? MODELS.vision.rate, usd_source: usd !== null ? 'fal meter' : 'estimate', fal_request_id: data.__fal?.requestId ?? null, dest: inDir });

    const raw = String(data.output ?? data.response ?? '').trim();
    // A single image sometimes comes back as a bare object; accept both.
    const m = raw.match(/\[[\s\S]*\]/) ?? raw.match(/\{[\s\S]*\}/);
    if (!m) return soft('gate returned unparseable output');
    const arr = [].concat(JSON.parse(m[0]));
    return batch.map((file, i) => {
      const r = arr.find((x) => Number(x.image) === i + 1) ?? arr[i];
      if (!r) return { file, verdict: 'flag', defect: null, reason: 'no verdict returned for this image' };
      const defect = String(r.defect || 'other').toLowerCase();
      return { file, verdict: verdictOf(defect), defect, reason: String(r.reason || '').slice(0, 160) };
    });
  } catch (e) {
    // A gate that cannot reach its model must not block the work.
    return soft('gate error: ' + e.message.slice(0, 100));
  }
}

const results = (await Promise.all(batches.map(judgeBatch))).flat();
results.sort((a, b) => a.file.localeCompare(b.file));

const buckets = { pass: [], flag: [], fail: [] };
for (const r of results) buckets[r.verdict].push(r);

for (const r of results) {
  const mark = r.verdict === 'pass' ? 'pass' : r.verdict === 'flag' ? 'FLAG' : 'FAIL';
  console.log('  ' + mark + '  ' + r.file + (r.verdict === 'pass' ? '' : '  - [' + (r.defect ?? '?') + '] ' + r.reason));
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
}

// The ledger is written on dry runs too: a calibration run costs money as well.
await appendFile(
  path.join(inDir, 'gate.jsonl'),
  results.map((r) => JSON.stringify({ at: new Date().toISOString(), model, batch: batchSize, dry, ...r })).join('\n') + '\n',
  'utf8',
);

console.log('');
console.log('  ' + buckets.pass.length + ' to review, ' + buckets.flag.length + ' flagged, ' + buckets.fail.length + ' rejected'
  + (dry ? '  (dry run - nothing moved)' : '  -> rejects/ and flagged/, never deleted'));
console.log('  gate cost $' + spent.toFixed(2));
