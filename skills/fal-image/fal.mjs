#!/usr/bin/env node
/**
 * The kit's single fal.ai core. Every image tool imports this file; nothing
 * talks to fal directly (the plugin's fal-guard hook refuses it).
 *
 * Nothing here decides taste. It decides endpoints, request shapes, sizes,
 * money and bookkeeping: the cap, the project's spend ledger, the round record.
 */

import { writeFile, mkdir, readFile, appendFile } from 'node:fs/promises';
import { existsSync, openSync, readSync, closeSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- billing geometry --------------------------------------------------
// fal bills Seedream 5 Pro (t2i AND edit) by TOTAL AREA: 1 unit up to and
// including 1536x1536 worth of pixels, 2 units above it, no third tier.
export const TIER_PX = 1536 * 1536;     // 2,359,296
export const PRO_CEIL_PX = 2048 * 2048; // documented ceiling, not enforced
export const SAFE_WIDE = { width: 2048, height: 1152 }; // exactly TIER_PX

export function tierOf(px) {
  if (px > PRO_CEIL_PX) return 'UPPER (2 units, above the documented ceiling)';
  if (px > TIER_PX) return 'UPPER (2 units)';
  return 'lower (1 unit)';
}

// --- models ------------------------------------------------------------
// id    = fal endpoint id (the Seedream v5 ids carry NO `fal-ai/` prefix; the
//         prefixed spelling 404s).
// rate  = USD per billing unit, read from fal's pricing API
//         (GET https://api.fal.ai/v1/models/pricing?endpoint_id=<id>) on
//         2026-09-21. The invoice is the authority; re-check when fal reprices.
// unit  = what the rate is per, so the cost line can say what it is doing.
export const MODELS = {
  'seedream-pro':       { id: 'bytedance/seedream/v5/pro/text-to-image', rate: 0.0675, unit: 'area unit', shape: 'seedream' },
  'seedream-pro-edit':  { id: 'bytedance/seedream/v5/pro/edit',          rate: 0.0675, unit: 'area unit', shape: 'seedream-edit' },
  'seedream-lite':      { id: 'bytedance/seedream/v5/lite/text-to-image', rate: 0.035, unit: 'image', shape: 'seedream' },
  'seedream-lite-edit': { id: 'bytedance/seedream/v5/lite/edit',         rate: 0.035, unit: 'image', shape: 'seedream-edit' },
  'seedream-4':         { id: 'fal-ai/bytedance/seedream/v4/text-to-image', rate: 0.03, unit: 'image', shape: 'seedream' },
  'flux-ultra':         { id: 'fal-ai/flux-pro/v1.1-ultra',              rate: 0.06, unit: 'image', shape: 'flux-ultra' },
  'flux-fill':          { id: 'fal-ai/flux-pro/v1/fill',                 rate: 0.05, unit: 'megapixel', shape: 'flux-fill' },
  'recraft-v3':         { id: 'fal-ai/recraft/v3/text-to-image',         rate: 0.04, unit: 'image (vector styles bill 2x)', shape: 'recraft' },
  birefnet:             { id: 'fal-ai/birefnet/v2',                      rate: 0.0008, unit: 'compute second', shape: 'cutout' },
  vision:               { id: 'fal-ai/any-llm/vision',                   rate: 0.01, unit: 'request', shape: 'vision' },
};

export function modelOf(name) {
  const m = MODELS[name];
  if (!m) throw new Error('unknown model "' + name + '". Known: ' + Object.keys(MODELS).join(', '));
  return m;
}

/** Pre-call estimate. Area-billed models use the tier; the rest are flat. */
export function estimateCost(name, px) {
  const m = MODELS[name];
  if (!m) return null;
  if (m.unit === 'area unit') return m.rate * (px && px > TIER_PX ? 2 : 1);
  if (m.unit === 'megapixel') return px ? m.rate * Math.ceil(px / 1e6) : null;
  if (m.unit.startsWith('image') || m.unit === 'request') return m.rate;
  return null;
}

/** Actual cost from fal's own `x-fal-billable-units`. Null when fal sent none. */
export function actualCost(name, data) {
  const units = data?.__fal?.billable;
  const m = MODELS[name];
  if (!units || !m) return null;
  return units * m.rate;
}

// --- credentials -------------------------------------------------------
// The key lives with the PROJECT, never with the kit: .env.local / .env (both
// git-ignored) in the directory the tool is run from, or in any parent of it.
// The toolkit may sit in a plugin cache or in a project's .claude/skills/, so
// its own location says nothing about the project. The folder three levels up
// is checked last, for a kit vendored at <root>/.claude/skills/fal-image/.
function keyFileCandidates() {
  const out = [];
  let dir = process.cwd();
  for (;;) {
    for (const f of ['.env.local', '.env']) out.push(path.join(dir, f));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const vendoredRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  for (const f of ['.env.local', '.env']) out.push(path.join(vendoredRoot, f));
  return [...new Set(out)];
}

async function fromKeyFile(name) {
  for (const file of keyFileCandidates()) {
    if (!existsSync(file)) continue;
    const text = await readFile(file, 'utf8');
    // [ \t] not \s: with \s an empty `NAME=` line swallowed the newline and returned the next line.
    const m = text.match(new RegExp('^[ \\t]*' + name + '[ \\t]*=[ \\t]*(\\S.*?)[ \\t]*\\r?$', 'm'));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

/** Resolve a named credential from the environment, then the project's env file. */
export async function resolveKey(names = ['FAL_AI_API_KEY', 'FAL_KEY']) {
  for (const n of names) if (process.env[n]) return process.env[n];
  for (const n of names) {
    const v = await fromKeyFile(n);
    if (v) return v;
  }
  throw new Error('no credential found. Set ' + names.join(' or ') + ' in the environment or in the project\'s git-ignored .env.local');
}

// --- the cap -------------------------------------------------------------
// One home for the cap: the line `**Imagery budget:**` in the project's
// design/spec/contract.md. Accepted values: `USD <n> per project`,
// `USD <n> per month`, `none` (nothing may be generated). `null` or a missing
// line means no cap is set, and a paid run is refused until one is.
// Spend is read from the project's ledger, design/spend.jsonl, one line per
// paid call. A run whose estimate would pass the cap is refused before it is
// sent; raising the cap is the Art Director's change to the contract line.

export const CONTRACT = path.join('design', 'spec', 'contract.md');
export const SPEND_LEDGER = path.join('design', 'spend.jsonl');

/** The project root: the nearest folder at or above cwd holding design/spec/contract.md. */
export function findProject(start = process.cwd()) {
  let dir = path.resolve(start);
  for (;;) {
    if (existsSync(path.join(dir, CONTRACT))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Parse the contract's imagery budget line. */
export function parseCapLine(text) {
  const line = String(text).split(/\r?\n/).find((l) => /^\s*\*\*Imagery budget:\*\*/i.test(l));
  if (!line) return { usd: null, reason: 'the contract has no "**Imagery budget:**" line' };
  const value = line.replace(/^\s*\*\*Imagery budget:\*\*/i, '').replace(/`/g, '').trim();
  const head = value.split('(')[0].trim();
  if (/^none\b/i.test(head)) return { usd: 0, period: 'project', line: value };
  const m = head.match(/(?:USD|\$)\s*(\d+(?:\.\d+)?)/i) || head.match(/(\d+(?:\.\d+)?)\s*(?:USD|\$)/i);
  if (!m) return { usd: null, reason: 'the imagery budget is not set ("' + head + '")' };
  return { usd: Number(m[1]), period: /month/i.test(head) ? 'month' : 'project', line: head };
}

export function readCap(project) {
  if (!project) return { usd: null, reason: 'no project found: run from the project root (no ' + CONTRACT.split(path.sep).join('/') + ' at or above ' + process.cwd() + ')' };
  return parseCapLine(readFileSync(path.join(project, CONTRACT), 'utf8'));
}

/** USD already spent under the cap's period, from design/spend.jsonl. */
export function spentSoFar(project, period = 'project', now = new Date()) {
  const file = path.join(project, SPEND_LEDGER);
  if (!existsSync(file)) return 0;
  const month = now.toISOString().slice(0, 7);
  let sum = 0;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      if (period === 'month' && !String(r.at || '').startsWith(month)) continue;
      sum += Number(r.usd) || 0;
    } catch { /* a malformed line is reported by nobody; it costs nothing */ }
  }
  return sum;
}

/**
 * The gate every paid run passes before anything is sent, dry runs included,
 * so a dry run shows the refusal too. Exits the process with code 2 on refusal.
 */
export function enforceCap(estimateUsd, label = 'this run') {
  const project = findProject();
  const cap = readCap(project);
  const est = Math.max(Number(estimateUsd) || 0, 0.001); // an unpriced call still costs something
  if (cap.usd === null) {
    console.error('REFUSED: ' + label + ' is not run. ' + cap.reason + '. Set the contract line, e.g. "**Imagery budget:** USD 40 per project", then run again.');
    process.exit(2);
  }
  const spent = spentSoFar(project, cap.period);
  const left = cap.usd - spent;
  const where = CONTRACT.split(path.sep).join('/');
  if (est > left + 1e-9) {
    console.error('REFUSED: ' + label + ' (est $' + est.toFixed(4) + ') would pass the imagery cap: $' + spent.toFixed(4)
      + ' spent of "' + cap.line + '" (' + where + '), $' + Math.max(0, left).toFixed(4) + ' left.'
      + ' Spending past the cap is the Art Director\'s call: the contract line changes first, then the run.');
    process.exit(2);
  }
  console.log('cap  "' + cap.line + '": $' + spent.toFixed(4) + ' spent, $' + left.toFixed(4) + ' left, this run est $' + est.toFixed(4));
  return { project, cap, spent, left };
}

// --- image dimensions, without a dependency ----------------------------
/**
 * Read width/height from a file header. The JPEG branch SEEKS the marker chain
 * rather than scanning a fixed window, because fal attaches ~95KB of APP11
 * content-credential metadata ahead of the SOF marker.
 */
export function dimsOf(file) {
  if (!existsSync(file)) return null;
  const fd = openSync(file, 'r');
  try {
    const b = Buffer.alloc(65536);
    const n = readSync(fd, b, 0, 65536, 0);
    if (n < 24) return null;

    if (b.readUInt32BE(0) === 0x89504e47) {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const f = b.toString('ascii', 12, 16);
      if (f === 'VP8X') return { width: (b.readUIntLE(24, 3) & 0xffffff) + 1, height: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
      if (f === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      if (f === 'VP8L') { const v = b.readUInt32LE(21); return { width: (v & 0x3fff) + 1, height: ((v >> 14) & 0x3fff) + 1 }; }
      return null;
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      const total = statSync(file).size;
      const h = Buffer.alloc(9);
      let o = 2;
      while (o + 9 <= total) {
        if (readSync(fd, h, 0, 9, o) < 9) break;
        if (h[0] !== 0xff) { o += 1; continue; }
        const m = h[1];
        if (m === 0xda) break;                                  // scan data starts
        if (m === 0x01 || (m >= 0xd0 && m <= 0xd9)) { o += 2; continue; }
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return { height: h.readUInt16BE(5), width: h.readUInt16BE(7) };
        }
        const seg = h.readUInt16BE(2);
        if (seg < 2) break;
        o += 2 + seg;
      }
    }
    return null;
  } finally { closeSync(fd); }
}

/** Shrink proportionally to sit inside the lower tier, on 8px steps. */
export function capToTier({ width, height }, ceiling = TIER_PX) {
  if (width * height <= ceiling) return { width, height };
  const s = Math.sqrt(ceiling / (width * height));
  return {
    width: Math.max(8, Math.floor((width * s) / 8) * 8),
    height: Math.max(8, Math.floor((height * s) / 8) * 8),
  };
}

/** Nearest aspect-ratio string FLUX ultra accepts, for a WxH request. */
export function fluxRatio({ width, height }) {
  const opts = ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'];
  const val = (o) => { const [a, b] = o.split(':').map(Number); return a / b; };
  const want = width / height;
  return opts.reduce((best, o) => (Math.abs(val(o) - want) < Math.abs(val(best) - want) ? o : best));
}

// --- the call ----------------------------------------------------------
/**
 * Submit through fal's QUEUE and poll the same request until it finishes.
 *
 * Why the queue and not fal.run: on the synchronous route a slow job that hits
 * our client timeout is abandoned by us but NOT by fal. It still runs and still
 * bills, and a retry then pays for a second one. On the queue a request id
 * exists from the first second, so waiting longer never costs anything.
 *
 * Only the SUBMIT is retried, and only on 429 / 5xx / network failure, where no
 * job was accepted. A 4xx is a request error; repeating it changes nothing.
 * The model is never substituted: a silent downgrade is a quality regression
 * dressed as resilience.
 */
export async function callFal(name, body, { key, waitMs = 600000, quiet = false } = {}) {
  const m = modelOf(name);
  const k = key || (await resolveKey());
  const headers = { Authorization: 'Key ' + k, 'Content-Type': 'application/json' };
  const say = (s) => { if (!quiet) console.log('  ' + s); };

  let sub;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    let res;
    try {
      res = await fetch('https://queue.fal.run/' + m.id, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
    } catch (e) {
      say('submit attempt ' + attempt + ' network error - ' + e.message);
      await sleep(2000 * attempt);
      continue;
    }
    if (res.ok) { sub = await res.json(); break; }
    const text = (await res.text()).slice(0, 300);
    if (res.status === 429 || res.status >= 500) {
      say('submit attempt ' + attempt + ' got ' + res.status + ', retrying (no job was accepted)');
      await sleep(3000 * attempt);
      continue;
    }
    throw new Error(name + ' rejected the request: ' + res.status + ' ' + text);
  }
  if (!sub?.request_id) throw new Error(name + ': submit failed 4 times, nothing was billed');

  const statusUrl = sub.status_url;
  const responseUrl = sub.response_url;
  const started = Date.now();
  while (true) {
    await sleep(1500);
    let st;
    try {
      const r = await fetch(statusUrl, { headers, signal: AbortSignal.timeout(30000) });
      st = r.ok ? await r.json() : null;
    } catch { st = null; }                              // a status blip is not a failure
    if (st?.status === 'COMPLETED') break;
    if (Date.now() - started > waitMs) {
      throw new Error(name + ' still running after ' + Math.round(waitMs / 1000) + 's. It is NOT resubmitted. Fetch it later: ' + responseUrl);
    }
  }

  const res = await fetch(responseUrl, { headers, signal: AbortSignal.timeout(60000) });
  const text = await res.text();
  if (!res.ok) throw new Error(name + ' failed: ' + res.status + ' ' + text.slice(0, 300) + ' (request ' + sub.request_id + ')');
  const data = JSON.parse(text);
  // fal reports what it actually charged. Every caller logs this, not a guess.
  Object.defineProperty(data, '__fal', {
    enumerable: false,
    value: {
      billable: Number(res.headers.get('x-fal-billable-units')) || null,
      requestId: sub.request_id,
    },
  });
  return data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function download(url, dest, timeoutMs = 120000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error('download failed ' + res.status);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

const mimeOf = (p) => (p.endsWith('.png') ? 'image/png' : p.endsWith('.webp') ? 'image/webp' : 'image/jpeg');

export async function toDataUri(file) {
  return 'data:' + mimeOf(file) + ';base64,' + (await readFile(file)).toString('base64');
}

// --- the ledgers ---------------------------------------------------------
// Two files, two jobs. runs.jsonl beside the output is the ROUND RECORD: the
// prompt, seed, size and charge of every frame, because a hosted API returns
// plain images with no embedded metadata. design/spend.jsonl is the PROJECT'S
// MONEY LEDGER: one line per paid call, read by the cap and summed by whoever
// reports spend. A paid call writes one line to each.
export async function logRun(outDir, record) {
  const at = new Date().toISOString();
  await mkdir(outDir, { recursive: true });
  await appendFile(path.join(outDir, 'runs.jsonl'), JSON.stringify({ at, ...record }) + '\n', 'utf8');
  await logSpend({ at, tool: record.tool, job: record.job, model: record.model, usd: record.usd, usd_source: record.usd_source,
    fal_request_id: record.fal_request_id ?? null, dest: record.dest ?? null });
}

/** One line in the project's spend ledger. Outside a project there is nothing to write to. */
export async function logSpend(record) {
  const project = findProject();
  if (!project) return;
  const line = { at: record.at || new Date().toISOString(), ...record };
  if (line.dest) line.dest = path.relative(project, path.resolve(line.dest)).split(path.sep).join('/');
  await appendFile(path.join(project, SPEND_LEDGER), JSON.stringify(line) + '\n', 'utf8');
}

// --- arg parsing -------------------------------------------------------
/** Bare flags (--raw) must not swallow the following value. Repeats collect. */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2);
    const nx = argv[i + 1];
    const v = nx === undefined || nx.startsWith('--') ? true : (i += 1, nx);
    if (k in out) out[k] = [].concat(out[k], v);
    else out[k] = v;
  }
  return out;
}

/** A string flag's value, or the fallback when absent or given bare. */
export const str = (v, fallback = null) => (typeof v === 'string' ? v : fallback);

export function parseSize(s) {
  const m = String(s).match(/^(\d+)x(\d+)$/);
  if (!m) throw new Error('size must look like 2048x1152, got "' + s + '"');
  return { width: Number(m[1]), height: Number(m[2]) };
}
