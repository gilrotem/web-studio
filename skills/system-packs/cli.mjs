#!/usr/bin/env node
/**
 * system-packs — the kit's Hebrew design-system packs. Run from the project
 * root (a folder with design/), or pass --project DIR.
 *
 *   list                                 the packs, with status and register
 *   check  [pack | design/spec/pack.json | all] CANON floors, contrast, measures
 *   build  [pack | design/spec/pack.json] [--out file] [--scope '#wrapper'] [--classes]
 *   use    <pack> [--force]              copy a pack into design/spec/ (pack.json + tokens.css + type-and-space.md)
 *   apply  <exported.css | -> [pack.json] a tweaks-bar export written back into the pack, tokens rebuilt
 *   new    <name> --display "F 800" --text F [--body 17,19 --ratio 1.2,1.25 --density 1 --measure 60 --colors institutional]
 *                                        a candidate pack from the rhythm model's six numbers (kit development)
 *   proof  [pack | all]                  render the specimen through visual-verify; in a project with
 *                                        design/spec/pack.json: that pack, into design/spec/specimen/ + design/review/verify/;
 *                                        otherwise the kit's packs, into _proof/ (kit development, git-ignored)
 *   compare                              one sheet of every pack's latest proof, desktop and phone
 *   drift  <page.html>                   type and space values in a built page that bypass the tokens
 *   swap   "<font> <w>" "<font> <w>"     optical size factor between two display faces
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { HERE, PACKS, listPacks, loadPack, check, buildCss, fontsHref, swapFactor, fromRhythm } from './pack.mjs';
import { parseArgs, launch, readJsonl, stamp } from '../visual-verify/scripts/lib.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
const PROOF = path.join(HERE, '_proof');

/** The project: --project DIR, or the folder the tool runs from when it holds design/. */
function projectOf() {
  if (args.project && args.project !== true) return path.resolve(String(args.project));
  const here = process.cwd();
  if (fs.existsSync(path.join(here, 'design')) && path.relative(HERE, here).startsWith('..')) return here;
  return null;
}

/** A tokens.css that is still the blank template (comments only) may be replaced by `use`. */
function isBlankTokens(file) {
  if (!fs.existsSync(file)) return true;
  return !/--[a-z][\w-]*\s*:/i.test(fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
}

/** A pack name, or a pack.json path (a project's tuned copy). */
function resolvePack(ref) {
  const project = projectOf();
  if (!ref && project && fs.existsSync(path.join(project, 'design', 'spec', 'pack.json'))) ref = path.join(project, 'design', 'spec', 'pack.json');
  if (!ref) throw new Error('which pack? ' + listPacks().join(', '));
  if (ref.endsWith('.json')) return loadPack(path.resolve(project || process.cwd(), ref));
  return loadPack(ref);
}

function report(pack) {
  const r = check(pack);
  console.log(`${pack.name} (${pack.status})  ${r.fail.length ? 'FAIL ' + r.fail.length : 'pass'}${r.warn.length ? ', ' + r.warn.length + ' warning(s)' : ''}`);
  r.fail.forEach((x) => console.log('  FAIL  ' + x));
  r.warn.forEach((x) => console.log('  warn  ' + x));
  r.info.forEach((x) => console.log('  info  ' + x));
  return r.fail.length ? 1 : 0;
}

async function proof(name) {
  const pack = loadPack(name);
  const dir = path.join(PROOF, pack.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'tokens.css'), buildCss(pack));
  const html = fs.readFileSync(path.join(HERE, 'specimen.html'), 'utf8')
    .replaceAll('{{FONTS}}', fontsHref(pack)).replaceAll('{{TOKENS}}', 'tokens.css')
    .replaceAll('{{PACK_TITLE}}', pack.title).replaceAll('{{PACK_NAME}}', pack.name).replaceAll('{{PACK_STATUS}}', pack.status);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const { shoot } = await import('../visual-verify/scripts/shoot.mjs');
  console.log(`\n==== ${pack.name}`);
  return shoot({ _: [path.join(dir, 'index.html')], tag: pack.name, widths: args.widths || '1440,390' }, PROOF);
}

