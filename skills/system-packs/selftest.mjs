/**
 * system-packs selftest: the checker must pass the real packs and catch every
 * kind of broken pack; the generator must produce what the canon says.
 *
 *   node <kit>/skills/system-packs/selftest.mjs
 */

import { listPacks, loadPack, check, buildCss, fluid, measureCh, contrastPairs, swapFactor, fromRhythm } from './pack.mjs';

const results = [];
const ok = (name, cond, got) => results.push({ name, ok: !!cond, got });
const clone = (o) => JSON.parse(JSON.stringify(o));
const fails = (p) => check(p).fail.join(' | ');

for (const n of listPacks()) ok(`pack ${n} passes the canon`, check(loadPack(n)).fail.length === 0, fails(loadPack(n)));

const base = loadPack('institutional');
// the shipped system's own published contrast matrix, reproduced independently
const pairs = Object.fromEntries(contrastPairs(base).map((p) => [`${p.text}/${p.ground}`, p.ratio]));
ok('institutional matrix reproduced: ink-3 on tint would be 4.31 (not allowed), ink-2/tint 7.16, accent-deep/ground 4.9',
  pairs['ink-2/tint'] === 7.16 && pairs['accent-deep/ground'] === 4.9, JSON.stringify(pairs));

const broken = [
  ['body under 16px', (p) => { p.type.body.size = [15, 17]; }, /body 15px is under the 16px floor/],
  ['ink-3 allowed on tint (4.31)', (p) => { p.allow.tint.push('ink-3'); }, /ink-3 on tint 4.31/],
  ['display steps too close', (p) => { p.type['display-2'].size = [38, 80]; }, /display-1 \/ display-2/],
  ['letter-spacing on a heading', (p) => { p.type['display-1'].tracking = 0.02; }, /display-1 carries letter-spacing/],
  ['body line-height 1.3', (p) => { p.type.body.lh = 1.3; }, /body line-height 1.3/],
  ['fluid ceiling over 2.5x', (p) => { p.type['display-1'].size = [30, 85]; }, /ceiling 85 > 2.5/],
  ['measure over 65 characters', (p) => { p.measure.body = 72; }, /body measure 72/],
  ['space not growing', (p) => { p.space[7] = [30, 40]; }, /s8 does not grow/],
  ['missing colour role', (p) => { delete p.color['ink-3']; }, /colour role missing: ink-3/],
];
for (const [name, mutate, expect] of broken) {
  const p = clone(base);
  mutate(p);
  ok(`catches: ${name}`, expect.test(fails(p)), fails(p) || '(no failure)');
}

ok('fixed step is rem', fluid([16, 16]) === '1rem', fluid([16, 16]));
ok('fluid step clamps 360->1320 in rem', fluid([41, 85]) === 'clamp(2.5625rem, calc(1.5313rem + 4.5833vw), 5.3125rem)', fluid([41, 85]));
ok('measure: 60 Hebrew chars in Assistant = 52ch', measureCh(base, 60) === 52, measureCh(base, 60));
ok('swap David 500 -> Assistant 700 ~ 0.93', Math.abs(swapFactor('David Libre', 500, 'Assistant', 700) - 0.93) < 0.01, swapFactor('David Libre', 500, 'Assistant', 700));
for (const [nm, args] of [['calm', { body: [17, 19], ratio: [1.2, 1.25] }], ['compact', { body: [16, 17], ratio: [1.15, 1.2], density: 0.85, measure: 62 }], ['open', { body: [17, 20], ratio: [1.2, 1.333], density: 1.25, measure: 56 }]]) {
  const g = fromRhythm({ name: 'r-' + nm, display: ['Heebo', 800], text: 'Heebo', ...args });
  ok(`rhythm preset "${nm}" generates a pack that passes the canon`, check(g).fail.length === 0, fails(g));
}
ok('scoped build (tokens on a wrapper)', buildCss(base, { scope: '#lp-x' }).includes('#lp-x{'), '');

// ---- in the browser: the opt-in classes do what they claim --------------------------------
const { launch } = await import('../visual-verify/scripts/lib.mjs');
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 900 } });
const css = buildCss(base, { classes: true });
await page.setContent(`<!doctype html><html lang="he" dir="rtl"><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=block">
<style>${css}
  /* rules a host page's theme typically carries */
  .entry-content p { margin: 0 0 2em; }
  .elementor-widget-text-editor h2 { margin: 40px 0 30px; }
  body { margin: 0; font-family: Assistant; }
</style></head><body>
<div class="entry-content elementor-widget-text-editor">
  <div class="sp-flow" id="flow"><p id="p1">פסקה ראשונה</p><p id="p2">פסקה שנייה</p><h2 id="h2">כותרת</h2><p id="p3">אחרי כותרת</p>
    <div class="sp-flow" id="inner"><p id="i1">מקונן</p><p id="i2">מקונן שני</p></div></div>
  <p id="out1">מחוץ</p><p id="out2">מחוץ שני</p>
</div>
<div class="sp-region" style="width:695px"><h1 class="sp-display" id="disp" style="--chars:18;margin:0;display:inline-block;white-space:nowrap">כותרת של שמונה עשר</h1></div>
</body></html>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const m = await page.evaluate(() => {
  const top = (id) => document.getElementById(id).getBoundingClientRect().top;
  const bottom = (id) => document.getElementById(id).getBoundingClientRect().bottom;
  const px = (v) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) * (/rem/.test(getComputedStyle(document.documentElement).getPropertyValue(v)) ? 16 : 1);
  const d = document.getElementById('disp');
  return {
    gapPP: top('p2') - bottom('p1'), gapToH2: top('h2') - bottom('p2'), gapAfterH2: top('p3') - bottom('h2'),
    innerGap: top('i2') - bottom('i1'), outGap: top('out2') - bottom('out1'),
    s5: parseFloat(getComputedStyle(document.getElementById('p2')).marginTop), s8: parseFloat(getComputedStyle(document.getElementById('h2')).marginTop),
    dispWidth: d.getBoundingClientRect().width, glyph: getComputedStyle(document.documentElement).getPropertyValue('--glyph-w').trim(),
  };
});
await browser.close();
ok('sp-flow: body->body gap is s5 (24px) despite `.entry-content p` (theme adds 2em below)', Math.abs(m.gapPP - 24) < 1, JSON.stringify(m));
ok('sp-flow: gap before h2 is s8 (64px), not the theme 40px or a doubled margin', Math.abs(m.gapToH2 - 64) < 1, m.gapToH2);
ok('sp-flow: gap after h2 is s5 (24px), proximity law holds (64 >= 2 x 24)', Math.abs(m.gapAfterH2 - 24) < 1 && m.gapToH2 >= 2 * m.gapAfterH2, m.gapAfterH2);
ok('sp-flow: nested flow keeps s5 inside, no leak', Math.abs(m.innerGap - 24) < 1, m.innerGap);
ok('outside sp-flow the theme rule is untouched (2em of 16px = 32px)', Math.abs(m.outGap - 32) < 1.5, m.outGap);
ok(`sp-display fills ~80% of a 695px region with measured glyph-w ${m.glyph} (got ${Math.round(m.dispWidth)}px = ${Math.round(m.dispWidth / 6.95)}%)`, Math.abs(m.dispWidth / 695 - 0.8) < 0.06, m.dispWidth);

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '   got: ' + r.got}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
