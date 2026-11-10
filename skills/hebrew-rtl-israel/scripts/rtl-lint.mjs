// Flags physical left/right CSS and unisolated phone numbers in HTML. Usage: node rtl-lint.mjs <dir>
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const [,, root = 'src'] = process.argv;
const files = [];
const walk = d => { for (const f of readdirSync(d)) { const p = join(d, f); if (f === 'node_modules' || f.startsWith('.')) continue; statSync(p).isDirectory() ? walk(p) : /\.(css|html|js|mjs|astro|vue|jsx|tsx)$/.test(f) && files.push(p); } };
walk(root);
const cssRules = [
  [/\b(margin|padding|border)-(left|right)\s*:/g, 'physical margin/padding/border; use -inline-start/-end'],
  [/(^|[^-\w])(left|right)\s*:\s*[^;]+;/g, 'physical left/right offset; use inset-inline-*'],
  [/text-align\s*:\s*(left|right)/g, 'text-align left/right; use start/end'],
  [/border-(top|bottom)-(left|right)-radius/g, 'physical corner radius; use border-start-start-radius etc.'],
  [/float\s*:\s*(left|right)/g, 'float left/right; use inline-start/end'],
];
let count = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const [re, msg] of cssRules) for (const m of src.matchAll(re)) { count++; console.log(`${f}:${src.slice(0, m.index).split('\n').length}  ${msg}  [${m[0].trim()}]`); }
  if (/\.(html|astro|vue|jsx|tsx)$/.test(f)) {
    for (const m of src.matchAll(/(?<!<bdi>)\b0\d{1,2}-?\d{3}-?\d{4}\b(?!<\/bdi>)/g)) { count++; console.log(`${f}:${src.slice(0, m.index).split('\n').length}  phone number not wrapped in <bdi>  [${m[0]}]`); }
    if (/<html(?![^>]*dir="rtl")/.test(src)) { count++; console.log(`${f}: <html> without dir="rtl"`); }
  }
}
console.log(count ? `${count} issue(s)` : 'RTL lint clean');
process.exit(count ? 1 : 0);
