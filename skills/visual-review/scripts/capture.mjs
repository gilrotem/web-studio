// Full-page captures after a full scroll pass, at 390 and 1440, light and dark.
// Usage: node capture.mjs <url> <out-dir>   (requires `playwright` in the project)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright');

const [,, url, outDir = 'design/review/latest'] = process.argv;
if (!url) { console.error('usage: capture.mjs <url> <out-dir>'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const [w, h] of [[390, 844], [1440, 900]]) {
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const step = innerHeight * 0.6;
      for (let y = 0; y < document.body.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
      scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
    });
    const info = await page.evaluate(() => ({ title: document.title, width: innerWidth, dir: document.documentElement.dir }));
    const file = join(outDir, `${w}-${scheme}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${file}  title="${info.title}" width=${info.width} dir=${info.dir} consoleErrors=${errors.length}`);
    errors.forEach(e => console.log('  ERR', e));
    await page.close();
  }
}
await browser.close();