async function proofProject(project, packFile) {
  const pack = loadPack(packFile);
  const code = report(pack);
  const spec = path.join(project, 'design', 'spec');
  fs.writeFileSync(path.join(spec, 'tokens.css'), buildCss(pack, { source: path.relative(project, packFile).split(path.sep).join('/') }));
  const dir = path.join(spec, 'specimen');
  fs.mkdirSync(dir, { recursive: true });
  const html = fs.readFileSync(path.join(HERE, 'specimen.html'), 'utf8')
    .replaceAll('{{FONTS}}', fontsHref(pack)).replaceAll('{{TOKENS}}', '../tokens.css')
    .replaceAll('{{PACK_TITLE}}', pack.title).replaceAll('{{PACK_NAME}}', pack.name).replaceAll('{{PACK_STATUS}}', pack.status);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const { shoot } = await import('../visual-verify/scripts/shoot.mjs');
  const shot = await shoot({ _: [path.join(dir, 'index.html')], tag: 'specimen-' + pack.name, widths: args.widths || '1440,390' }, project);
  return Math.max(code, shot);
}

async function compare() {
  const runs = readJsonl(path.join(PROOF, 'design', 'review', 'verify', 'runs.jsonl'));
  const latest = {};
  for (const r of runs) latest[r.tag] = r;
  const packs = listPacks().filter((p) => latest[p]);
  if (!packs.length) throw new Error('no proofs yet: run `proof all` first');
  const out = path.join(PROOF, 'sheets');
  fs.mkdirSync(out, { recursive: true });
  const cols = packs.map((p) => {
    const pk = loadPack(p);
    const d = path.join(PROOF, latest[p].dir);
    return { name: p, title: pk.title, status: pk.status, desk: pathToFileURL(path.join(d, '1440.jpg')).href, phone: pathToFileURL(path.join(d, '390.jpg')).href, evidence: latest[p].evidence };
  });
  const sheets = [
    { file: 'compare-fold.jpg', title: 'Desktop 1440, first screens', key: 'desk', w: 720, crop: 1500, per: 2 },
    { file: 'compare-desktop.jpg', title: 'Desktop 1440, full page', key: 'desk', w: 470, crop: 99999, per: 4 },
    { file: 'compare-phone.jpg', title: 'Phone 390, full page', key: 'phone', w: 300, crop: 99999, per: 4 },
  ];
  const browser = await launch();
  const made = [];
  try {
    for (const s of sheets) {
      const width = s.per * (s.w + 40) + 40;
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const html = `<!doctype html><meta charset="utf-8"><style>
        body{margin:0;background:#161616;color:#ebe6dc;font:18px/1.3 system-ui,sans-serif;width:${width}px}
        h1{font-size:26px;margin:0;padding:24px 40px 8px;font-weight:600}
        .grid{display:grid;grid-template-columns:repeat(${s.per},${s.w}px);gap:40px;padding:16px 40px 40px;align-items:start}
        .c h2{font-size:20px;margin:0 0 4px}.c p{margin:0 0 10px;opacity:.75;font-size:15px}
        .c div{max-height:${Math.round(s.crop * s.w / (s.key === 'desk' ? 1440 : 390))}px;overflow:hidden;background:#222}
        .c img{width:${s.w}px;display:block}
      </style><h1>system packs · ${s.title} · ${new Date().toLocaleDateString('sv-SE')}</h1>
      <div class="grid">${cols.map((c) => `<div class="c"><h2 dir="rtl">${c.title}</h2><p>${c.name} · ${c.status}${c.evidence !== 'ok' ? ' · EVIDENCE ' + c.evidence : ''}</p><div><img src="${c[s.key]}"></div></div>`).join('')}</div>`;
      const tmp = path.join(out, '.sheet.html');
      fs.writeFileSync(tmp, html);
      await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
      await page.screenshot({ path: path.join(out, s.file), fullPage: true, type: 'jpeg', quality: 82 });
      fs.rmSync(tmp);
      await page.close();
      made.push(path.join(out, s.file));
    }
  } finally { await browser.close(); }
  made.forEach((m) => console.log('SHEET ' + m));
  return 0;
}

