/* Probe exact act-progress values: screenshot + live state at each p.
   node lab/probe.mjs <outdir> <width> <height> [--reduced] p1 p2 p3 ... */
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const out = args.shift();
const W = +args.shift(), H = +args.shift();
const reduced = args[0] === '--reduced' ? (args.shift(), true) : false;
const PS = args.map(Number);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: 2,
  reducedMotion: reduced ? 'reduce' : 'no-preference'
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push(String(e)));
await page.goto('http://localhost:4533/', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

const rows = [];
for (const p of PS) {
  await page.evaluate((pp) => {
    const el = document.getElementById('loop');
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const travel = Math.max(el.offsetHeight - window.innerHeight, 1);
    window.scrollTo(0, Math.round(top + travel * pp));
  }, p);
  await page.waitForTimeout(reduced ? 260 : 620);
  const st = await page.evaluate(() => {
    const svg = document.getElementById('stage-sheet');
    const tok = svg.querySelector('.e-token');
    const cards = [...document.querySelectorAll('.card')]
      .map(c => ({ t: (c.querySelector('h1,h2,p') || {}).textContent?.trim().slice(0, 34),
                   o: +getComputedStyle(c).opacity.slice(0, 4) }))
      .filter(c => c.o > 0.05);
    const lit = [...document.querySelectorAll('.card__code .ln.lit')].length;
    const todos = [...document.querySelectorAll('#todos li')].map(l => l.getAttribute('data-state')).join('');
    const led = [...document.querySelectorAll('.e-ledger')].length;
    const ledRows = [...document.querySelectorAll('#stage-sheet g')].length;
    return {
      vb: svg.getAttribute('viewBox'),
      ppu: +(window.innerWidth / +svg.getAttribute('viewBox').split(' ')[2]).toFixed(3),
      tok: tok.style.display === 'none' ? null : [+(+tok.getAttribute('cx')).toFixed(0), +(+tok.getAttribute('cy')).toFixed(0)],
      hud: [document.getElementById('hud-prom').textContent,
            document.getElementById('hud-del').textContent,
            document.getElementById('hud-era').textContent,
            document.getElementById('hud-gap').textContent,
            document.getElementById('hud-state').textContent].join(' | '),
      tick: document.getElementById('hud-tick').style.left,
      mast: document.getElementById('mast-state').textContent,
      read: document.querySelector('.t-center').textContent,
      readOp: getComputedStyle(document.querySelector('.t-center')).opacity,
      gapLab: (svg.querySelector('g[opacity] text.t-name') || {}).textContent,
      cards, lit, todos, led, ledRows
    };
  });
  const name = String(Math.round(p * 1000)).padStart(4, '0');
  await page.screenshot({ path: `${out}/p${name}.png` });
  rows.push({ p, ...st });
  console.log(`p=${p.toFixed(3)} ppu=${st.ppu} tok=${st.tok} HUD[${st.hud}] read=${st.read}(${st.readOp}) cards=${st.cards.map(c => c.t).join(' / ')} lit=${st.lit} todos=${st.todos}`);
}
writeFileSync(`${out}/probe.json`, JSON.stringify({ rows, errs }, null, 1));
if (errs.length) console.log('CONSOLE ERRORS:', errs.slice(0, 5));
await browser.close();
