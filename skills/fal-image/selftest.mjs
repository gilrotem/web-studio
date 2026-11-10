#!/usr/bin/env node
/**
 * The toolkit checking itself, with no network and no key: the cap parser, the
 * spend ledger, and the refusal of generate, edit, batch and gate in dry mode
 * against a throwaway project in the OS temp folder. Nothing is sent to fal.
 *
 *   node selftest.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCapLine, spentSoFar, TIER_PX, capToTier, estimateCost } from './fal.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let pass = 0;
let fail = 0;
const ok = (cond, what) => { if (cond) { pass += 1; console.log('  ok    ' + what); } else { fail += 1; console.log('  FAIL  ' + what); } };

console.log('cap line');
ok(parseCapLine('**Imagery budget:** USD 40 per project').usd === 40, 'USD 40 per project -> 40');
ok(parseCapLine('**Imagery budget:** $12.5 per month').period === 'month', '$12.5 per month -> month');
ok(parseCapLine('**Imagery budget:** `none`').usd === 0, 'none -> 0');
ok(parseCapLine('**Imagery budget:** `null` (the cap ...)').usd === null, 'null -> not set');
ok(parseCapLine('# no line here').usd === null, 'missing line -> not set');
ok(parseCapLine('**Imagery budget:** 30 USD per project (set at birth)').usd === 30, '30 USD with a note -> 30');

console.log('billing geometry');
ok(capToTier({ width: 2816, height: 1584 }).width * capToTier({ width: 2816, height: 1584 }).height <= TIER_PX, '2816x1584 caps under the 1-unit line');
ok(estimateCost('seedream-pro', 2048 * 1160) === 0.135, '2048x1160 prices at 2 units');
ok(estimateCost('seedream-pro', 2048 * 1152) === 0.0675, '2048x1152 prices at 1 unit');

const root = mkdtempSync(path.join(os.tmpdir(), 'fal-selftest-'));
try {
  mkdirSync(path.join(root, 'design', 'spec'), { recursive: true });
  mkdirSync(path.join(root, 'round'), { recursive: true });
  const contract = (line) => writeFileSync(path.join(root, 'design', 'spec', 'contract.md'), '# Contract\n\n' + line + '\n');
  const run = (script, args) => spawnSync(process.execPath, [path.join(HERE, script), ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, FAL_KEY: '', FAL_AI_API_KEY: '' } });

  console.log('spend ledger');
  const month = new Date().toISOString().slice(0, 7);
  writeFileSync(path.join(root, 'design', 'spend.jsonl'), [
    JSON.stringify({ at: month + '-01T10:00:00.000Z', usd: 0.5 }),
    JSON.stringify({ at: '2020-01-01T10:00:00.000Z', usd: 2 }),
  ].join('\n') + '\n');
  ok(Math.abs(spentSoFar(root, 'project') - 2.5) < 1e-9, 'per project sums every line (2.50)');
  ok(Math.abs(spentSoFar(root, 'month') - 0.5) < 1e-9, 'per month sums this month only (0.50)');

  console.log('refusals, dry mode');
  contract('**Imagery budget:** `none`');
  let r = run('generate.mjs', ['--prompt', 'x', '--dry']);
  ok(r.status === 2 && /REFUSED/.test(r.stderr), 'generate refused at a cap of none');
  r = run('edit.mjs', ['--image', 'missing.jpg', '--prompt', 'x', '--size', '1024x1024', '--dry']);
  ok(r.status === 2 && /REFUSED/.test(r.stderr), 'edit refused at a cap of none');
  writeFileSync(path.join(root, 'round', 'a.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  r = run('gate.mjs', ['--in', 'round', '--dry']);
  ok(r.status === 2 && /REFUSED/.test(r.stderr), 'gate refused at a cap of none (its calls cost even when dry)');
  contract('**Imagery budget:** `null`');
  r = run('generate.mjs', ['--prompt', 'x', '--dry']);
  ok(r.status === 2 && /not set/.test(r.stderr), 'generate refused with no cap set');
  contract('**Imagery budget:** USD 3 per project');
  r = run('generate.mjs', ['--prompt', 'x', '--n', '2', '--dry']);
  ok(r.status === 0 && /cap  "USD 3 per project": \$2\.5000 spent/.test(r.stdout), 'generate passes inside the cap and reports what is left');
  r = run('generate.mjs', ['--prompt', 'x', '--n', '4', '--size', '2048x1160', '--raw', '--dry']);
  ok(r.status === 2 && /would pass the imagery cap/.test(r.stderr), 'generate refused when the estimate passes what is left');
  writeFileSync(path.join(root, 'round.json'), JSON.stringify({ out: 'round', items: [{ tag: 'a', prompt: 'x', n: 3 }, { tag: 'b', prompt: 'y', n: 3 }, { tag: 'c', prompt: 'z', n: 3 }] }));
  r = run('batch.mjs', ['--file', 'round.json']);
  ok(r.status === 2 && /this round/.test(r.stderr), 'batch refuses the whole round before sending anything');
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
