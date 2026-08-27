/* Scaffolds a new conceptcraft build from the skill's reference implementation.
   node scaffold.mjs <build-name> [workspace] [--worked]
   Default workspace: $CONCEPTCRAFT_WORKSPACE, else ./conceptcraft-builds
   --worked starts from the worked-example companion (narrated real-artifact
   cards) instead of the abstract concept page. */
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2).filter(a => a !== '--worked');
const worked = process.argv.includes('--worked');
const name = args[0];
if (!name) { console.error('usage: node scaffold.mjs <build-name> [workspace] [--worked]'); process.exit(1); }
const ws = args[1] || process.env.CONCEPTCRAFT_WORKSPACE || resolve('conceptcraft-builds');
const dest = join(ws, name);
if (existsSync(dest)) { console.error('already exists: ' + dest); process.exit(1); }

mkdirSync(join(dest, 'lab'), { recursive: true });
const src = worked
  ? { 'index.html': 'worked-index.html', 'loop.js': 'worked-loop.js', 'assemble.mjs': 'assemble.mjs' }
  : { 'index.html': 'index.html', 'loop.js': 'loop.js', 'assemble.mjs': 'assemble.mjs' };
for (const [out, from] of Object.entries(src))
  cpSync(join(skill, 'references/reference-build', from), join(dest, out));
for (const f of ['scrollcraft.js', 'scrollcraft.css'])
  cpSync(join(skill, 'engine', f), join(dest, f));

console.log('scaffolded ' + dest);
console.log('next: rewrite the AUTHORED layers (geometry, stops, cards, HUD instrument)');
console.log('per SKILL.md; the MECHANICS layers carry over unchanged.');
