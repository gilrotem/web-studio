/**
 * shoot — render a page the only way the studio trusts: settled, full page,
 * at every width it ships at, identified, and audited.
 *
 *   node <kit>/skills/visual-verify/scripts/verify.mjs shoot <page.html | page-folder | url> [options]
 *
 *   --widths 1440,390   capture widths (default 1440,390)
 *   --tag NAME          run name (default: the page's folder or file name)
 *   --root DIR          serve from DIR (default: the project root, i.e. the folder the tool runs from)
 *   --reduced           also capture with prefers-reduced-motion: reduce
 *   --no-audit          skip contrast / body size / measure
 *   --allow-hidden "why"  accept content still invisible after the scroll
 *                       (carousel slides, tabs). The reason is recorded.
 *
 * Output: <project>/design/review/verify/<stamp>-<tag>/  <width>[-reduced].jpg + run.json
 * Ledger: <project>/design/review/verify/runs.jsonl, one line per run.
 *
 * Exit 0 clean, 2 audit failures, 3 evidence suspect: CSS/fonts/images failed
 * to load, the page threw a JS error, or content is still hidden after the scroll. A suspect capture is
 * not evidence until that is explained. 1 usage or load error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { openTarget, launch, settle, identify, hiddenAfterScroll, heightFor, stamp, slug, appendJsonl, outRoot } from './lib.mjs';
import { audit } from './audit.mjs';

export async function shoot(args, project) {
  const target = args._[0];
  if (!target) throw new Error('usage: shoot <page.html | page-folder | url> [--widths 1440,390] [--tag name] [--reduced]');
  const widths = String(args.widths || '1440,390').split(',').map((w) => parseInt(w, 10)).filter(Boolean);
  const tag = slug(args.tag || (/^https?:/.test(target) ? new URL(target).hostname + new URL(target).pathname : path.basename(path.resolve(target), '.html') === 'index' ? path.basename(path.dirname(path.resolve(target))) : path.basename(path.resolve(target), '.html')));
  const runDir = path.join(outRoot(project), `${stamp()}-${tag}`);
  fs.mkdirSync(runDir, { recursive: true });

  const { url, close } = await openTarget(target, args.root, project);
  const browser = await launch();
  const captures = [];
  try {
    const variants = [{ reduced: false }];
    if (args.reduced) variants.push({ reduced: true });
    for (const w of widths) {
      for (const v of variants) {
        const ctx = await browser.newContext({
          viewport: { width: w, height: heightFor(w) },
          deviceScaleFactor: 1,
          reducedMotion: v.reduced ? 'reduce' : 'no-preference',
        });
        const page = await ctx.newPage();
        const errors = [];
        const failed = [];
        page.on('pageerror', (e) => errors.push(String(e.message || e).slice(0, 200)));
        // A page that lost its CSS still renders, and still audits "clean".
        const MATTERS = /^(stylesheet|font|image|script|media)$/;
        page.on('response', (r) => { if (r.status() >= 400 && MATTERS.test(r.request().resourceType())) failed.push({ type: r.request().resourceType(), status: r.status(), url: r.url() }); });
        page.on('requestfailed', (r) => { if (MATTERS.test(r.resourceType())) failed.push({ type: r.resourceType(), status: r.failure()?.errorText || 'failed', url: r.url() }); });
        const resp = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        await settle(page);
        const id = await identify(page);
        const hidden = await hiddenAfterScroll(page);
        const file = `${w}${v.reduced ? '-reduced' : ''}.jpg`;
        // Full-page captures are taken from the top; anything else misplaces sticky elements.
        if (id.scrollY !== 0) throw new Error(`page is at scrollY=${id.scrollY}, not 0, at capture time`);
        await page.screenshot({ path: path.join(runDir, file), fullPage: true, type: 'jpeg', quality: 85 });
        const report = args['no-audit'] || v.reduced ? null : await audit(page);
        captures.push({ width: w, reduced: v.reduced, file, status: resp ? resp.status() : null, identity: id, hidden, failed, jsErrors: errors, audit: report });
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  const hiddenCount = captures.reduce((n, c) => n + c.hidden.length, 0);
  const failedCount = captures.reduce((n, c) => n + c.failed.length, 0);
  const jsErrorCount = captures.reduce((n, c) => n + c.jsErrors.length, 0);
  const suspect = failedCount > 0 || jsErrorCount > 0 || (hiddenCount > 0 && !args['allow-hidden']);
  const failCount = captures.reduce((n, c) => n + (c.audit ? c.audit.summary.contrastFail + c.audit.summary.body16 + c.audit.summary.measure + (c.audit.summary.bidi || 0) : 0), 0);
  const run = {
    ts: new Date().toISOString(),
    tag,
    target,
    dir: path.relative(project, runDir).split(path.sep).join('/'),
    widths,
    allowHidden: args['allow-hidden'] && args['allow-hidden'] !== true ? String(args['allow-hidden']) : (args['allow-hidden'] ? 'no reason given' : null),
    evidence: suspect ? 'suspect' : 'ok',
    captures,
  };
  fs.writeFileSync(path.join(runDir, 'run.json'), JSON.stringify(run, null, 2));
  appendJsonl(path.join(outRoot(project), 'runs.jsonl'), {
    ts: run.ts, tag, target, dir: run.dir, evidence: run.evidence, allowHidden: run.allowHidden,
    summary: captures.map((c) => ({ width: c.width, reduced: c.reduced, hidden: c.hidden.length, failedAssets: c.failed.length, jsErrors: c.jsErrors.length, ...(c.audit ? c.audit.summary : {}) })),
  });

  // ---- the report, short enough to read every pass
  const lines = [`RUN ${run.dir}`];
  for (const c of captures) {
    const id = c.identity;
    lines.push(`\n[${c.width}${c.reduced ? ' reduced-motion' : ''}] ${c.file}  "${id.title}"  innerWidth=${id.innerWidth}  dir=${id.dir}  lang=${id.lang ?? '-'}  height=${id.scrollHeight}`);
    if (id.innerWidth !== c.width) lines.push(`  ! viewport is ${id.innerWidth}, asked for ${c.width}`);
    if (id.horizontalOverflow) lines.push(`  ! horizontal overflow: ${id.horizontalOverflow}px wider than the viewport`);
    if (id.lang && /^he/i.test(id.lang) && id.dir !== 'rtl') lines.push(`  ! lang=${id.lang} but direction is ${id.dir}`);
    if (c.failed.length) {
      lines.push(`  ! ${c.failed.length} asset(s) failed to load — this is not the page as designed:`);
      for (const f of c.failed.slice(0, 6)) lines.push(`      ${f.type} ${f.status}  ${decodeURIComponent(f.url)}`);
    }
    if (c.jsErrors.length) lines.push(`  ! ${c.jsErrors.length} JS error(s): ${c.jsErrors[0]}`);
    if (c.hidden.length) {
      lines.push(`  ! ${c.hidden.length} element(s) still invisible after the scroll:`);
      for (const h of c.hidden.slice(0, 6)) lines.push(`      ${h.selector}  y=${h.top}  "${h.text}"`);
    }
    if (c.audit) {
      const s = c.audit.summary;
      lines.push(`  contrast: ${s.contrastFail} fail (${s.contrastFailGroups} color pairs), ${s.unverifiable} unverifiable, of ${c.audit.checked} text elements`);
      for (const g of c.audit.contrast.fail.slice(0, 6)) lines.push(`      FAIL ${g.ratio}:1 < ${g.need}  ${g.text} on ${g.background}  x${g.count}  e.g. ${g.examples[0].selector} "${g.examples[0].text}"`);
      for (const g of c.audit.contrast.unverifiable.slice(0, 3)) lines.push(`      UNVERIFIABLE x${g.count}  ${g.reason}  e.g. "${g.examples[0].text}"`);
      if (s.gradientText) lines.push(`  gradient text (signature: never): ${s.gradientText}  e.g. ${c.audit.gradientText[0].selector} "${c.audit.gradientText[0].text}"`);
      if (s.bidi) lines.push(`  numeric ranges not isolated in RTL (render reversed): ${s.bidi}  e.g. ${c.audit.bidi[0].selector} "${c.audit.bidi[0].text}"`);
      if (s.body16) lines.push(`  body under 16px: ${s.body16}  e.g. ${c.audit.body16[0].selector} ${c.audit.body16[0].size}px`);
      if (s.measure) lines.push(`  lines over 70 chars: ${s.measure}  e.g. ${c.audit.measure[0].selector} ~${c.audit.measure[0].charsPerLine} chars`);
    }
  }
  if (jsErrorCount) lines.push(`
EVIDENCE SUSPECT: the page threw — a crashed script is not the page as designed.`);
  if (failedCount) lines.push(`
EVIDENCE SUSPECT: assets failed to load. If they live above the project, pass --root <dir>.`);
  if (hiddenCount && !args['allow-hidden']) lines.push(`\nEVIDENCE SUSPECT: content is invisible after the scroll. Fix the reveal, or re-run with --allow-hidden "<why>" if it is a carousel or tab.`);
  lines.push(`\n${failCount ? 'AUDIT: ' + failCount + ' failure(s)' : 'AUDIT: clean'}${captures.some((c) => c.audit?.summary.unverifiable) ? ' — unverifiable text must be judged by eye on the capture' : ''}`);
  console.log(lines.join('\n'));
  return suspect ? 3 : failCount ? 2 : 0;
}
