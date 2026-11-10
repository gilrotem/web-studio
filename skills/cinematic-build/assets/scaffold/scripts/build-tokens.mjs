// DTCG tokens.json -> src/styles/tokens.css. Usage: node scripts/build-tokens.mjs [tokens.json] [out.css]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [,, inPath = 'design/tokens/tokens.json', outPath = 'src/styles/tokens.css'] = process.argv;
const tokens = JSON.parse(readFileSync(inPath, 'utf8'));
const lines = [];
const walk = (node, path) => {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const name = [...path, k].join('-');
      const val = typeof v.$value === 'object' ? JSON.stringify(v.$value) : v.$value;
      lines.push(`  --${name}: ${val};`);
    } else if (v && typeof v === 'object') walk(v, [...path, k]);
  }
};
walk(tokens, []);
const css = `@layer tokens {\n:root {\n${lines.join('\n')}\n}\n}\n`;
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, css);
console.log(`${lines.length} tokens -> ${outPath}`);
