/**
 * The measured half of the review. Runs on the rendered page, not the source,
 * so it sees what the visitor sees: inherited colors, alpha, opacity, scrims.
 *
 * Checks, each against a number the studio already holds:
 *   contrast   WCAG AA: 4.5:1 body, 3:1 large (>=24px, or >=18.66px at 700+).
 *              Kernel gate 2 / signature 3.2.
 *   body-16    running text under 16px. Signature 2, "Still never".
 *   measure    running text wider than 70 characters per line. Signature 2 / 8.
 *
 * Text over a picture (image, gradient, video, canvas, SVG) has no single
 * background color. It is found geometrically, then MEASURED: the text is hidden,
 * the pixels under its glyph box are captured, and the verdict is the 10th
 * percentile of per-pixel contrast (method "sampled"). Only what cannot be
 * sampled stays UNVERIFIABLE, and unverifiable is never a pass.
 *
 * Not modelled (see MAINTENANCE.md): text-shadow and stroke, mix-blend-mode,
 * filters, and opacity on an ancestor above the element that supplies the
 * background.
 */

function measureInPage() {
  return (() => {
    // ---- color plumbing: any CSS color -> sRGB 0..255 + alpha, via the canvas
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    const cache = new Map();
    function rgba(css) {
      if (cache.has(css)) return cache.get(css);
      let out;
      if (!css || css === 'transparent' || css === 'rgba(0, 0, 0, 0)') out = [0, 0, 0, 0];
      else {
        cx.clearRect(0, 0, 1, 1);
        cx.fillStyle = '#000';
        cx.fillStyle = css;
        cx.fillRect(0, 0, 1, 1);
        const d = cx.getImageData(0, 0, 1, 1).data;
        out = [d[0], d[1], d[2], d[3] / 255];
      }
      cache.set(css, out);
      return out;
    }
    const over = (top, under) => {
      const a = top[3] + under[3] * (1 - top[3]);
      if (a === 0) return [0, 0, 0, 0];
      return [0, 1, 2].map((i) => (top[i] * top[3] + under[i] * under[3] * (1 - top[3])) / a).concat(a);
    };
    const lum = ([r, g, b]) => {
      const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

    const sel = (el) => {
      if (el.id) return '#' + el.id;
      const parts = [];
      for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement) {
        if (e.id) { parts.unshift('#' + e.id); break; }
        const c = [...e.classList].slice(0, 2).join('.');
        parts.unshift(e.tagName.toLowerCase() + (c ? '.' + c : ''));
      }
      return parts.join(' > ');
    };
    const MEDIA = /^(IMG|PICTURE|VIDEO|CANVAS|IFRAME|OBJECT|EMBED)$/;

    // Everything that paints a picture: media elements and background images.
    // Collected once; checked geometrically, because decorative images are
    // usually pointer-events: none and invisible to the hit test (a client hero,
    // 26/9/2026: the audit passed text sitting on the photograph).
    const pictures = [];
    for (const e of document.body.querySelectorAll('*')) {
      const tag = e.tagName.toUpperCase();
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
      const isMedia = MEDIA.test(tag) || (tag === 'SVG' && !e.parentElement.closest('svg'));
      const hasBg = cs.backgroundImage && cs.backgroundImage !== 'none';
      const pseudo = ['::before', '::after'].some((ps) => { const p = getComputedStyle(e, ps); return p.content !== 'none' && p.backgroundImage && p.backgroundImage !== 'none'; });
      if (isMedia || hasBg || pseudo) pictures.push({ e, what: isMedia ? '<' + tag.toLowerCase() + '>' : hasBg ? 'background-image' : 'pseudo-element background-image' });
    }
    const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

    /**
     * The background behind `el`, in paint order: the hit-test stack under the
     * text's center, or the ancestor chain when the element is not
     * hit-testable. Then the honesty check: any picture overlapping the text
     * inside the same painted layer makes it unverifiable.
     */
    function background(el, rect) {
      const x = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
      const y = Math.min(innerHeight - 1, Math.max(0, rect.top + Math.min(rect.height, 40) / 2));
      const chain = []; for (let e = el; e; e = e.parentElement) chain.push(e);
      // Not hit-testable here (pointer-events: none, clipped by a scroller,
      // covered): the ancestor chain, starting at the element itself. Starting
      // at an ancestor would skip the element's own background (a mobile
      // table header, 2026-09-26).
      let stack = document.elementsFromPoint(x, y);
      let i = stack.indexOf(el);
      if (i < 0) { stack = chain; i = 0; }
      const layers = [];
      for (let k = i; k < stack.length; k++) {
        const e = stack[k];
        const cs = getComputedStyle(e);
        const bg = rgba(cs.backgroundColor);
        if (bg[3] > 0) layers.push({ c: bg, by: e });
        if (bg[3] >= 0.999) break;
      }
      const provider = layers.length ? layers[layers.length - 1].by : null;
      const area = rect.width * rect.height;
      for (const p of pictures) {
        if (p.e === el || el.contains(p.e)) continue;           // icons inside the text's own box
        if (provider && provider !== p.e && !provider.contains(p.e)) continue; // an opaque layer sits between
        if (p.e.contains(el) && p.what === '<svg>') continue;
        const r = p.e.getBoundingClientRect();
        if (overlap(r, rect) >= 0.1 * area) return { unverifiable: 'text over ' + p.what + ' ' + sel(p.e), provider };
      }
      let base = [255, 255, 255, 1]; // the canvas behind an unpainted page
      for (let k = layers.length - 1; k >= 0; k--) base = over(layers[k].c, base);
      return { color: base, provider };
    }

    const RUNNING = /^(P|LI|DD|BLOCKQUOTE|TD)$/;
    const measureCtx = document.createElement('canvas').getContext('2d');
    const groups = new Map();
    const pending = [];
    const body16 = [];
    const gradientText = [];
    const measure = [];
    // Bidi (CANON 4): a numeric range joined by a dash, sitting in RTL text
    // without LTR isolation, renders reversed ("08:30–18:00" shows 18:00–08:30).
    const bidi = [];
    const RANGE = /\d[\d:.,/]*\s?[–—]\s?\d|\d[\d:.,/]*\s[-–—]\s\d/;
    const isolated = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.tagName === 'BDI' || x.getAttribute('dir') === 'ltr') return true; const u = getComputedStyle(x).unicodeBidi; if (/isolate/.test(u) && getComputedStyle(x).direction === 'ltr') return true; } return false; };
    let checked = 0;

    for (const el of document.body.querySelectorAll('*')) {
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION|SVG|TITLE)$/i.test(el.tagName)) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
      if (own.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility !== 'visible' || cs.display === 'none') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue; // visually-hidden patterns
      if (el.closest('[aria-hidden="true"]')) continue;

      // Scroll the element into the viewport so the hit-test stack is real.
      const docTop = rect.top + scrollY;
      if (rect.top < 0 || rect.bottom > innerHeight) {
        scrollTo({ top: Math.max(0, docTop - innerHeight / 3), behavior: 'instant' });
      }
      const r = el.getBoundingClientRect();

      // The painted fill: -webkit-text-fill-color wins over color, and
      // background-clip: text paints the glyphs with a background image.
      const clipText = cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
      const fg0 = clipText ? [0, 0, 0, 1] : rgba(cs.webkitTextFillColor || cs.color);
      if (clipText) gradientText.push({ selector: sel(el), text: own.slice(0, 50) });
      // Opacity from the element up to (not including) the background provider.
      const bgInfo = clipText ? { unverifiable: 'gradient-filled text (background-clip: text)', provider: null } : background(el, r);
      let alpha = fg0[3];
      for (let e = el; e && e !== bgInfo.provider; e = e.parentElement) alpha *= parseFloat(getComputedStyle(e).opacity);
      if (alpha < 0.02) continue;
      checked++;

      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      let key, entry;
      if (bgInfo.unverifiable) {
        key = 'U|' + bgInfo.unverifiable;
        entry = { verdict: 'unverifiable', reason: bgInfo.unverifiable };
        if (pending.length < 80) {
          el.setAttribute('data-vv', String(pending.length));
          pending.push({ vv: pending.length, mode: clipText ? 'diff' : 'fill', fg: [fg0[0], fg0[1], fg0[2], alpha], need, large, reason: bgInfo.unverifiable, selector: sel(el), text: own.slice(0, 50), size, weight, top: Math.round(docTop) });
          entry = null; // measured from pixels after this pass
        }
      } else {
        const fg = over([fg0[0], fg0[1], fg0[2], alpha], bgInfo.color);
        const cr = Math.round(ratio(fg, bgInfo.color) * 100) / 100;
        const verdict = cr >= need ? 'pass' : 'fail';
        key = [verdict, hex(fg), hex(bgInfo.color), large ? 'L' : 'N'].join('|');
        entry = { verdict, text: hex(fg), background: hex(bgInfo.color), ratio: cr, need, large };
      }
      if (entry) {
        const g = groups.get(key) || { ...entry, count: 0, examples: [] };
        g.count++;
        if (g.examples.length < 3) g.examples.push({ selector: sel(el), text: own.slice(0, 50), size, weight, top: Math.round(docTop) });
        groups.set(key, g);
      }

      if (cs.direction === 'rtl') {
        for (const n of el.childNodes) {
          if (n.nodeType !== 3) continue;
          const m = n.textContent.match(RANGE);
          if (m && !isolated(el)) { bidi.push({ selector: sel(el), text: m[0], context: n.textContent.trim().slice(0, 50) }); break; }
        }
      }

      if (RUNNING.test(el.tagName) && own.length >= 60) {
        if (size < 16) body16.push({ selector: sel(el), size, text: own.slice(0, 50) });
        if (own.length >= 120) {
          measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const perChar = measureCtx.measureText(own).width / own.length;
          const box = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const cpl = Math.round(box / perChar);
          if (cpl > 70) measure.push({ selector: sel(el), charsPerLine: cpl, width: Math.round(box), text: own.slice(0, 50) });
        }
      }
    }
    scrollTo({ top: 0, behavior: 'instant' });

    const all = [...groups.values()];
    const fails = all.filter((g) => g.verdict === 'fail').sort((a, b) => a.ratio - b.ratio);
    const unverifiable = all.filter((g) => g.verdict === 'unverifiable');
    return {
      checked,
      summary: {
        contrastFail: fails.reduce((n, g) => n + g.count, 0),
        contrastFailGroups: fails.length,
        unverifiable: unverifiable.reduce((n, g) => n + g.count, 0),
        body16: body16.length,
        measure: measure.length,
        bidi: bidi.length,
        gradientText: gradientText.length,
      },
      contrast: { fail: fails, unverifiable, pass: all.filter((g) => g.verdict === 'pass') },
      body16,
      measure,
      bidi,
      gradientText,
      pending,
    };
  })();
}