// ---- drift: values that bypass the system -------------------------------------------------
const DRIFT_PROPS = /^(font-size|font-weight|line-height|letter-spacing|margin(-[a-z-]+)?|padding(-[a-z-]+)?|gap|row-gap|column-gap|font)$/;
function drift(file) {
  const html = fs.readFileSync(file, 'utf8');
  let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  for (const m of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"':]+\.css)["']/gi)) {
    const p = path.resolve(path.dirname(file), m[1]);
    if (fs.existsSync(p) && !/tokens\.css$/i.test(p)) css += '\n' + fs.readFileSync(p, 'utf8');
  }
  const inline = [...html.matchAll(/style="([^"]*)"/gi)].map((m) => `[inline]{${m[1]}}`).join('\n');
  css = (css + '\n' + inline).replace(/\/\*[\s\S]*?\*\//g, '');
  const hits = [];
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = rule[1].trim().replace(/\s+/g, ' ').slice(0, 60);
    if (/^:root|^@|^\s*$/.test(sel) || /--[a-z]/.test(sel)) continue;
    for (const decl of rule[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim().toLowerCase(), val = decl.slice(i + 1).trim();
      if (prop.startsWith('--') || !DRIFT_PROPS.test(prop)) continue;
      // The canon's own technique is not drift: a dark band drops heading weight by 100 (CANON 4).
      if (prop === 'font-weight' && /^calc\(var\(--w-[a-z0-9-]+\)\s*-\s*100\)$/.test(val)) continue;
      const stripped = val.replace(/var\([^()]*(\([^()]*\))?[^()]*\)/g, '').replace(/calc\(|\)/g, ' ');
      const raw = stripped.match(/-?\d*\.?\d+(px|rem|em)\b|\b[1-9]00\b|\b\d\.\d+\b/g);
      if (!raw) continue;
      const meaningful = raw.filter((v) => !/^-?0(px|rem|em)?$/.test(v) && !(prop === 'font-weight' && false));
      if (meaningful.length) hits.push({ sel, prop, val: val.slice(0, 60) });
    }
  }
  const byProp = {};
  for (const h of hits) (byProp[h.prop.replace(/-(top|bottom|left|right|block|inline|start|end)+.*/, '')] ||= []).push(h);
  console.log(`DRIFT ${file}\n  ${hits.length} declaration(s) with raw type/space values outside the tokens`);
  for (const [p, list] of Object.entries(byProp).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${p}: ${list.length}`);
    for (const h of list.slice(0, 3)) console.log(`      ${h.sel} { ${h.prop}: ${h.val} }`);
  }
  console.log('  A composition move outside the scale is legal as a NAMED token (CANON L2); an anonymous number is not.');
  return hits.length ? 2 : 0;
}

// ---- use: a pack into a project --------------------------------------------------------------------
function use(name) {
  const project = projectOf();
  if (!project) throw new Error('run from the project root (a folder with design/), or pass --project DIR');
  const pack = loadPack(name);
  const spec = path.join(project, 'design', 'spec');
  fs.mkdirSync(spec, { recursive: true });
  const targets = ['pack.json', 'tokens.css', 'type-and-space.md'].map((f) => path.join(spec, f));
  // The blank tokens.css birth lays down holds only comments; it is replaced. Real tokens are not.
  const exists = targets.filter((t) => fs.existsSync(t) && !(t === targets[1] && isBlankTokens(t)));
  if (exists.length && !args.force) throw new Error('already present, not overwritten: ' + exists.map((e) => path.relative(project, e)).join(', ') + ' (--force replaces them)');
  const copy = { ...pack, status: 'tuning', from: `${pack.name} (${pack.status}), taken ${new Date().toLocaleDateString('sv-SE')}` };
  fs.writeFileSync(targets[0], JSON.stringify(copy, null, 2) + '\n');
  fs.writeFileSync(targets[1], buildCss(copy, { source: 'design/spec/pack.json' }));
  fs.writeFileSync(targets[2], `# Type and space system

Started from the **${pack.name}** pack (${pack.status}) on ${new Date().toLocaleDateString('sv-SE')}:
${pack.register}

- **Law:** the kit's \`system-packs/CANON.md\` (L0 floors and technique, L1 roles and coupling, L2 concept freedom).
- **Source of truth:** \`design/spec/pack.json\`. \`design/spec/tokens.css\` is generated from it: edit the
  pack, then run the skill's \`cli.mjs build design/spec/pack.json --out design/spec/tokens.css\` and
  \`cli.mjs check design/spec/pack.json\`. A value tuned by eye in the tweaks bar comes back with \`cli.mjs apply\`.
- **Order:** the pack is provisional. Build the hero by eye, tune the pack to it, then freeze it with the
  foundations lock and record the freeze here with the date. After the freeze, a role or coupling change
  is a recorded decision (L1).
`);
  console.log(`USE ${pack.name} -> ${targets.map((t) => path.relative(project, t)).join(', ')}`);
  return 0;
}

// ---- apply: a tweaks-bar export back into the pack ------------------------------------------
/**
 * The tweaks bar exports changed tokens as CSS. tokens.css is generated from
 * pack.json, so a value pasted into tokens.css is lost on the next build. This
 * writes each exported token back into its pack field, rebuilds and checks.
 * It maps colours, fixed sizes and spaces, radii and durations; fluid (clamp)
 * tokens are not editable in the bar and stay as they are.
 */
function apply() {
  const project = projectOf();
  const file = args._[0];
  if (!file) throw new Error('apply <exported.css | -> [spec/pack.json]  (the tweaks-bar Export CSS output)');
  const css = file === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.resolve(project || process.cwd(), file), 'utf8');
  const packFile = path.resolve(project || process.cwd(), args._[1] || 'design/spec/pack.json');
  if (!fs.existsSync(packFile)) throw new Error('no pack at ' + packFile);
  const pack = JSON.parse(fs.readFileSync(packFile, 'utf8'));
  const toPx = (v) => { const m = String(v).trim().match(/^(-?\d*\.?\d+)(px|rem)$/); return m ? +(m[2] === 'rem' ? m[1] * 16 : m[1]).toFixed(2) : null; };
  const done = [], skipped = [];
  for (const [, name, value] of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const v = value.trim();
    if (pack.color && name in pack.color) { pack.color[name] = v; done.push(`color.${name} = ${v}`); continue; }
    let m;
    if ((m = name.match(/^s(\d{1,2})$/)) && pack.space?.[m[1] - 1]) { const p = toPx(v); if (p != null) { pack.space[m[1] - 1] = [p, p]; done.push(`space.s${m[1]} = ${p}px`); continue; } }
    if ((m = name.match(/^fs-(.+)$/)) && pack.type?.[m[1]]) { const p = toPx(v); if (p != null) { pack.type[m[1]].size = [p, p]; done.push(`type.${m[1]}.size = ${p}px`); continue; } }
    if ((m = name.match(/^(r-sm|r|r-lg)$/)) && pack.shape) { const p = toPx(v); if (p != null) { pack.shape[m[1]] = p; done.push(`shape.${m[1]} = ${p}px`); continue; } }
    if ((m = name.match(/^(t|t-slow)$/)) && pack.motion) { const ms = /ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000; pack.motion[m[1]] = ms; done.push(`motion.${m[1]} = ${ms}ms`); continue; }
    skipped.push(`--${name}: ${v}`);
  }
  const rootNote = css.match(/root font-size:\s*([\d.]+)px/);
  fs.writeFileSync(packFile, JSON.stringify(pack, null, 2) + '\n');
  const tokensOut = path.join(path.dirname(packFile), 'tokens.css');
  fs.writeFileSync(tokensOut, buildCss(pack, { source: path.relative(project || process.cwd(), packFile).split(path.sep).join('/') }));
  console.log(`APPLY -> ${path.relative(project || process.cwd(), packFile)} (tokens.css rebuilt)`);
  done.forEach((d) => console.log('  set   ' + d));
  skipped.forEach((d) => console.log('  skip  ' + d + '   (no pack field; a named token in the project, or fluid)'));
  if (rootNote) console.log(`  note  the bar moved the global type scale (root ${rootNote[1]}px). That is not a token: decide which roles change and edit type.* in the pack.`);
  return report(pack);
}

