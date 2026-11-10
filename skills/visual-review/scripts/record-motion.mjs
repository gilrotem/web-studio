// Record a timed scroll through the page, then tile 12 fps frames into one contact sheet.
// Usage: node record-motion.mjs <url> <out-dir> [--width 1440] [--seconds 12] [--reduced]
// Requires `playwright` in the project and ffmpeg on PATH.
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const { chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright');

const args = process.argv.slice(2);
const [url, outDir = 'design/review/motion'] = args;
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : d; };
const width = Number(opt('width', 1440)), seconds = Number(opt('seconds', 12));
const reduced = args.includes('--reduced');
if (!url) { console.error('usage: record-motion.mjs <url> <out-dir> [--width] [--seconds] [--reduced]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const videoDir = join(outDir, '_video'); rmSync(videoDir, { recursive: true, force: true });
const height = width < 768 ? 844 : 900;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height }, recordVideo: { dir: videoDir, size: { width, height } },
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500); // load sequence
const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
const steps = seconds * 30;
for (let i = 0; i <= steps; i++) {
  await page.mouse.wheel(0, total / steps);
  await page.waitForTimeout(1000 / 30);
}
await page.waitForTimeout(800);
await context.close(); await browser.close();
const webm = readdirSync(videoDir).find(f => f.endsWith('.webm'));
const suffix = `${width}${reduced ? '-reduced' : ''}`;
const video = join(outDir, `scroll-${suffix}.webm`);
renameSync(join(videoDir, webm), video); rmSync(videoDir, { recursive: true, force: true });
const sheet = join(outDir, `sheet-${suffix}.png`);
// 12 fps, 6 columns, scaled; one image to read timing from.
execFileSync('ffmpeg', ['-y', '-i', video, '-vf', `fps=12,scale=${width > 768 ? 480 : 240}:-1,tile=6x${Math.ceil((seconds + 2) * 12 / 6)}`, '-frames:v', '1', sheet], { stdio: 'inherit' });
console.log(`video: ${video}\nsheet: ${sheet}`);
