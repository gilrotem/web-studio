#!/usr/bin/env node
/**
 * The kit's text-to-image. The one generator; every project calls this.
 *
 *   node generate.mjs --prompt "..." --job candidate --n 3 --out DIR --tag hero
 *   node generate.mjs --routes          # the wall chart
 *
 * --job     candidate | final | photoreal | likeness | plate | material | vector
 *           (default candidate). Edit-class jobs live in edit.mjs.
 * --size    WxH. Default 2048x1152, exactly the 1-unit line on Seedream Pro.
 *           For `vector` a fal preset name (portrait_4_3, square_hd, ...) is also accepted.
 * --n       candidates, 1-4. 2-3 per subject is the norm, 3-4 for a hero; one prompt, one purpose.
 * --seed    base seed; candidate i gets seed+i-1. Minted and logged when absent.
 * --style   vector only: Recraft style (default vector_illustration/line_art)
 * --colors  vector only: palette as hex list, e.g. "#152239,#ffffff"
 * --model   override the job's model, for a deliberate A/B only.
 * --raw     skip the 1-unit cap and send the size as given (bills double above it).
 * --dry     print what would be sent and what it costs, and check the cap; call nothing.
 *
 * Every run is checked against the project's imagery cap (fal.mjs, "the cap")
 * before anything is sent, dry runs included: a run that would pass it is
 * refused (exit 2). Run it from the project root.
 */

import path from 'node:path';
import {
  parseArgs, parseSize, str, resolveKey, callFal, download, logRun, modelOf,
  capToTier, tierOf, estimateCost, actualCost, fluxRatio, SAFE_WIDE, enforceCap,
} from './fal.mjs';
import { resolveJob, printRoutes, DEFAULT_GENERATE } from './routes.mjs';

const args = parseArgs();
if (args.routes) { printRoutes(); process.exit(0); }

const prompt = str(args.prompt);
if (!prompt) {
  console.error('usage: node generate.mjs --prompt "..." [--job candidate] [--size 2048x1152] [--n 3] [--out DIR] [--tag name]');
  console.error('       node generate.mjs --routes');
  process.exit(1);
}

const jobName = str(args.job, DEFAULT_GENERATE);
let job;
try { job = resolveJob(jobName, 'generate'); } catch (e) { console.error(e.message); process.exit(1); }
const modelName = str(args.model, job.model);
const model = modelOf(modelName);

const n = Number(args.n) || 1;
if (n > 4) {
  console.error('--n ' + n + ': at most 4 candidates per prompt (2-3 normally, 3-4 for a hero). A failed round means the prompt or the spec is wrong; fix that instead of widening the spray.');
  process.exit(1);
}

// --- size ---------------------------------------------------------------
const sizeArg = str(args.size);
let size;
let sizeLine;
if (model.shape === 'recraft' && sizeArg && !/^\d+x\d+$/.test(sizeArg)) {
  size = sizeArg;                                      // fal preset, e.g. portrait_4_3
  sizeLine = 'size ' + size + ' (preset)';
} else {
  size = sizeArg ? parseSize(sizeArg) : { ...SAFE_WIDE };
  // The cap only matters where price follows area; a flat-billed override keeps its size.
  if (job.size === 'cap' && model.unit === 'area unit' && !args.raw) {
    const capped = capToTier(size);
    if (capped.width !== size.width) {
      console.log('capped ' + size.width + 'x' + size.height + ' -> ' + capped.width + 'x' + capped.height + ' to stay at 1 unit (--raw to override)');
      size = capped;
    }
  }
  const px = size.width * size.height;
  sizeLine = model.shape === 'flux-ultra'
    ? 'aspect ' + fluxRatio(size) + ' (FLUX ultra takes a ratio, not pixels)'
    : 'size ' + size.width + 'x' + size.height + '  ' + (px / 1e6).toFixed(2) + 'MP'
      + (model.unit === 'area unit' ? '  ' + tierOf(px) : '');
}
const px = typeof size === 'object' ? size.width * size.height : null;

// Seedream never echoes a seed. A frame generated without one is
// unreproducible, so one is always minted here and logged.
const baseSeed = str(args.seed) ? Number(args.seed) : Math.floor(Math.random() * 2 ** 31);

function bodyFor(seed) {
  switch (model.shape) {
    case 'seedream':
      return { prompt, image_size: size, num_images: 1, output_format: 'jpeg', enable_safety_checker: false, seed };
    case 'flux-ultra':
      return { prompt, aspect_ratio: fluxRatio(size), num_images: 1, output_format: 'jpeg', safety_tolerance: '5', seed };
    case 'recraft': {
      if (prompt.length > 1000) throw new Error('Recraft caps prompts at 1000 characters, this one is ' + prompt.length);
      const body = { prompt, image_size: size, style: str(args.style, 'vector_illustration/line_art') };
      const colors = str(args.colors);
      if (colors) {
        body.colors = colors.split(',').map((h) => {
          const v = parseInt(h.trim().replace('#', ''), 16);
          return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        });
      }
      return body;
    }
    default:
      throw new Error(modelName + ' is not a text-to-image model; use edit.mjs');
  }
}

// Recraft bills its vector styles at two units per image (fal meter, 21/9/2026).
const vectorStyle = model.shape === 'recraft' && str(args.style, 'vector_illustration/line_art').startsWith('vector');
const each = estimateCost(modelName, px) * (vectorStyle ? 2 : 1);
const outDir = path.resolve(str(args.out, '.'));
const tag = str(args.tag, 'img');

console.log('job ' + jobName + '  model ' + modelName + '  (' + model.id + ')');
console.log(sizeLine);
if (each !== null) console.log('est  $' + each.toFixed(4) + ' x ' + n + ' = $' + (each * n).toFixed(4));
enforceCap((each ?? 0) * n, 'generate ' + jobName + ' x' + n);
if (args.dry) {
  console.log('\n--dry: nothing sent. Body of candidate 1:');
  console.log(JSON.stringify(bodyFor(baseSeed), null, 2));
  process.exit(0);
}

const key = await resolveKey();

async function one(i) {
  const seed = baseSeed + i - 1;
  try {
    const data = await callFal(modelName, bodyFor(seed), { key });
    const img = data.images?.[0];
    if (!img?.url) throw new Error('no image in response');
    const ext = vectorStyle ? '.svg' : '.jpg';
    const dest = path.join(outDir, tag + '-' + i + ext);
    await download(img.url, dest);
    const units = data.__fal?.billable ?? null;
    const usd = actualCost(modelName, data);
    await logRun(outDir, {
      tool: 'generate', job: jobName, model: modelName, endpoint: model.id, tag, index: i,
      size, seed: model.shape === 'recraft' ? null : (data.seed ?? seed),
      billable_units: units, usd: usd ?? each, usd_source: usd !== null ? 'fal meter' : 'estimate',
      fal_request_id: data.__fal?.requestId ?? null,
      prompt, dest,
    });
    const dims = img.width ? img.width + 'x' + img.height : '';
    return 'OK   ' + dest + '  ' + dims + (model.shape === 'recraft' ? '' : '  seed ' + (data.seed ?? seed))
      + (units ? '  billed ' + units + ' ' + model.unit + (usd !== null ? ' = $' + usd.toFixed(4) : '') : '');
  } catch (e) {
    return 'FAIL #' + i + '  ' + e.message;
  }
}

const results = await Promise.all(Array.from({ length: n }, (_, i) => one(i + 1)));
results.forEach((r) => console.log(r));
if (results.every((r) => r.startsWith('FAIL'))) process.exit(1);