async function main() {
  if (!cmd || cmd === 'help' || cmd === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0].replace(/^[\s\S]*?\*\s/, '')); return 0; }
  if (cmd === 'list') {
    for (const n of listPacks()) { const p = loadPack(n); console.log(`${n.padEnd(10)} ${p.status.padEnd(10)} ${p.title}\n           ${p.register}\n`); }
    return 0;
  }
  if (cmd === 'check') {
    const refs = !args._[0] && !projectOf() ? listPacks() : args._[0] === 'all' ? listPacks() : [args._[0]];
    let code = 0;
    for (const r of refs) code |= report(resolvePack(r));
    return code;
  }
  if (cmd === 'build') {
    const pack = resolvePack(args._[0]);
    const css = buildCss(pack, { scope: args.scope && args.scope !== true ? String(args.scope) : ':root', classes: !!args.classes, ...(args._[0] && args._[0].endsWith('.json') ? { source: args._[0] } : {}) });
    if (args.out) { const o = path.resolve(projectOf() || process.cwd(), String(args.out)); fs.writeFileSync(o, css); console.log('BUILD ' + o); }
    else process.stdout.write(css);
    return report(pack);
  }
  if (cmd === 'use') return use(args._[0]);
  if (cmd === 'apply') return apply();
  if (cmd === 'new') {
    const name = args._[0];
    if (!name || !args.display || !args.text) throw new Error('new <name> --display "Family 800" --text "Family" [--body 17,19] [--ratio 1.2,1.25] [--density 1] [--measure 60] [--colors institutional] [--title "..."]');
    const pair = (v, d) => (v && v !== true ? String(v).split(',').map(Number) : d);
    const m = String(args.display).match(/^(.*)\s+(\d{3})$/);
    if (!m) throw new Error('--display "Family 800"');
    const pack = fromRhythm({ name, title: args.title && args.title !== true ? String(args.title) : name, body: pair(args.body, [17, 19]), ratio: pair(args.ratio, [1.2, 1.25]),
      density: args.density ? +args.density : 1, measure: args.measure ? +args.measure : 60, display: [m[1], +m[2]], text: String(args.text), colorsFrom: args.colors && args.colors !== true ? String(args.colors) : 'institutional' });
    const dir = path.join(PACKS, name);
    if (fs.existsSync(path.join(dir, 'pack.json')) && !args.force) throw new Error('pack exists: ' + name + ' (--force replaces it)');
    if (!args.dry) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'pack.json'), JSON.stringify(pack, null, 2) + '\n'); console.log('NEW packs/' + name + '/pack.json (candidate)'); }
    else console.log(JSON.stringify(pack.type, null, 1));
    return report(pack);
  }
  if (cmd === 'proof') {
    // Inside a project with its own pack: prove THAT pack, into the project (design/spec/specimen/, design/review/verify/).
    const project = projectOf();
    if (project && (!args._[0] || args._[0].endsWith('.json')) && fs.existsSync(path.join(project, args._[0] || 'design/spec/pack.json'))) {
      return proofProject(project, path.join(project, args._[0] || 'design/spec/pack.json'));
    }
    const refs = !args._[0] || args._[0] === 'all' ? listPacks() : [args._[0]];
    let worst = 0;
    for (const r of refs) worst = Math.max(worst, await proof(r));
    return worst;
  }
  if (cmd === 'compare') return compare();
  if (cmd === 'drift') { if (!args._[0]) throw new Error('drift <page.html>'); return drift(path.resolve(projectOf() || process.cwd(), args._[0])); }
  if (cmd === 'swap') {
    const [a, b] = args._.map((s) => { const m = s.match(/^(.*)\s+(\d{3})$/); if (!m) throw new Error('give "Family 700"'); return [m[1], +m[2]]; });
    const f = swapFactor(a[0], a[1], b[0], b[1]);
    console.log(`${a.join(' ')} -> ${b.join(' ')}: multiply display sizes by ${f} to keep the optical size`);
    return 0;
  }
  console.error('unknown command ' + cmd);
  return 1;
}

main().then((c) => process.exit(c || 0), (e) => { console.error('system: ' + (e && e.message || e)); process.exit(1); });