/**
 * Text over a picture is measured, not guessed: hide the text, capture the
 * pixels under its glyph box, and take the contrast of the text color against
 * every pixel. The verdict uses the 10th percentile, so a few bright specks do
 * not fail a line and a bright half does. min and median are recorded too.
 */
async function sample(page, item) {
  const rect = await page.evaluate((vv) => {
    const el = document.querySelector(`[data-vv="${vv}"]`);
    if (!el) return null;
    for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.visibility !== 'visible' || parseFloat(c.opacity) < 0.05) return { gone: true }; }
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    // Only the element's own text lines: an icon beside the text is not what
    // the text sits on (a hero with tick icons, 2026-09-26: a check icon inside
    // the box produced a false 1.48:1).
    const lines = [];
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const q of r.getClientRects()) if (q.width > 1 && q.height > 1) lines.push(q);
    }
    if (!lines.length) return null;
    const b = { left: Math.min(...lines.map((q) => q.left)), top: Math.min(...lines.map((q) => q.top)), right: Math.max(...lines.map((q) => q.right)), bottom: Math.max(...lines.map((q) => q.bottom)) };
    b.width = b.right - b.left; b.height = b.bottom - b.top;
    const keep = [el, ...el.querySelectorAll('*')].map((e) => [e, e.getAttribute('style')]);
    window.__vvRestore = () => keep.forEach(([e, st]) => (st === null ? e.removeAttribute('style') : e.setAttribute('style', st)));
    window.__vvHide = () => {
      for (const [e] of keep) {
        // transition: none first, or the color fades out over the shot and the
        // text samples itself (a carousel with `transition: all`, 2026-09-26).
        for (const [prop, val] of [['transition', 'none'], ['animation', 'none'], ['color', 'transparent'], ['-webkit-text-fill-color', 'transparent'], ['text-shadow', 'none'], ['-webkit-text-stroke', '0'], ['text-decoration-color', 'transparent']]) e.style.setProperty(prop, val, 'important');
        const cs = getComputedStyle(e);
        if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') e.style.setProperty('background-image', 'none', 'important');
      }
      for (const [e] of keep) void getComputedStyle(e).color; // flush
    };
    const x = Math.max(0, Math.floor(b.left)), y = Math.max(0, Math.floor(b.top));
    return { x, y, width: Math.min(innerWidth - x, Math.ceil(b.right - x)), height: Math.min(innerHeight - y, Math.ceil(b.bottom - y)), lines: lines.map((q) => [q.left - x, q.top - y, q.right - x, q.bottom - y]) };
  }, item.vv);
  if (!rect || rect.width < 2 || rect.height < 2) { await page.evaluate(() => window.__vvRestore && window.__vvRestore()); return null; }
  if (rect && rect.gone) return { gone: true };
  const frame = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await frame();
  const { lines } = rect;
  delete rect.lines;
  const withText = item.mode === 'diff' ? await page.screenshot({ clip: rect, animations: 'disabled' }) : null;
  await page.evaluate(() => window.__vvHide());
  await frame();
  const under = await page.screenshot({ clip: rect, animations: 'disabled' });
  // A background that moves (carousel, video, animation) cannot be sampled:
  // take it again and compare.
  await page.waitForTimeout(300);
  const again = await page.screenshot({ clip: rect, animations: 'disabled' });
  await page.evaluate(() => window.__vvRestore && window.__vvRestore());
  if (!under.equals(again)) {
    const moved = await page.evaluate(async ({ a, b }) => {
      const load = async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
      const [p, q] = [await load(a), await load(b)];
      let changed = 0;
      for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 30) changed++;
      return changed / (p.length / 4);
    }, { a: under.toString('base64'), b: again.toString('base64') });
    if (moved > 0.02) return { moving: Math.round(moved * 100) };
  }
  return page.evaluate(async ({ under, withText, fg, lines }) => {
    const pixels = async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const cx = c.getContext('2d');
      cx.drawImage(img, 0, 0);
      return cx.getImageData(0, 0, c.width, c.height);
    };
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const L = (r, g, b) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    const cr = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const img = await pixels(under);
    const d = img.data, W = img.width;
    const inText = (i) => { const px = (i / 4) % W, py = Math.floor(i / 4 / W); return lines.some(([l, t, r, b]) => px >= l && px < r && py >= t && py < b); };
    const ratios = [];
    const step = Math.max(1, Math.floor(d.length / 4 / 40000)); // cap the work, keep coverage
    if (withText) {
      // Fill unknown (gradient text): compare each glyph-core pixel with the
      // same pixel without the text. Cores are the pixels the text changed most.
      const t = (await pixels(withText)).data;
      const diffs = [];
      for (let i = 0; i < d.length; i += 4 * step) {
        if (!inText(i)) continue;
        const lt = L(t[i], t[i + 1], t[i + 2]), lb = L(d[i], d[i + 1], d[i + 2]);
        diffs.push([Math.abs(lt - lb), cr(lt, lb)]);
      }
      let max = 0;
      for (const [dl] of diffs) if (dl > max) max = dl;
      for (const [dl, r] of diffs) if (max > 0 && dl >= 0.6 * max) ratios.push(r);
      if (!ratios.length) ratios.push(1);
    } else {
      for (let i = 0; i < d.length; i += 4 * step) {
        if (!inText(i)) continue;
        const a = fg[3];
        ratios.push(cr(L(fg[0] * a + d[i] * (1 - a), fg[1] * a + d[i + 1] * (1 - a), fg[2] * a + d[i + 2] * (1 - a)), L(d[i], d[i + 1], d[i + 2])));
      }
    }
    if (!ratios.length) return null;
    ratios.sort((p, q) => p - q);
    const at = (q) => Math.round(ratios[Math.min(ratios.length - 1, Math.floor(q * ratios.length))] * 100) / 100;
    return { min: at(0), p10: at(0.1), median: at(0.5), pixels: ratios.length };
  }, { under: under.toString('base64'), withText: withText ? withText.toString('base64') : null, fg: item.fg, lines });
}

