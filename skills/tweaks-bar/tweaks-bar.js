/**
 * Tweaks Bar — live design controls for dev.
 *
 * Decisions like "make it more luxurious" are made faster by looking than by
 * another round of prompts. This panel discovers the CSS custom properties the
 * project already declares on :root, gives each one a live control, and exports
 * the changed values as CSS so a decision made by eye can be baked into tokens.
 *
 * It edits nothing but inline styles on :root, so removing the script restores
 * the original design exactly.
 *
 * Usage (dev only — never ship it):
 *   <script src="/tweaks-bar.js"></script>
 * Toggle with Ctrl+`  ·  Reset with the Reset button  ·  Export copies CSS.
 */
(() => {
  if (window.__tweaksBar) return;
  window.__tweaksBar = true;

  const COLOR_RE = /^(#|rgb|hsl|oklch|color\()/i;
  const LENGTH_RE = /^-?[\d.]+(px|rem|em)$/;
  const TIME_RE = /^-?[\d.]+m?s$/;

  /** Read every custom property declared on :root across same-origin sheets. */
  function discoverTokens() {
    const found = new Map();
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin sheet — nothing we can do, and nothing we need
      }
      for (const rule of rules) {
        if (!rule.selectorText || !/(^|,)\s*(:root|html)\s*(,|$)/.test(rule.selectorText)) continue;
        for (const name of rule.style) {
          if (!name.startsWith('--')) continue;
          const value = rule.style.getPropertyValue(name).trim();
          if (value) found.set(name, value);
        }
      }
    }
    return found;
  }

  function classify(value) {
    if (COLOR_RE.test(value)) return 'color';
    if (LENGTH_RE.test(value)) return 'length';
    if (TIME_RE.test(value)) return 'time';
    return null;
  }

  const root = document.documentElement;
  const tokens = discoverTokens();
  const changed = new Map();
  const baseFontSize = parseFloat(getComputedStyle(root).fontSize) || 16;

  const groups = { color: [], length: [], time: [] };
  for (const [name, value] of tokens) {
    const kind = classify(value);
    if (kind) groups[kind].push([name, value]);
  }
  for (const list of Object.values(groups)) list.sort((a, b) => a[0].localeCompare(b[0]));

  const set = (name, value) => {
    root.style.setProperty(name, value);
    changed.set(name, value);
    countEl.textContent = changed.size ? `${changed.size} changed` : '';
  };

  // ---- panel ------------------------------------------------------------
  const panel = document.createElement('div');
  panel.dir = 'ltr';
  panel.setAttribute('data-tweaks-bar', '');
  panel.innerHTML = `
    <style>
      [data-tweaks-bar]{position:fixed;bottom:16px;left:16px;z-index:2147483647;
        width:300px;max-height:78vh;overflow:auto;background:#111;color:#eee;
        font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;border:1px solid #333;
        border-radius:8px;padding:10px;box-shadow:0 8px 32px rgba(0,0,0,.5)}
      [data-tweaks-bar] h4{margin:12px 0 6px;font-size:10px;letter-spacing:.12em;
        text-transform:uppercase;color:#888;font-weight:600}
      [data-tweaks-bar] h4:first-of-type{margin-top:6px}
      [data-tweaks-bar] .row{display:flex;align-items:center;gap:6px;margin:3px 0}
      [data-tweaks-bar] .row label{flex:1;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;color:#bbb}
      [data-tweaks-bar] input[type=range]{width:96px}
      [data-tweaks-bar] input[type=color]{width:26px;height:20px;padding:0;
        border:1px solid #444;background:none}
      [data-tweaks-bar] .val{width:52px;text-align:right;color:#7dd3a0}
      [data-tweaks-bar] .bar{display:flex;gap:6px;margin-top:10px;
        border-top:1px solid #333;padding-top:8px}
      [data-tweaks-bar] button{flex:1;background:#222;color:#eee;border:1px solid #444;
        border-radius:4px;padding:5px;cursor:pointer;font:inherit}
      [data-tweaks-bar] button:hover{background:#2c2c2c}
      [data-tweaks-bar] .count{color:#7dd3a0;font-size:10px;text-align:center;
        margin-top:6px;min-height:12px}
    </style>
    <div id="tb-body"></div>
    <div class="bar">
      <button id="tb-export">Export CSS</button>
      <button id="tb-reset">Reset</button>
    </div>
    <div class="count" id="tb-count"></div>`;
  document.body.appendChild(panel);

  const body = panel.querySelector('#tb-body');
  const countEl = panel.querySelector('#tb-count');

  const section = (title) => {
    const h = document.createElement('h4');
    h.textContent = title;
    body.appendChild(h);
  };
  const row = (labelText) => {
    const el = document.createElement('div');
    el.className = 'row';
    const label = document.createElement('label');
    label.textContent = labelText;
    label.title = labelText;
    el.appendChild(label);
    body.appendChild(el);
    return el;
  };

  // Global scales — these work even on projects with few tokens.
  section('Scale');

  const typeRow = row('type scale');
  const typeInput = Object.assign(document.createElement('input'),
    { type: 'range', min: '75', max: '140', value: '100' });
  const typeVal = Object.assign(document.createElement('span'), { className: 'val', textContent: '100%' });
  typeInput.oninput = () => {
    root.style.fontSize = `${(baseFontSize * typeInput.value) / 100}px`;
    typeVal.textContent = `${typeInput.value}%`;
  };
  typeRow.append(typeInput, typeVal);

  const motionStyle = document.createElement('style');
  document.head.appendChild(motionStyle);
  const motionRow = row('motion speed');
  const motionInput = Object.assign(document.createElement('input'),
    { type: 'range', min: '0', max: '300', value: '100' });
  const motionVal = Object.assign(document.createElement('span'), { className: 'val', textContent: '100%' });
  motionInput.oninput = () => {
    const f = motionInput.value / 100;
    motionStyle.textContent = f === 1 ? '' :
      `*,*::before,*::after{transition-duration:calc(var(--tb-d,1) * ${f}) !important;
       animation-duration:calc(var(--tb-a,1) * ${f}) !important}`;
    motionVal.textContent = `${motionInput.value}%`;
  };
  motionRow.append(motionInput, motionVal);

  // Discovered tokens.
  if (groups.color.length) {
    section(`Color (${groups.color.length})`);
    for (const [name, value] of groups.color) {
      const el = row(name.replace(/^--/, ''));
      const input = Object.assign(document.createElement('input'), { type: 'color' });
      try { input.value = toHex(value); } catch { /* non-hex-able color, picker starts black */ }
      input.oninput = () => set(name, input.value);
      el.appendChild(input);
    }
  }

  if (groups.length.length) {
    section(`Spacing & size (${groups.length.length})`);
    for (const [name, value] of groups.length) {
      const num = parseFloat(value);
      const unit = value.replace(/^-?[\d.]+/, '');
      const el = row(name.replace(/^--/, ''));
      const input = Object.assign(document.createElement('input'),
        { type: 'range', min: '0', max: String(Math.max(num * 3, 1)), step: String(Math.max(num / 50, 0.01)), value: String(num) });
      const val = Object.assign(document.createElement('span'), { className: 'val', textContent: value });
      input.oninput = () => {
        const v = `${round(input.value)}${unit}`;
        val.textContent = v;
        set(name, v);
      };
      el.append(input, val);
    }
  }

  if (groups.time.length) {
    section(`Timing (${groups.time.length})`);
    for (const [name, value] of groups.time) {
      const ms = value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
      const el = row(name.replace(/^--/, ''));
      const input = Object.assign(document.createElement('input'),
        { type: 'range', min: '0', max: String(Math.max(ms * 3, 100)), step: '10', value: String(ms) });
      const val = Object.assign(document.createElement('span'), { className: 'val', textContent: value });
      input.oninput = () => {
        const v = `${input.value}ms`;
        val.textContent = v;
        set(name, v);
      };
      el.append(input, val);
    }
  }

  if (!groups.color.length && !groups.length.length && !groups.time.length) {
    const note = document.createElement('div');
    note.style.cssText = 'color:#c99;margin:8px 0';
    note.textContent = 'No :root custom properties found. Tokenize first — the bar edits tokens, not magic numbers.';
    body.appendChild(note);
  }

  function round(n) { return Math.round(parseFloat(n) * 100) / 100; }

  function toHex(value) {
    if (value.startsWith('#')) {
      return value.length === 4
        ? `#${[...value.slice(1)].map((c) => c + c).join('')}`
        : value.slice(0, 7);
    }
    const probe = document.createElement('div');
    probe.style.color = value;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/\d+/g);
    probe.remove();
    if (!rgb) throw new Error('unparseable');
    return `#${rgb.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  }

  panel.querySelector('#tb-export').onclick = async () => {
    const lines = [...changed].map(([k, v]) => `  ${k}: ${v};`);
    if (typeInput.value !== '100') lines.push(`  /* root font-size: ${(baseFontSize * typeInput.value) / 100}px */`);
    if (motionInput.value !== '100') lines.push(`  /* motion speed: ${motionInput.value}% of baseline */`);
    const css = lines.length ? `:root {\n${lines.join('\n')}\n}` : '/* nothing changed */';
    try {
      await navigator.clipboard.writeText(css);
      countEl.textContent = 'copied to clipboard';
    } catch {
      console.log(css);
      countEl.textContent = 'logged to console';
    }
  };

  panel.querySelector('#tb-reset').onclick = () => {
    for (const name of changed.keys()) root.style.removeProperty(name);
    changed.clear();
    root.style.fontSize = '';
    motionStyle.textContent = '';
    panel.remove();
    window.__tweaksBar = false;
    location.reload();
  };

  addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') {
      panel.style.display = panel.style.display === 'none' ? '' : 'none';
    }
  });
})();
