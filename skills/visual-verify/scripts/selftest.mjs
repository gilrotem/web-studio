/**
 * selftest — the harness checked against a page whose answers are known.
 * Expected ratios were computed independently with the WCAG 2.x formula
 * (node, 2026-09-25): #767676/#fff 4.54, #777777/#fff 4.48, #84A4CE/#fff 2.57,
 * #949494/#fff 3.03, black at 35% over white 2.43, white over 50% black over
 * white ~3.95. Run it after any change to lib/audit/shoot.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SKILL_DIR, outRoot } from './lib.mjs';
import { shoot } from './shoot.mjs';

export async function selftest() {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'vv-selftest-'));
  const fixture = path.join(SKILL_DIR, 'fixtures', 'selftest.html');
  const code = await shoot({ _: [fixture], widths: '1440', tag: 'selftest' }, project);
  const runDir = fs.readdirSync(outRoot(project)).find((d) => d.endsWith('-selftest'));
  const run = JSON.parse(fs.readFileSync(path.join(outRoot(project), runDir, 'run.json'), 'utf8'));
  const cap = run.captures[0];
  const a = cap.audit;

  const groupOf = (id) => {
    for (const verdict of ['fail', 'pass', 'unverifiable']) {
      const g = a.contrast[verdict].find((g) => g.examples.some((e) => e.selector === '#' + id));
      if (g) return g;
    }
    return null;
  };
  const results = [];
  const check = (name, ok, got) => results.push({ name, ok: !!ok, got });

  const near = (x, y, tol = 0.05) => Math.abs(x - y) <= tol;
  const expectRatio = (id, verdict, ratio, tol) => {
    const g = groupOf(id);
    check(`${id}: ${verdict} at ${ratio}:1`, g && g.verdict === verdict && near(g.ratio, ratio, tol), g ? `${g.verdict} ${g.ratio}` : 'not found');
  };
  expectRatio('c-767676', 'pass', 4.54);
  expectRatio('c-777777', 'fail', 4.48);
  expectRatio('c-paleblue', 'fail', 2.57);
  expectRatio('c-large', 'pass', 3.03);
  expectRatio('c-small', 'fail', 3.03);
  expectRatio('c-opacity', 'fail', 2.43, 0.06);
  expectRatio('c-scrim', 'fail', 3.95, 0.06);
  // Text over pictures is sampled from pixels. White on the tan SVG (#c9b38a,
  // 2.08:1 flat) must fail; white on the dark-blue gradient (#0b2a4a..#3c6e9f,
  // 14.6..5.5:1) must pass.
  const s1 = groupOf('c-overimg'), s2 = groupOf('c-gradient');
  check('c-overimg: sampled from pixels, fails', s1 && s1.method === 'sampled' && s1.verdict === 'fail' && s1.ratio < 2.2, s1 ? `${s1.method} ${s1.verdict} ${s1.ratio}` : 'not found');
  check('c-gradient: sampled from pixels, passes', s2 && s2.method === 'sampled' && s2.verdict === 'pass' && s2.ratio >= 4.5, s2 ? `${s2.method} ${s2.verdict} ${s2.ratio}` : 'not found');
  // Gradient-filled text (background-clip: text): measured by diffing pixels
  // with and without the text. #B5853B..#D9B878 on #111: 5.8..10:1 flat.
  // #D9B878..#E8D3A6 on white: 2.0..1.5:1 flat.
  const gd = groupOf('g-dark'), gl = groupOf('g-light');
  check('g-dark: gradient text on dark measured, passes', gd && gd.method === 'sampled-diff' && gd.verdict === 'pass' && gd.ratio >= 5, gd ? `${gd.method} ${gd.verdict} ${gd.ratio}` : 'not found');
  check('g-light: gradient text on white measured, fails', gl && gl.method === 'sampled-diff' && gl.verdict === 'fail' && gl.ratio < 2.2, gl ? `${gl.method} ${gl.verdict} ${gl.ratio}` : 'not found');
  check('gradient text flagged against signature', a.gradientText.length === 2, a.gradientText.map((g) => g.selector).join(' '));
  const ic = groupOf('i-icon');
  check('i-icon: icon beside the text is not sampled as its background', ic && ic.verdict === 'pass' && ic.ratio >= 12, ic ? `${ic.method} ${ic.verdict} ${ic.ratio}` : 'not found');
  const tt = groupOf('t-trans');
  check('t-trans: `transition: all` does not make text sample itself', tt && tt.verdict === 'pass' && tt.ratio >= 10, tt ? `${tt.method} ${tt.verdict} ${tt.ratio}` : 'not found');
  check('bd-bad: unisolated time range in RTL caught', a.bidi.some((x) => x.selector === '#bd-bad'), a.bidi.map((x) => x.selector).join(' '));
  check('bd-ok: <bdi> range not flagged', !a.bidi.some((x) => x.selector === '#bd-ok' || x.selector.includes('bdi')), a.bidi.map((x) => x.selector).join(' '));
  check('flat-color text is not sampled', groupOf('c-777777') && !groupOf('c-777777').method, JSON.stringify(groupOf('c-777777')?.method));
  check('b-14: body under 16px caught', a.body16.some((b) => b.selector === '#b-14'), a.body16.map((b) => b.selector).join(' '));
  check('m-wide: line over 70 chars caught', a.measure.some((m) => m.selector === '#m-wide'), a.measure.map((m) => `${m.selector}~${m.charsPerLine}`).join(' '));
  check('m-ok: 48ch line (~60 Hebrew chars) not flagged', !a.measure.some((m) => m.selector === '#m-ok'), a.measure.map((m) => m.selector).join(' '));
  check('r-late: scroll reveal fired before capture', !cap.hidden.some((h) => h.selector === '#r-late'), cap.hidden.map((h) => h.selector).join(' '));
  check('h-never: never-revealed content caught', cap.hidden.some((h) => h.selector === '#h-never'), cap.hidden.map((h) => h.selector).join(' '));
  check('fixed closed menu not reported as hidden', !cap.hidden.some((h) => /menu/.test(h.selector)), cap.hidden.map((h) => h.selector).join(' '));
  check('smooth-scroll page captured from the top (sticky header in place)', cap.identity.scrollY === 0, cap.identity.scrollY);
  check('identity: width 1440, rtl, he', cap.identity.innerWidth === 1440 && cap.identity.dir === 'rtl' && cap.identity.lang === 'he', `${cap.identity.innerWidth} ${cap.identity.dir} ${cap.identity.lang}`);
  check('page JS error caught', cap.jsErrors.some((e) => /deliberate page error/.test(e)), JSON.stringify(cap.jsErrors));
  check('missing stylesheet caught', cap.failed.some((f) => f.type === 'stylesheet' && /does-not-exist/.test(f.url)), JSON.stringify(cap.failed));
  check('exit code 3 (hidden content / missing CSS make the capture suspect)', code === 3, code);

  console.log('\n---- selftest');
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '   got: ' + r.got}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed. Scratch: ${project}`);
  return failed ? 1 : 0;
}
