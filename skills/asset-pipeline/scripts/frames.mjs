// Video -> scroll-scrub WebP frame sequence per breakpoint.
// Usage: node frames.mjs <in.mp4> <out-dir> [--fps 24] [--widths 1280,720] [--quality 80] [--max 150]
// Requires ffmpeg on PATH and `sharp` in the project. Run from the project root.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const sharp = createRequire(join(process.cwd(), 'package.json'))('sharp');

const args = process.argv.slice(2);
const [input, outDir] = args;
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : d; };
if (!input || !outDir) { console.error('usage: frames.mjs <in.mp4> <out-dir> [--fps] [--widths] [--quality] [--max]'); process.exit(1); }
const fps = Number(opt('fps', 24)), quality = Number(opt('quality', 80)), max = Number(opt('max', 150));
const widths = opt('widths', '1280,720').split(',').map(Number);
const tmp = join(outDir, '_png');
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
execFileSync('ffmpeg', ['-y', '-i', input, '-vf', `fps=${fps}`, '-frames:v', String(max), join(tmp, 'f_%04d.png')], { stdio: 'inherit' });
const pngs = readdirSync(tmp).filter(f => f.endsWith('.png')).sort();
for (const w of widths) {
  const dir = join(outDir, String(w)); mkdirSync(dir, { recursive: true });
  for (const [i, f] of pngs.entries()) await sharp(join(tmp, f)).resize({ width: w }).webp({ quality }).toFile(join(dir, `${String(i).padStart(4, '0')}.webp`));
  console.log(`${w}px: ${pngs.length} frames`);
}
rmSync(tmp, { recursive: true, force: true });
writeFileSync(join(outDir, 'sequence.json'), JSON.stringify({ count: pngs.length, fps, widths, pattern: '{width}/{index4}.webp' }, null, 2));
