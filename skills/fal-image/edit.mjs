#!/usr/bin/env node
/**
 * The kit's image edit. The one editor; every project calls this.
 *
 *   node edit.mjs --image PATH --prompt "..." --out DIR --tag name
 *   node edit.mjs --image PATH --ref A.jpg --ref B.jpg --prompt "..." --job cast
 *   node edit.mjs --image PATH --mask MASK.png --prompt "..." --job fill
 *   node edit.mjs --image PATH --job cutout
 *
 * --job    edit | cast | plate-edit | fill | cutout   (default: edit)
 * --ref    extra reference image; repeat the flag. `cast` allows 3.
 * --mask   fill only: white = redraw, black = keep.
 * --size   WxH explicit output size.
 * --raw    keep the source size even above the 1-unit line (bills double).
 * --dry    print size and cost and check the cap; call nothing.
 *
 * Output follows the SOURCE, capped under the 1-unit line. Left alone the
 * endpoint returns a 2K-class frame and bills it double; and an edit of a frame
 * that is already above the line (2816x1584, 2880x2000, 2048x2048 ...) would
 * keep paying double on every pass of its line. Capped, it pays once.
 */

import path from 'node:path';
import {
  parseArgs, parseSize, str, resolveKey, callFal, download, logRun, toDataUri, modelOf,
  dimsOf, capToTier, tierOf, estimateCost, actualCost, enforceCap,
} from './fal.mjs';
import { resolveJob, printRoutes, DEFAULT_EDIT } from './routes.mjs';

const args = parseArgs();
if (args.routes) { printRoutes(); process.exit(0); }

const jobName = str(args.job, DEFAULT_EDIT);
let job;
try { job = resolveJob(jobName, 'edit'); } catch (e) { console.error(e.message); process.exit(1); }
const modelName = str(args.model, job.model);
const model = modelOf(modelName);

const image = str(args.image);
const prompt = str(args.prompt);
if (!image || (model.shape !== 'cutout' && !prompt)) {
  console.error('usage: node edit.mjs --image PATH --prompt "..." [--job edit|cast|plate-edit|fill] [--ref PATH]... [--out DIR] [--tag name]');
  console.error('       node edit.mjs --image PATH --job cutout [--out DIR]');
  process.exit(1);
}
const refs = [].concat(args.ref ?? []).filter((r) => typeof r === 'string');
if (job.maxRefs && refs.length > job.maxRefs) {
  console.error('--job ' + jobName + ' allows ' + job.maxRefs + ' references, got ' + refs.length + '. Identity preservation collapses past that point.');
  process.exit(1);
}
const mask = str(args.mask);
if (model.shape === 'flux-fill' && !mask) { console.error('--job fill needs --mask PATH (white = redraw)'); process.exit(1); }

// --- output size --------------------------------------------------------
const src = dimsOf(image);
let size = null;
let note = '';
if (str(args.size)) { size = parseSize(args.size); note = 'explicit'; }
else if (!src) note = 'source unreadable, fal decides';
else if (job.size === 'source' && model.unit === 'area unit' && !args.raw) {
  size = capToTier(src);
  note = size.width === src.width ? 'matches source' : 'source ' + src.width + 'x' + src.height + ', capped to 1 unit (--raw keeps it, at double price)';
} else { size = src; note = 'matches source'; }
const px = size ? size.width * size.height : null;
const each = estimateCost(modelName, model.shape === 'flux-fill' ? (src ? src.width * src.height : null) : px);

console.log('job ' + jobName + '  model ' + modelName + (refs.length ? '  refs ' + refs.length : ''));
if (size) console.log('size ' + size.width + 'x' + size.height + '  ' + (px / 1e6).toFixed(2) + 'MP'
  + (model.unit === 'area unit' ? '  ' + tierOf(px) : '') + '  (' + note + ')');
else console.log('size - (' + note + ')');
if (each !== null) console.log('est  $' + each.toFixed(4));
if (model.unit === 'area unit' && !src && !str(args.size)) {
  console.error('Refusing: the source size is unreadable, so fal would pick a 2K frame and bill it double. Pass --size WxH.');
  process.exit(1);
}
enforceCap(each ?? 0, 'edit ' + jobName);
if (args.dry) { console.log('--dry: nothing sent'); process.exit(0); }

// --- request ------------------------------------------------------------
const key = await resolveKey();
let body;
if (model.shape === 'seedream-edit') {
  body = {
    prompt,
    image_urls: [await toDataUri(image), ...(await Promise.all(refs.map(toDataUri)))],
    num_images: 1, output_format: 'jpeg', enable_safety_checker: false,
  };
  if (size) body.image_size = size;
} else if (model.shape === 'flux-fill') {
  body = { prompt, image_url: await toDataUri(image), mask_url: await toDataUri(mask), num_images: 1, output_format: 'jpeg', safety_tolerance: '5' };
} else if (model.shape === 'cutout') {
  body = { image_url: await toDataUri(image), output_format: 'png' };
} else {
  console.error(modelName + ' is not an image-in model; use generate.mjs');
  process.exit(1);
}

const outDir = path.resolve(str(args.out, '.'));
const tag = str(args.tag, jobName);

try {
  const data = await callFal(modelName, body, { key });
  const img = data.image ?? data.images?.[0];
  if (!img?.url) throw new Error('no image in response');
  const dest = path.join(outDir, tag + (model.shape === 'cutout' ? '.png' : '.jpg'));
  await download(img.url, dest);
  const units = data.__fal?.billable ?? null;
  const usd = actualCost(modelName, data);
  await logRun(outDir, {
    tool: 'edit', job: jobName, model: modelName, endpoint: model.id, tag,
    source: image, source_size: src, refs, mask, size: size ?? 'fal-default',
    billable_units: units, usd: usd ?? each, usd_source: usd !== null ? 'fal meter' : 'estimate',
    fal_request_id: data.__fal?.requestId ?? null,
    prompt: prompt ?? null, dest,
  });
  console.log('OK   ' + dest + (units ? '  billed ' + units + ' ' + model.unit + (usd !== null ? ' = $' + usd.toFixed(4) : '') : ''));
  if (model.shape === 'cutout') console.log('     composite locally with sharp; never spend a paid edit call on a background swap');
} catch (e) {
  console.error('FAIL ' + e.message);
  process.exit(1);
}