const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

export async function audit(page) {
  // Freeze the page after the capture: a rotating carousel swaps what is under
  // the text between measuring and sampling (a carousel, two slides with the
  // same heading in the same place, 26/9/2026). Timer-driven motion stops here;
  // requestAnimationFrame loops do not, which the moving-background check covers.
  await page.evaluate(() => { const top = setTimeout(() => {}, 0); for (let i = 0; i <= top; i++) { clearTimeout(i); clearInterval(i); } });
  await page.waitForTimeout(800); // let a transition already in flight land
  const report = await page.evaluate(measureInPage);
  const sampled = new Map();
  for (const item of report.pending) {
    let s = await sample(page, item);
    if (s && s.moving) { item.reason += ` (background moving: ${s.moving}% of pixels changed in 300ms)`; s = null; }
    if (s && s.gone) { item.reason += ' (no longer visible when sampled: rotating content)'; s = null; }
    if (!s) {
      // Could not be sampled (off-screen or zero-size glyph box): stays unverifiable.
      let u = report.contrast.unverifiable.find((x) => x.reason === item.reason);
      if (!u) report.contrast.unverifiable.push((u = { verdict: 'unverifiable', reason: item.reason, count: 0, examples: [] }));
      u.count++;
      if (u.examples.length < 3) u.examples.push({ selector: item.selector, text: item.text, size: item.size, weight: item.weight, top: item.top });
      continue;
    }
    const verdict = s.p10 >= item.need ? 'pass' : 'fail';
    const key = [verdict, item.mode === 'diff' ? 'gradient' : hex(item.fg), item.reason].join('|');
    const g = sampled.get(key) || { verdict, method: item.mode === 'diff' ? 'sampled-diff' : 'sampled', text: item.mode === 'diff' ? 'gradient fill' : hex(item.fg), background: 'pixels: ' + item.reason.replace(/^text over /, ''), ratio: Infinity, min: Infinity, need: item.need, large: item.large, count: 0, examples: [] };
    g.count++;
    g.ratio = Math.min(g.ratio, s.p10);
    g.min = Math.min(g.min, s.min);
    g.need = Math.max(g.need, item.need);
    if (g.examples.length < 3) g.examples.push({ selector: item.selector, text: item.text, size: item.size, weight: item.weight, top: item.top, p10: s.p10, min: s.min, median: s.median });
    sampled.set(key, g);
  }
  await page.evaluate(() => document.querySelectorAll('[data-vv]').forEach((e) => e.removeAttribute('data-vv')));
  for (const g of sampled.values()) report.contrast[g.verdict].push(g);
  report.contrast.unverifiable = report.contrast.unverifiable.filter((u) => u.count > 0);
  report.contrast.fail.sort((a, b) => a.ratio - b.ratio);
  const fails = report.contrast.fail;
  report.summary.contrastFail = fails.reduce((n, g) => n + g.count, 0);
  report.summary.contrastFailGroups = fails.length;
  report.summary.unverifiable = report.contrast.unverifiable.reduce((n, g) => n + g.count, 0);
  report.summary.sampled = [...sampled.values()].reduce((n, g) => n + g.count, 0);
  delete report.pending;
  return report;
}
