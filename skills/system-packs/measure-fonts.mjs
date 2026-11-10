/**
 * measure-fonts — the Hebrew calibration table, measured in Chromium from the
 * real Google Fonts files. Nobody publishes these numbers; every pack's sizes,
 * measures and optical equalisation depend on them.
 *
 *   node measure-fonts.mjs                 all fonts in FONTS below -> fonts.json
 *   node measure-fonts.mjs "Heebo:400,800"  one family, printed only
 *
 * Per family and weight, in em:
 *   hebrew   height of flat-topped Hebrew letters (ה מ ס ב כ ם), no ascender
 *   cap      Latin cap height (H), which text-box-trim uses
 *   residue  hebrew - cap: air text-box-trim leaves above Hebrew (negative)
 *   glyph    average advance of a Hebrew character in running text, spaces included
 *   ch       width of "0", what CSS `ch` means
 *   perCh    Hebrew characters per 1ch of measure (ch / glyph)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../visual-verify/scripts/lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

// The signature bench plus the faces the packs use.
export const FONTS = {
  'Assistant': [300, 400, 600, 700, 800],
  'Heebo': [300, 400, 700, 800, 900],
  'Rubik': [400, 700, 900],
  'Noto Sans Hebrew': [400, 700, 900],
  'IBM Plex Sans Hebrew': [400, 600, 700],
  'Noto Serif Hebrew': [400, 500, 600, 700],
  'Frank Ruhl Libre': [300, 400, 500, 700],
  'David Libre': [400, 500, 700],
  'Secular One': [400],
  'Suez One': [400],
  'Karantina': [400, 700],
  'Miriam Libre': [400, 700],
  'Fredoka': [400, 700],
  'Bona Nova': [400, 700],
  'Bellefair': [400],
};

// Running Hebrew with ordinary punctuation, as body copy is written.
const SAMPLE = 'אנחנו מלווים אתכם מהשיחה הראשונה ועד שהעבודה נמסרת, עם מחיר סגור מראש ובלי הפתעות בדרך. כל שלב מתועד, וכל שאלה מקבלת תשובה ביום שבו נשאלה.';

function parseCli(arg) {
  const [fam, w] = arg.split(':');
  return { [fam]: (w || '400').split(',').map(Number) };
}

export async function measure(fonts = FONTS) {
  const families = Object.entries(fonts).map(([f, ws]) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@${ws.join(';')}`).join('&');
  const href = `https://fonts.googleapis.com/css2?${families}&display=block`;
  const browser = await launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html lang="he" dir="rtl"><head><link rel="stylesheet" href="${href}"></head><body></body></html>`, { waitUntil: 'networkidle' });
  const out = await page.evaluate(async ({ fonts, SAMPLE }) => {
    const size = 200;
    const c = document.createElement('canvas').getContext('2d');
    const res = {};
    for (const [fam, weights] of Object.entries(fonts)) {
      for (const w of weights) {
        const font = `${w} ${size}px "${fam}"`;
        await document.fonts.load(font, 'אבג H0');
        const loaded = document.fonts.check(font, 'א');
        c.font = font;
        c.textBaseline = 'alphabetic';
        const asc = (t) => c.measureText(t).actualBoundingBoxAscent / size;
        const flat = ['ה', 'מ', 'ס', 'ב', 'כ', 'ם'].map(asc);
        const hebrew = flat.reduce((a, b) => a + b, 0) / flat.length;
        const cap = asc('H');
        const glyph = c.measureText(SAMPLE).width / size / SAMPLE.length;
        const ch = c.measureText('0').width / size;
        const r = (n) => Math.round(n * 1000) / 1000;
        res[`${fam} ${w}`] = { family: fam, weight: w, loaded, hebrew: r(hebrew), cap: r(cap), residue: r(hebrew - cap), glyph: r(glyph), ch: r(ch), perCh: r(ch / glyph) };
      }
    }
    return res;
  }, { fonts, SAMPLE });
  // What text-box-trim actually leaves: render the Hebrew letters trimmed and
  // count blank pixel rows above the first ink. The browser trims to the font
  // file's cap-height metric, which can differ from the H glyph (Assistant:
  // glyph 0.66, and an independent table carried 0.75), so this is measured, not derived.
  await page.setViewportSize({ width: 1600, height: 600 });
  for (const [key, v] of Object.entries(out)) {
    await page.setContent(`<!doctype html><html lang="he" dir="rtl"><head><link rel="stylesheet" href="${href}"><style>
      body{margin:0;background:#fff}
      #t{display:inline-block;font:${v.weight} 200px/1.5 "${v.family}";color:#000;text-box:trim-both cap alphabetic;padding:0;margin:120px}
    </style></head><body><span id="t">המסבכ</span></body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const box = await page.locator('#t').boundingBox();
    const png = await page.screenshot({ clip: { x: box.x, y: box.y - 60, width: box.width, height: box.height + 120 } });
    const rows = await page.evaluate(async (b64) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let first = -1, last = -1;
      for (let y = 0; y < c.height; y++) {
        let ink = 0;
        for (let i = y * c.width * 4; i < (y + 1) * c.width * 4; i += 4) if (d[i] < 128) ink++;
        if (ink > 2) { if (first < 0) first = y; last = y; }
      }
      return { first, last };
    }, png.toString('base64'));
    // The clip started 60px above the trimmed box.
    const r = (n) => Math.round(n * 1000) / 1000;
    v.trimAirTop = r((rows.first - 60) / 200);           // em of air between the trimmed box top and the Hebrew letters
    v.trimBoxHeight = r(box.height / 200);                 // em: the trimmed box (≈ the cap-height metric)
  }
  await browser.close();
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const one = process.argv[2];
  const table = await measure(one ? parseCli(one) : FONTS);
  const rows = Object.entries(table);
  console.log('font                          loaded hebrew  cap    residue glyph  ch     perCh  trimBox trimAir');
  for (const [k, v] of rows) console.log(`${k.padEnd(30)}${String(v.loaded).padEnd(7)}${String(v.hebrew).padEnd(8)}${String(v.cap).padEnd(7)}${String(v.residue).padEnd(8)}${String(v.glyph).padEnd(7)}${String(v.ch).padEnd(7)}${String(v.perCh).padEnd(7)}${String(v.trimBoxHeight).padEnd(8)}${v.trimAirTop}`);
  if (!one) {
    const bad = rows.filter(([, v]) => !v.loaded).map(([k]) => k);
    if (bad.length) { console.error('\nNOT LOADED (numbers are the fallback font, discard): ' + bad.join(', ')); process.exit(1); }
    fs.writeFileSync(path.join(here, 'fonts.json'), JSON.stringify({ measured: new Date().toLocaleDateString('sv-SE'), method: 'Chromium canvas measureText on Google Fonts files, 200px', sample: SAMPLE, fonts: table }, null, 2) + '\n');
    console.log('\nwrote fonts.json');
  }
}
