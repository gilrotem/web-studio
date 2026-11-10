/**
 * The wall chart, as data.
 *
 * One model family, one host. What changes per job is the RESOLUTION and the
 * DISCIPLINE, because those are the two dials that move money without touching
 * the look. Pass `--job <class>` to any tool and it picks the row for you.
 *
 * Print it any time with:  node generate.mjs --routes
 */

export const JOBS = {
  candidate: {
    model: 'seedream-pro',
    cap: true,
    why: 'A candidate exists to predict the final, so it runs on the same model as the final. Cut this pile with the gate, not with a cheaper model.',
  },
  final: {
    model: 'seedream-pro',
    cap: true,
    why: 'Hero and signature frames. Native resolution only; if more is needed use a PRECISION upscaler, never a generative one.',
  },
  photoreal: {
    model: 'seedream-pro',
    cap: true,
    why: 'Editorial and architectural. Replaces FLUX 1.1 pro ultra, which scores 892 Elo against this model at 1078 and costs about the same.',
  },
  edit: {
    model: 'seedream-pro-edit',
    size: 'source',
    why: 'Surgical single-change edits. Pro is the only Seedream with coordinate-addressable spatial grounding; size follows the source so an approved frame is never resampled.',
  },
  cast: {
    model: 'seedream-pro-edit',
    size: 'source',
    maxRefs: 3,
    why: 'Recurring cast, derived from a stored anchor. Identity preservation is measured collapsing past three references, so the cap is behavioural, not financial.',
  },
  plate: {
    model: 'seedream-lite',
    why: 'Section and background plates with no cast member and no signature element. Lite bills FLAT at any resolution and has nothing here to hold an identity on.',
  },
  oversize: {
    model: 'seedream-lite',
    why: 'Anything past 4MP. Pro caps at 2048x2048 and fal publishes no rate above it; Lite reaches 3072x3072. The tiering inverts here.',
  },
  likeness: {
    model: 'seedream-pro',
    cap: true,
    falOnly: true,
    why: 'Frames carrying a real, identifiable person. A governance class, not a cost class: this never routes to a cheaper reseller, whatever it saves.',
  },
  cutout: {
    model: 'birefnet',
    why: 'Mattes for local compositing. Never spend a paid edit call on a background swap.',
  },
};

export const DEFAULT_JOB = 'candidate';

export function resolveJob(name) {
  const job = JOBS[name || DEFAULT_JOB];
  if (!job) {
    throw new Error('unknown --job "' + name + '". Known: ' + Object.keys(JOBS).join(', '));
  }
  return job;
}

export function printRoutes() {
  const pad = Math.max(...Object.keys(JOBS).map((k) => k.length)) + 2;
  console.log('\nJob classes - one model family, one host; resolution and discipline do the work\n');
  for (const [name, j] of Object.entries(JOBS)) {
    const bits = [j.model];
    if (j.size === 'source') bits.push('size=source');
    else if (j.cap) bits.push('capped to the lower tier');
    else bits.push('flat billing, any size');
    if (j.maxRefs) bits.push('max ' + j.maxRefs + ' refs');
    if (j.falOnly) bits.push('fal only');
    console.log('  ' + name.padEnd(pad) + bits.join('  |  '));
    console.log('  ' + ' '.repeat(pad) + j.why + '\n');
  }
}
