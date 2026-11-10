#!/usr/bin/env node
/**
 * visual-verify — the kit's render-and-measure harness. Run from the project
 * root; Playwright is resolved from the project (npm i -D playwright).
 *
 *   node verify.mjs shoot <page.html | page-folder | url> [--widths 1440,390] [--reduced] [--tag NAME] [--root DIR]
 *   node verify.mjs selftest      (the harness against a page whose answers are known)
 *
 * `shoot` captures settled full pages and runs the measured audit on the
 * rendered page: WCAG contrast (flat colours computed, text over pictures and
 * gradient text measured from the pixels), body under 16px, lines over 70
 * characters, gradient text, and numeric ranges not isolated in RTL.
 * Exit 0 clean, 2 audit failures, 3 evidence suspect, 1 usage or load error.
 */

import { parseArgs, resolveProject } from './lib.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

const HELP = `visual-verify
  shoot <page.html | page-folder | url>   settled full-page captures + measured audit
        --widths 1440,390  --tag NAME  --root DIR  --project DIR  --reduced  --no-audit  --allow-hidden "why"
  selftest                                 the harness against its own fixture`;

async function main() {
  if (!cmd || cmd === 'help' || cmd === '--help') { console.log(HELP); return 0; }
  if (cmd === 'selftest') return (await import('./selftest.mjs')).selftest();
  if (cmd === 'shoot') return (await import('./shoot.mjs')).shoot(args, resolveProject(args));
  console.error('unknown command "' + cmd + '"\n\n' + HELP);
  return 1;
}

main().then((code) => process.exit(code || 0), (e) => { console.error('verify: ' + (e && e.message || e)); process.exit(1); });
