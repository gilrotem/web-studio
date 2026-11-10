#!/usr/bin/env node
/**
 * The studio's single fal.ai core. Every project's image tools import this
 * file; nothing talks to fal directly any more.
 *
 * It exists because the same three defects had been copy-pasted into a dozen
 * scripts: a 404 endpoint spelling, a fallback that silently swapped the model,
 * and a missing `image_size` that let the edit endpoint upscale approved frames
 * into fal's double-price tier. Fixing those in one place is the whole point.
 *
 * Nothing here decides taste. It decides routes, sizes and bookkeeping.
 */

import { writeFile, mkdir, readFile, appendFile } from 'node:fs/promises';
import { existsSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- billing geometry --------------------------------------------------
// fal bills Seedream 5 Pro by TOTAL AREA, not by either dimension, and the
// threshold is inclusive: "total area less than or equal to 1536x1536".
export const TIER_PX = 1536 * 1536;     // 2,359,296 - lower/upper boundary
export const PRO_CEIL_PX = 2048 * 2048; // 4,194,304 - above this fal publishes no rate
export const SAFE_WIDE = { width: 2048, height: 1152 }; // exactly TIER_PX

export function tierOf(px) {
  if (px > PRO_CEIL_PX) return 'ABOVE-CEILING';
  if (px > TIER_PX) return 'UPPER';
  return 'lower';
}

// --- endpoints ---------------------------------------------------------
// Verified live. The Seedream v5 routes carry NO `fal-ai/` prefix; the prefixed
// spelling 404s, which is what made the old fallback chains drop to v4.
export const ENDPOINTS = {
  'seedream-pro': 'https://fal.run/bytedance/seedream/v5/pro/text-to-image',
  'seedream-pro-edit': 'https://fal.run/bytedance/seedream/v5/pro/edit',
  'seedream-lite': 'https://fal.run/bytedance/seedream/v5/lite/text-to-image',
  'seedream-lite-edit': 'https://fal.run/bytedance/seedream/v5/lite/edit',
  'seedream-4-edit': 'https://fal.run/fal-ai/bytedance/seedream/v4/edit',
  birefnet: 'https://fal.run/fal-ai/birefnet/v2',
};

// Indicative rates, for the cost line the tools print. Not authoritative: the
// invoice is. Update when fal changes published pricing.
export const RATES = {
  'seedream-pro': { lower: 0.0675, upper: 0.135, extraRef: 0.0045 },
  'seedream-pro-edit': { lower: 0.0675, upper: 0.135, extraRef: 0.0045 },
  'seedream-lite': { flat: 0.035 },
  'seedream-lite-edit': { flat: 0.035 },
  'seedream-4-edit': { flat: 0.03 },
};

export function estimateCost(model, px, refs = 0) {
  const r = RATES[model];
  if (!r) return null;
  const base = r.flat ?? (px > TIER_PX ? r.upper : r.lower);
  return base + Math.max(0, refs - 1) * (r.extraRef ?? 0);
}

// --- credentials -------------------------------------------------------
// The key lives with the PROJECT, never with the kit: .env.local / .env (both
// gitignored) in the directory the tool is run from, or in any parent of it.
// This toolkit may sit in a plugin cache or in a project's .claude/skills/, so
// its own location says nothing about the project. The folder three levels up
// is still checked last, for a kit vendored at <root>/.claude/skills/fal-image/.
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
const KEY_FILES = keyFileCandidates();

async function fromKeyFile(name) {
  for (const file of KEY_FILES) {
    if (!existsSync(file)) continue;
    const text = await readFile(file, 'utf8');
    const m = text.match(new RegExp('^\\s*' + name + '\\s*=\\s*(.+)\\s*$', 'm'));
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
  throw new Error('no credential found. Set one of: ' + names.join(', '));
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

// --- the call ----------------------------------------------------------
/**
 * POST to one endpoint. Retries the SAME endpoint on transient failure and
 * never silently substitutes a different model: a downgrade the operator did
 * not ask for is a quality regression disguised as resilience.
 */
export async function callFal(model, body, { key, attempts = 2, timeoutMs = 240000, quiet = false } = {}) {
  const url = ENDPOINTS[model];
  if (!url) throw new Error('unknown model "' + model + '". Known: ' + Object.keys(ENDPOINTS).join(', '));
  const k = key || (await resolveKey());
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: 'Key ' + k, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        lastErr = res.status + ': ' + (await res.text()).slice(0, 240);
        if (!quiet) console.log('  attempt ' + i + '/' + attempts + ' failed - ' + lastErr);
        continue;
      }
      return await res.json();
    } catch (e) {
      lastErr = e.message;
      if (!quiet) console.log('  attempt ' + i + '/' + attempts + ' failed - ' + lastErr);
    }
  }
  throw new Error(model + ' failed after ' + attempts + ' attempts: ' + lastErr);
}

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

// --- the ledger --------------------------------------------------------
// One JSONL line per generation, next to the output. Images come back from a
// hosted API as plain JPEG with no embedded generation metadata, so if the
// script does not record the parameters nothing else will.
export async function logRun(outDir, record) {
  await mkdir(outDir, { recursive: true });
  await appendFile(path.join(outDir, 'runs.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...record }) + '\n', 'utf8');
}

// --- arg parsing -------------------------------------------------------
/** Bare flags (--cap) must not swallow the following value. */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const nx = argv[i + 1];
    if (nx === undefined || nx.startsWith('--')) out[argv[i].slice(2)] = true;
    else { out[argv[i].slice(2)] = nx; i += 1; }
  }
  return out;
}

export function parseSize(s) {
  const m = String(s).match(/^(\d+)x(\d+)$/);
  if (!m) throw new Error('size must look like 2048x1152, got "' + s + '"');
  return { width: Number(m[1]), height: Number(m[2]) };
}
