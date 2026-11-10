#!/usr/bin/env node
/**
 * Studio text-to-image. The one generator; every project calls this.
 *
 *   node generate.mjs --prompt "..." --job candidate --size 2048x1152 --n 3 --out DIR
 *   node generate.mjs --routes          # print the wall chart
 *
 * --job    candidate | final | photoreal | plate | oversize | likeness   (default: candidate)
 * --size   WxH. Default 2048x1152, which is exactly fal's lower-tier ceiling.
 * --n      candidates, 1-6. The protocol says 2-3 and never 6.
 * --model  override the job's model, for a deliberate A/B only.
 * --seed   base seed; candidate i gets seed+i so the set is genuinely varied.
 * --raw    skip the lower-tier cap and send the size as given (costs double above the line).
 */

import path from 'node:path';
import {
  parseArgs, parseSize, resolveKey, callFal, download, logRun,
  capToTier, tierOf, estimateCost, TIER_PX, SAFE_WIDE,
} from './fal.mjs';
import { resolveJob, printRoutes, DEFAULT_JOB } from './routes.mjs';

const args = parseArgs();

if (args.routes) { printRoutes(); process.exit(0); }

if (!args.prompt || args.prompt === true) {
  console.error('usage: node generate.mjs --prompt "..." [--job candidate] [--size 2048x1152] [--n 3] [--out DIR]');
  console.error('       node generate.mjs --routes');
  process.exit(1);
}

const jobName = args.job === true ? DEFAULT_JOB : (args.job || DEFAULT_JOB);
const job = resolveJob(jobName);
const model = (args.model && args.model !== true) ? args.model : job.model;

let size = args.size && args.size !== true ? parseSize(args.size) : { ...SAFE_WIDE };
if (job.cap && !args.raw) {
  const capped = capToTier(size);
  if (capped.width !== size.width || capped.height !== size.height) {
    console.log('capped ' + size.width + 'x' + size.height + ' -> ' + capped.width + 'x' + capped.height + ' to stay in the lower tier (--raw to override)');
    size = capped;
  }
}

const px = size.width * size.height;
const n = Math.max(1, Math.min(6, Number(args.n) || 1));
const outDir = path.resolve(args.out && args.out !== true ? args.out : '.');
const tag = args.tag && args.tag !== true ? args.tag : 'img';

const each = estimateCost(model, px);
console.log('job ' + jobName + '  model ' + model);
console.log('size ' + size.width + 'x' + size.height + '  ' + (px / 1e6).toFixed(2) + 'MP  ' + tierOf(px) + ' tier');
if (each !== null) console.log('est  $' + each.toFixed(4) + ' x ' + n + ' = $' + (each * n).toFixed(4));
if (px > TIER_PX && !job.flat) console.log('NOTE: above the lower tier. --job plate routes to flat billing, or drop to 2048x1152.');

const key = await resolveKey();

// Seedream returns ONLY `images` and never echoes a seed back. A frame
// generated without an explicit seed is therefore unreproducible forever: the
// server picked a number and did not say which. So we always mint one here and
// record it, which costs nothing and makes every round re-cuttable.
const baseSeed = args.seed && args.seed !== true
  ? Number(args.seed)
  : Math.floor(Math.random() * 2 ** 31);

async function one(i) {
  const seed = baseSeed + i;
  const body = {
    prompt: args.prompt,
    image_size: size,
    num_images: 1,
    output_format: 'jpeg',
    enable_safety_checker: false,
    seed,
  };

  try {
    const data = await callFal(model, body, { key });
    const img = data.images?.[0];
    if (!img?.url) throw new Error('no image in response');
    const dest = path.join(outDir, tag + '-' + i + '.jpg');
    await download(img.url, dest);
    await logRun(outDir, {
      tool: 'generate', job: jobName, model, tag, index: i,
      size, px, tier: tierOf(px), seed,
      est_usd: each, prompt: args.prompt, dest,
    });
    return 'OK   ' + dest + '  (' + (img.width || size.width) + 'x' + (img.height || size.height) + ', seed ' + seed + ')';
  } catch (e) {
    return 'FAIL #' + i + '  ' + e.message;
  }
}

const results = await Promise.all(Array.from({ length: n }, (_, i) => one(i + 1)));
results.forEach((r) => console.log(r));
if (results.every((r) => r.startsWith('FAIL'))) process.exit(1);
