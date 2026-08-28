/* Minimal PNG reader + contrast sampler.
   node lab/px.mjs <file.png> "label:x,y,w,h" ["label2:x,y,w,h" ...]
   Coordinates are in CSS px of the shot (the sampler accounts for DPR). */
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function readPNG(path) {
  const b = readFileSync(path);
  let o = 8, w = 0, h = 0, bit = 0, ct = 0, idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8);
    const data = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bit = data[8]; ct = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (bit !== 8) throw new Error('only 8-bit PNG, got ' + bit);
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : ct === 4 ? 2 : -1;
  if (ch < 0) throw new Error('unsupported color type ' + ct);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch, out = Buffer.alloc(h * stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++];
    const line = raw.subarray(p, p + stride); p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0, bb = prev[x], c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += bb; else if (f === 3) v += (a + bb) >> 1;
      else if (f === 4) {
        const pp = a + bb - c, pa = Math.abs(pp - a), pb = Math.abs(pp - bb), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? bb : c);
      }
      cur[x] = v & 255;
    }
  }
  return { w, h, ch, data: out };
}
function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum(r, g, b) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }

const [file, ...boxes] = process.argv.slice(2);
const img = readPNG(file);
for (const spec of boxes) {
  const [label, rest] = spec.split(':');
  const [x, y, w, h] = rest.split(',').map(Number);
  // shots are DPR-2; map CSS px to device px
  const s = img.w > 2000 ? 2 : 1;
  let lo = 1, hi = 0, loC = null, hiC = null, n = 0;
  const hist = new Map();
  for (let yy = y * s; yy < (y + h) * s && yy < img.h; yy++) {
    for (let xx = x * s; xx < (x + w) * s && xx < img.w; xx++) {
      const i = (yy * img.w + xx) * img.ch;
      const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
      const L = lum(r, g, b); n++;
      const key = `${r >> 3},${g >> 3},${b >> 3}`;
      hist.set(key, (hist.get(key) || 0) + 1);
      if (L < lo) { lo = L; loC = [r, g, b]; }
      if (L > hi) { hi = L; hiC = [r, g, b]; }
    }
  }
  // robust extremes: ignore antialiasing outliers by using the 2 most common bins
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([k, c]) => ({ c, rgb: k.split(',').map(v => +v * 8 + 4) }));
  const ls = top.map(t => ({ ...t, L: lum(...t.rgb) })).sort((a, b) => a.L - b.L);
  const bgL = ls[0].L, fgL = ls[ls.length - 1].L;
  const cr = (hi + 0.05) / (lo + 0.05);
  const crCommon = (fgL + 0.05) / (bgL + 0.05);
  console.log(`${label.padEnd(26)} extremes ${cr.toFixed(2)}:1  common-bins ${crCommon.toFixed(2)}:1` +
    `  dark rgb(${loC}) light rgb(${hiC})`);
}
