#!/usr/bin/env node
/**
 * Run a whole round from one file, so the expensive model writes every prompt
 * once and then leaves.
 *
 *   node batch.mjs --file prompts.json [--dry] [--only tag,tag] [--concurrency 3]
 *
 * It does NOT re-implement generation. It spawns generate.mjs / edit.mjs per
 * item, so every cap, route, refusal and ledger line behaves exactly as it does
 * when you run them by hand. If a guard changes there, it changes here.
 *
 * prompts.json:
 * {
 *   "out":  "build/round5-cast",      // default output dir for every item
 *   "job":  "candidate",              // default job
 *   "size": "2048x1152",              // default size
 *   "items": [
 *     { "tag": "shark-a", "prompt": "...", "n": 2 },
 *     { "tag": "crab",    "prompt": "...", "job": "plate", "size": "1600x1600" },
 *     { "tag": "fix-1",   "prompt": "...", "job": "edit", "image": "build/round4/shark.jpg" }
 *   ]
 * }
 *
 * An item with "image" routes to edit.mjs; everything else to generate.mjs.
 *
 * The cap: before anything is sent, every item is priced with --dry and the
 * round's total is checked against the project's imagery cap. A round that
 * would pass it is refused whole (exit 2); nothing is half-spent. Each item
 * is still checked again on its own when it runs.
 * Per-item keys override the top-level defaults. Unknown keys are passed
 * through as --key value, so --style, --colors, --ref, --seed all work.
 */

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, str, enforceCap } from './fal.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs();

const file = str(args.file) || str(args._0);
if (!file) {
  console.error('usage: node batch.mjs --file prompts.json [--dry] [--only tag,tag] [--concurrency 3]');
  process.exit(1);
}

let spec;
try {
  spec = JSON.parse(await readFile(file, 'utf8'));
} catch (e) {
  console.error('cannot read ' + file + ': ' + e.message);
  process.exit(1);
}
if (!Array.isArray(spec.items) || !spec.items.length) {
  console.error(file + ' has no "items" array');
  process.exit(1);
}

const dry = Boolean(args.dry);
const only = str(args.only) ? new Set(str(args.only).split(',').map((s) => s.trim())) : null;
// fal allows 10 concurrent; 3 keeps headroom for anything else running.
const concurrency = Math.max(1, Math.min(6, Number(args.concurrency) || 3));

// Keys consumed by batch itself; everything else becomes a CLI flag.
const OWN = new Set(['tag', 'prompt', 'image', 'job', 'size', 'out', 'n']);

function argvFor(item, forceDry = false) {
  const out = item.out ?? spec.out ?? '.';
  const job = item.job ?? spec.job;
  const size = item.size ?? spec.size;
  const isEdit = Boolean(item.image);

  const a = [];
  if (isEdit) a.push('--image', item.image);
  if (item.prompt) a.push('--prompt', item.prompt);
  if (job) a.push('--job', job);
  if (size) a.push('--size', size);
  a.push('--out', out);
  if (item.tag) a.push('--tag', item.tag);
  if (!isEdit && item.n) a.push('--n', String(item.n));

  for (const [k, v] of Object.entries(item)) {
    if (OWN.has(k)) continue;
    for (const one of [].concat(v)) {
      if (one === true) a.push('--' + k);
      else a.push('--' + k, String(one));
    }
  }
  if (dry || forceDry) a.push('--dry');
  return { tool: isEdit ? 'edit.mjs' : 'generate.mjs', argv: a };
}

const items = spec.items.filter((it) => !only || only.has(it.tag));
if (!items.length) { console.error('no items matched --only'); process.exit(1); }

console.log('batch ' + items.length + ' item(s) from ' + file
  + '  concurrency ' + concurrency + (dry ? '  [DRY RUN]' : ''));
console.log('');

/** Price one item with --dry. Returns { tag, usd, code, out }. */
function price(item) {
  const { tool, argv } = argvFor(item, true);
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(HERE, tool), ...argv], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { out += d; });
    p.on('close', (code) => {
      const m = out.match(/^est\s+\$([\d.]+)(?: x \d+ = \$([\d.]+))?/m);
      resolve({ tag: item.tag, usd: m ? Number(m[2] ?? m[1]) : 0.001, code, out });
    });
  });
}

const priced = await Promise.all(items.map(price));
const broken = priced.filter((p) => p.code !== 0 && !/^REFUSED/m.test(p.out));
if (broken.length) {
  for (const b of broken) {
    console.log('FAIL ' + (b.tag || '(untagged)') + ' (could not be priced)');
    for (const line of b.out.trim().split('\n')) console.log('       ' + line);
  }
  process.exit(1);
}
const total = priced.reduce((n, p) => n + p.usd, 0);
console.log('round est $' + total.toFixed(4) + ' for ' + items.length + ' item(s)');
enforceCap(total, 'this round');
console.log('');

function run(item) {
  const { tool, argv } = argvFor(item);
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(HERE, tool), ...argv], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { out += d; });
    p.on('close', (code) => {
      const label = (item.tag || '(untagged)') + '  [' + tool.replace('.mjs', '') + ']';
      console.log(code === 0 ? 'OK   ' + label : 'FAIL ' + label);
      for (const line of out.trim().split('\n')) if (line.trim()) console.log('       ' + line);
      resolve({ tag: item.tag, ok: code === 0 });
    });
  });
}

const queue = [...items];
const results = [];
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  while (queue.length) results.push(await run(queue.shift()));
}));

const failed = results.filter((r) => !r.ok);
console.log('');
console.log('  ' + (results.length - failed.length) + '/' + results.length + ' ok'
  + (failed.length ? '  failed: ' + failed.map((f) => f.tag).join(', ') : ''));
if (failed.length) {
  console.log('  re-run just those:  node batch.mjs --file ' + file + ' --only ' + failed.map((f) => f.tag).join(','));
  process.exit(1);
}
