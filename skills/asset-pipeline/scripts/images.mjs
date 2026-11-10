// Responsive AVIF/WebP + blur placeholder. Usage: node images.mjs <in-dir> <out-dir> [widths]
// Requires `sharp` installed in the project (npm i -D sharp). Run from the project root.
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { createRequire } from 'node:module';
const sharp = createRequire(join(process.cwd(), 'package.json'))('sharp');

const [,, inDir, outDir, widthsArg = '480,960,1440,2000'] = process.argv;
if (!inDir || !outDir) { console.error('usage: images.mjs <in-dir> <out-dir> [widths]'); process.exit(1); }
const widths = widthsArg.split(',').map(Number);
mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const f of readdirSync(inDir).filter(f => /\.(jpe?g|png|tiff?|webp)$/i.test(f))) {
  const { name } = parse(f);
  const img = sharp(join(inDir, f)).rotate();
  const meta = await img.metadata();
  const out = { width: meta.width, height: meta.height, avif: [], webp: [] };
  for (const w of widths.filter(w => w <= meta.width).concat(meta.width < Math.min(...widths) ? [meta.width] : [])) {
    const base = join(outDir, `${name}-${w}`);
    await img.clone().resize({ width: w }).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
    await img.clone().resize({ width: w }).webp({ quality: 78 }).toFile(`${base}.webp`);
    out.avif.push(`${name}-${w}.avif ${w}w`); out.webp.push(`${name}-${w}.webp ${w}w`);
  }
  const blur = await img.clone().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
  out.placeholder = `data:image/webp;base64,${blur.toString('base64')}`;
  manifest[name] = out;
  console.log(`${f}: ${out.avif.length} sizes`);
}
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
