/* Sample every VISIBLE sheet label at the given act-progress points and report
   its on-screen contrast. node lab/svgcontrast.mjs <W> <H> p1 p2 ... */
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [W, H, ...PS] = process.argv.slice(2);
const dir = mkdtempSync(join(process.env.SCRATCH || tmpdir(), 'svgc-'));
const b = await chromium.launch({ channel: 'chrome' });
const c = await b.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: 2 });
const pg = await c.newPage();
await pg.goto(process.env.CC_URL || 'http://localhost:4530/', { waitUntil: 'networkidle' });
await pg.waitForTimeout(600);
for (const p of PS.map(Number)) {
  await pg.evaluate(pp => {
    const el = document.getElementById('loop'), r = el.getBoundingClientRect();
    window.scrollTo(0, Math.round(r.top + window.scrollY + Math.max(el.offsetHeight - window.innerHeight, 1) * pp));
  }, p);
  await pg.waitForTimeout(600);
  const labs = await pg.evaluate(() => {
    const out = [];
    for (const t of document.querySelectorAll('#stage-sheet text')) {
      // effective opacity through the ancestor chain
      let o = 1, n = t;
      while (n && n.nodeName !== 'svg') { o *= +getComputedStyle(n).opacity; n = n.parentNode; }
      if (o < 0.55) continue;                      // deliberately recessive (rest state)
      const r = t.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return out;
      if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) continue;
      out.push({ t: t.textContent.slice(0, 28), o: +o.toFixed(2),
        box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
    }
    return out;
  });
  const f = `${dir}/p${Math.round(p*1000)}.png`;
  await pg.screenshot({ path: f });
  const args = [f, ...labs.map(l => `${l.t.replace(/[:,]/g,' ')} @${l.o}:${l.box[0]},${l.box[1]},${l.box[2]},${l.box[3]}`)];
  if (!labs.length) { console.log(`p=${p}: no fully-lit sheet labels in frame`); continue; }
  const out = execFileSync('node', ['lab/px.mjs', ...args], { encoding: 'utf8' });
  const bad = out.split('\n').filter(l => l && +(l.match(/extremes ([\d.]+):1/)||[0,99])[1] < 4.5);
  console.log(`p=${p}  labels=${labs.length}  BELOW 4.5:1 -> ${bad.length ? '\n' + bad.join('\n') : 'none'}`);
}
await b.close();
