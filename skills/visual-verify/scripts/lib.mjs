/**
 * visual-verify core: target resolution, a static server, the browser, and the
 * settle procedure every capture goes through. Nothing else launches Chromium.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

export const SKILL_DIR = path.dirname(fileURLToPath(import.meta.url));

// Playwright is resolved from the PROJECT (npm i -D playwright), never shipped
// with the kit; then Chromium is found without forcing a download: the bundled
// build, any cached build, then a system Chrome or Edge.
async function loadChromium() {
  const req = createRequire(path.join(process.cwd(), 'noop.js'));
  for (const name of ['playwright', 'playwright-core']) {
    try { const m = await import(pathToFileURL(req.resolve(name)).href); return m.chromium || m.default?.chromium; } catch {}
    try { const m = await import(name); return m.chromium || m.default?.chromium; } catch {}
  }
  throw new Error('Playwright not found. In the project: npm i -D playwright');
}

function cachedChromes() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
    path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright'),
  ].filter(Boolean);
  const found = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root).filter((d) => /^chromium-\d+/.test(d)).sort().reverse()) {
      for (const rel of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux64/chrome', 'chrome-linux/chrome',
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        const p = path.join(root, dir, rel);
        if (fs.existsSync(p)) found.push(p);
      }
    }
  }
  return found;
}

// Viewport heights per width. Height only affects the settle scroll and the
// fold; captures are always full page.
const HEIGHTS = { 1440: 900, 1280: 800, 1024: 768, 768: 1024, 390: 844, 375: 812, 360: 800 };
export const heightFor = (w) => HEIGHTS[w] || Math.round(w * 0.625);

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

/**
 * The project is the folder the tool is run from (or --project DIR). Output
 * goes to <project>/design/review/verify/, never into the kit.
 */
export function resolveProject(args) {
  const dir = path.resolve(args.project && args.project !== true ? String(args.project) : process.cwd());
  if (path.relative(SKILL_DIR, dir).startsWith('..') === false) throw new Error('run from the project root (or pass --project DIR), not from inside the kit');
  return dir;
}

export const outRoot = (project) => path.join(project, 'design', 'review', 'verify');

export function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9֐-׿]+/gi, '-').replace(/^-|-$/g, '') || 'page';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css',
  '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

/** Serve `root` on a free localhost port. file:// breaks root-relative assets and fonts. */
export function serve(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = path.join(root, rel);
      if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
      try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch {}
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

/**
 * A target is a URL, an .html file, or a page folder. Local pages are served
 * from the project root, because pages reach up for shared assets (a page in
 * design/build/home/ linking ../../spec/tokens.css). --root overrides; a page
 * outside the project is served from its own folder.
 */
export async function openTarget(target, rootOverride, project) {
  if (/^https?:\/\//i.test(target)) return { url: target, close: async () => {} };
  let file = path.resolve(target);
  if (!fs.existsSync(file)) throw new Error('no such page: ' + target);
  if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) throw new Error('folder has no index.html: ' + target);
  const inProject = project && !path.relative(project, file).startsWith('..');
  const root = path.resolve(rootOverride || (inProject ? project : path.dirname(file)));
  const rel = path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/');
  if (rel.startsWith('..')) throw new Error('--root must contain the page');
  const { server, port } = await serve(root);
  return { url: `http://127.0.0.1:${port}/${rel}`, close: () => new Promise((r) => server.close(r)) };
}

export async function launch() {
  const chromium = await loadChromium();
  try { return await chromium.launch(); } catch {}
  for (const executablePath of cachedChromes()) {
    try { return await chromium.launch({ executablePath }); } catch {}
  }
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel }); } catch {}
  }
  throw new Error('no Chromium could be launched: npx playwright install chromium (in the project)');
}

/**
 * Settle: fonts, a stepped scroll to the bottom so every IntersectionObserver
 * fires, lazy images, back to the top, then let the load timeline finish.
 * A capture taken without this is not evidence: it once showed a page with
 * everything below the fold missing.
 * Every scroll is `behavior: 'instant'`: with `scroll-behavior: smooth` a plain
 * scrollTo(0, 0) is still animating when the shot is taken, and a sticky header
 * lands mid-page (2026-09-26).
 */
export async function settle(page) {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(200, Math.round(innerHeight * 0.6));
    for (let i = 0; i < 400; i++) {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (scrollY >= max - 2) break;
      scrollTo({ top: Math.min(max, scrollY + step), behavior: 'instant' });
      await sleep(110);
    }
    await sleep(500);
    await Promise.all([...document.images].filter((im) => !im.complete).map((im) =>
      new Promise((r) => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); setTimeout(r, 4000); })));
    scrollTo({ top: 0, behavior: 'instant' });
    await sleep(900);
  });
}

/** What is actually in the capture: identity, width, direction. */
export function identify(page) {
  return page.evaluate(() => {
    const h = document.documentElement;
    return {
      title: document.title,
      url: location.href,
      innerWidth,
      innerHeight,
      scrollY: Math.round(scrollY),
      scrollHeight: h.scrollHeight,
      lang: h.lang || null,
      dir: h.dir || getComputedStyle(document.body).direction,
      bodyDirection: getComputedStyle(document.body).direction,
      horizontalOverflow: h.scrollWidth > innerWidth + 1 ? h.scrollWidth - innerWidth : 0,
    };
  });
}

/**
 * Content still invisible after the settle scroll. Carousels and tabs hide
 * legitimately; everything else here means the capture is lying.
 */
export function hiddenAfterScroll(page) {
  return page.evaluate(() => {
    const skip = (el) => el.closest('[aria-hidden="true"], dialog:not([open]), details:not([open]) > :not(summary), [hidden], template, noscript');
    const fixedAncestor = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed') return true; } return false; };
    const effOpacity = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); o *= parseFloat(cs.opacity); if (cs.visibility === 'hidden') return 0; } return o; };
    const hasContent = (el) => /^(IMG|PICTURE|VIDEO|SVG|CANVAS)$/i.test(el.tagName) || [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    const sel = (el) => { if (el.id) return '#' + el.id; const c = [...el.classList].slice(0, 2).join('.'); return el.tagName.toLowerCase() + (c ? '.' + c : ''); };
    const hits = new Map();
    for (const el of document.body.querySelectorAll('*')) {
      if (!hasContent(el) || skip(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 12) continue;
      if (r.right < 0 || r.left > innerWidth) continue; // off-canvas menus
      if (effOpacity(el) > 0.05) continue;
      if (fixedAncestor(el)) continue;
      // Report the outermost invisible element, once.
      let root = el;
      for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (parseFloat(cs.opacity) <= 0.05 || cs.visibility === 'hidden') root = e;
      }
      const key = sel(root);
      if (!hits.has(key)) hits.set(key, { selector: key, text: (root.innerText || root.alt || '').trim().slice(0, 60), top: Math.round(r.top + scrollY) });
    }
    return [...hits.values()];
  });
}

export function appendJsonl(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}

export function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
