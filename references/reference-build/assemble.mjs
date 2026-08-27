/* Assembles artifact.html: index.html with the engine CSS/JS and loop.js
   inlined, so the page is fully self-contained for artifact hosting.
   Run after any edit to index.html / loop.js:  node assemble.mjs */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('scrollcraft.css', 'utf8');
const engine = readFileSync('scrollcraft.js', 'utf8');
const loop = readFileSync('loop.js', 'utf8');

const out = html
  .replace('<link rel="stylesheet" href="scrollcraft.css">', () => '<style>\n' + css + '\n</style>')
  .replace('<script src="scrollcraft.js"></script>', () => '<script>\n' + engine + '\n</script>')
  .replace('<script src="loop.js"></script>', () => '<script>\n' + loop + '\n</script>');

if (out.includes('src="scrollcraft.js"') || out.includes('href="scrollcraft.css"') || out.includes('src="loop.js"'))
  throw new Error('assembly incomplete: a local reference survived');

writeFileSync('artifact.html', out);
console.log('artifact.html assembled:', (out.length / 1024).toFixed(0) + 'KB');
