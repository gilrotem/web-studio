/**
 * The wall chart, as data.
 *
 * Seedream 5 Pro is the default family. The other rows exist because a project
 * PROVED a need the default cannot meet, not because a benchmark said so.
 * Pass `--job <class>` to any tool and it picks the row; `--routes` prints it.
 *
 * tool:  which script runs the job (generate = text in, edit = image in)
 * size:  'cap'    -> requested size, shrunk under the 1-unit line
 *        'source' -> the source image's size, shrunk under the line
 *        'free'   -> model bills flat, any size
 */

export const JOBS = {
  candidate: {
    tool: 'generate', model: 'seedream-pro', size: 'cap',
    why: 'Default. A candidate predicts the final, so it runs on the final\'s model. n=2-3, one prompt, one purpose.',
  },
  final: {
    tool: 'generate', model: 'seedream-pro', size: 'cap',
    why: 'Hero and signature frames. Native 2048x1152; more width comes from a precision upscale, never a generative one.',
  },
  photoreal: {
    tool: 'generate', model: 'seedream-pro', size: 'cap',
    why: 'Editorial and architectural photography, unless the project has proved `material` for its subject.',
  },
  likeness: {
    tool: 'generate', model: 'seedream-pro', size: 'cap',
    why: 'Frames carrying a real, identifiable person. Governance class: never routed to a reseller.',
  },
  plate: {
    tool: 'generate', model: 'seedream-lite', size: 'free',
    why: 'Backgrounds and plates with no cast and no signature element. $0.035 flat at any size up to 3072.',
  },
  material: {
    tool: 'generate', model: 'flux-ultra', size: 'free',
    why: 'Photography where a project\'s own bake-off chose FLUX 1.1 ultra over Seedream: quiet material and room shots, pure street exteriors with no text zone, landscapes and still lifes; and re-cuts of any frame FLUX made (same --seed). $0.06 flat. Takes an aspect ratio, not pixels.',
  },
  vector: {
    tool: 'generate', model: 'recraft-v3', size: 'free',
    why: 'Real SVG line illustration. Recraft returns no seed; the file name is the record. Prompt max 1000 chars. Vector styles bill 2 units.',
  },
  edit: {
    tool: 'edit', model: 'seedream-pro-edit', size: 'source',
    why: 'Surgical single-change edit of an approved frame. Output follows the source, capped under the line: an edit of a 2816x1584 frame comes back 2048x1152 at half price. --raw keeps the source size and pays double.',
  },
  cast: {
    tool: 'edit', model: 'seedream-pro-edit', size: 'source', maxRefs: 3,
    why: 'Recurring cast derived from a stored anchor. Max 3 references: identity preservation collapses past that.',
  },
  'plate-edit': {
    tool: 'edit', model: 'seedream-lite-edit', size: 'free',
    why: 'Edits to a plate or background with no cast and no signature element. Lite is an editing-first model and bills $0.035 flat, versus up to $0.135 on Pro.',
  },
  fill: {
    tool: 'edit', model: 'flux-fill', size: 'free',
    why: 'Masked repair: redraw only the white area of --mask (a room repair, a removed object). $0.05 per megapixel.',
  },
  cutout: {
    tool: 'edit', model: 'birefnet', size: 'free',
    why: 'Matte for local compositing. Never spend a paid edit call on a background swap.',
  },
};

export const DEFAULT_GENERATE = 'candidate';
export const DEFAULT_EDIT = 'edit';

export function resolveJob(name, tool) {
  const job = JOBS[name];
  if (!job) throw new Error('unknown --job "' + name + '". Known: ' + Object.keys(JOBS).join(', '));
  if (tool && job.tool !== tool) {
    throw new Error('--job ' + name + ' runs in ' + job.tool + '.mjs, not ' + tool + '.mjs');
  }
  return job;
}

export function printRoutes() {
  const pad = Math.max(...Object.keys(JOBS).map((k) => k.length)) + 2;
  console.log('\nJob classes. Seedream 5 Pro is the default; every other row is a proven exception.\n');
  for (const [name, j] of Object.entries(JOBS)) {
    const bits = [j.tool + '.mjs', j.model];
    if (j.size === 'cap') bits.push('capped to 1 unit');
    if (j.size === 'source') bits.push('source size, capped to 1 unit');
    if (j.size === 'free') bits.push('flat billing');
    if (j.maxRefs) bits.push('max ' + j.maxRefs + ' refs');
    console.log('  ' + name.padEnd(pad) + bits.join('  |  '));
    console.log('  ' + ' '.repeat(pad) + j.why + '\n');
  }
}
