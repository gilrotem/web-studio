#!/usr/bin/env node
/**
 * Studio image edit. The one editor; every project calls this.
 *
 *   node edit.mjs --image PATH --prompt "..." --out DIR --tag name
 *   node edit.mjs --image PATH --ref A.jpg --ref B.jpg --prompt "..." --job cast
 *
 * Output size follows the SOURCE image unless told otherwise. That is the whole
 * point: left to itself the endpoint returns a 2K-class frame, which upscales an
 * already approved image and bills it at fal's upper tier. An approved frame is
 * frozen creative capital and does not get resampled on the way through.
 *
 * --job    edit | cast   (default: edit)
 * --ref    extra reference image; repeat the flag. Capped per job class.
 * --size   WxH to override, or `2k` / `1k` to hand the choice back to fal.
 * --cap    shrink under the lower-tier ceiling when the source is larger.
 * --model  override, e.g. seedream-4-edit for a deliberate cheap pass.
 */

import path from 'node:path';
import {
  parseArgs, parseSize, resolveKey, callFal, download, logRun, toDataUri,
  dimsOf, capToTier, tierOf, estimateCost,
} from './fal.mjs';
import { resolveJob, printRoutes } from './routes.mjs';

const argv = process.argv.slice(2);
const args = parseArgs(argv);

if (args.routes) { printRoutes(); process.exit(0); }

if (!args.image || args.image === true || !args.prompt || args.prompt === true) {
  console.error('usage: node edit.mjs --image PATH --prompt "..." [--job edit|cast] [--ref PATH]... [--out DIR] [--tag name]');
  process.exit(1);
}

// --ref may repeat, which the generic parser cannot express.
const refs = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--ref' && argv[i + 1] && !argv[i + 1].startsWith('--')) refs.push(argv[i + 1]);
}

const jobName = args.job === true ? 'edit' : (args.job || 'edit');
const job = resolveJob(jobName);
const model = (args.model && args.model !== true) ? args.model : job.model;

if (job.maxRefs && refs.length > job.maxRefs) {
  console.error('--job ' + jobName + ' caps references at ' + job.maxRefs + ', got ' + refs.length + '.');
  console.error('Identity preservation is measured collapsing past that point. Trim the stack or use --job edit deliberately.');
  process.exit(1);
}

// --- output size -------------------------------------------------------
let size = null;
let sizeNote = '';
if (args.size === '2k') { size = 'auto_2K'; sizeNote = 'fal decides (2K)'; }
else if (args.size === '1k') { size = 'auto_1K'; sizeNote = 'fal decides (1K)'; }
else if (args.size && args.size !== true) { size = parseSize(args.size); sizeNote = 'explicit'; }
else {
  const d = dimsOf(args.image);
  if (!d) {
    console.log('note: source dimensions unreadable, letting fal decide (this is the 2x-tier default)');
  } else {
    size = d;
    sizeNote = 'matched to source';
    if (args.cap) {
      const capped = capToTier(size);
      if (capped.width !== size.width) { size = capped; sizeNote = 'source, capped to lower tier'; }
    }
  }
}

const px = size && typeof size === 'object' ? size.width * size.height : null;
const each = px ? estimateCost(model, px, refs.length + 1) : null;

console.log('job ' + jobName + '  model ' + model + (refs.length ? '  refs ' + refs.length : ''));
if (px) {
  console.log('size ' + size.width + 'x' + size.height + '  ' + (px / 1e6).toFixed(2) + 'MP  ' + tierOf(px) + ' tier  (' + sizeNote + ')');
  if (tierOf(px) !== 'lower' && !args.cap) console.log('  pass --cap to fit the lower tier');
  if (each !== null) console.log('est  $' + each.toFixed(4));
}

const key = await resolveKey();
const urls = [await toDataUri(args.image)];
for (const r of refs) urls.push(await toDataUri(r));

const body = {
  prompt: args.prompt,
  image_urls: urls,
  num_images: 1,
  output_format: 'jpeg',
  enable_safety_checker: false,
};
if (size) body.image_size = size;

const outDir = path.resolve(args.out && args.out !== true ? args.out : '.');
const tag = args.tag && args.tag !== true ? args.tag : 'edit';

try {
  const data = await callFal(model, body, { key });
  const img = data.images?.[0];
  if (!img?.url) throw new Error('no image in response');
  const dest = path.join(outDir, tag + '.jpg');
  await download(img.url, dest);
  await logRun(outDir, {
    tool: 'edit', job: jobName, model, tag,
    source: args.image, refs, size: size ?? 'fal-default', px, est_usd: each,
    prompt: args.prompt, dest,
  });
  console.log('OK   ' + dest);
} catch (e) {
  console.error('FAIL ' + e.message);
  process.exit(1);
}
