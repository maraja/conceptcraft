/* SHEET WORLDS: the furniture switch.
   Drop this in place of the reference build's "the desk, then the sheet"
   block (loop.js, just after the svg is created). Set SHEET once, at the
   top of loop.js, from the world you chose in references/SHEETS.md.

   The sheet world is a THIRD axis, independent of theme (colour) and mode
   (panel language). It decides how much of the page is furniture rather
   than content: grid, frame, crop marks, ticks, title block. Every layer
   below is off unless the world asks for it, because the reference sheet
   had all five on and that reads as busy.                                */

var SHEET = {
  desk:   true,   // the surrounding surface outside the sheet rect
  grid:   true,   // 80-unit fine grid
  gridx:  true,   // 400-unit coarse grid
  frame:  true,   // the border rect
  crop:   true,   // corner crop marks
  ticks:  false,  // ruler ticks along the bottom edge
  block:  true    // the one-line title block
};

// the desk, then the sheet
if (SHEET.desk)
  el('rect', { x: -500, y: -400, width: 2600, height: 1800,
               fill: 'var(--sc-surface)', stroke: 'none' }, svg);
el('rect', { x: 0, y: 0, width: 1600, height: 1000,
             fill: 'var(--sc-canvas)', stroke: 'none' }, svg);

if (SHEET.grid || SHEET.gridx) {
  var grid  = el('g', { 'class': 'e-grid' }, svg);
  var gridx = el('g', { 'class': 'e-gridx' }, svg);
  for (var gx = 80; gx < 1600; gx += 80) {
    var coarseX = gx % 400 === 0;
    if (coarseX ? SHEET.gridx : SHEET.grid)
      el('line', { x1: gx, y1: 24, x2: gx, y2: 952 }, coarseX ? gridx : grid);
  }
  for (var gy = 80; gy < 1000; gy += 80) {
    var coarseY = gy % 400 === 0;
    if (coarseY ? SHEET.gridx : SHEET.grid)
      el('line', { x1: 24, y1: gy, x2: 1576, y2: gy }, coarseY ? gridx : grid);
  }
}

if (SHEET.frame)
  el('rect', { x: 24, y: 24, width: 1552, height: 928, 'class': 'e-frame' }, svg);

if (SHEET.crop)
  [[24, 24, 1, 1], [1576, 24, -1, 1], [24, 952, 1, -1], [1576, 952, -1, -1]]
    .forEach(function (c) {
      el('line', { x1: c[0] - c[2] * 6, y1: c[1], x2: c[0] - c[2] * 22, y2: c[1], 'class': 'e-crop' }, svg);
      el('line', { x1: c[0], y1: c[1] - c[3] * 6, x2: c[0], y2: c[1] - c[3] * 22, 'class': 'e-crop' }, svg);
    });

if (SHEET.ticks)
  for (var tx = 120; tx <= 1480; tx += 80)
    el('line', { x1: tx, y1: 952, x2: tx, y2: 940, 'class': 'e-tick' }, svg);

if (SHEET.block) {
  var tb = el('g', { 'class': 'titleblock' }, svg);
  el('rect', { x: 1236, y: 908, width: 340, height: 44 }, tb);
  var tbt = el('text', { x: 1252, y: 934, 'class': 't-fixed' }, tb);
  tbt.textContent = 'YOUR TITLE · SHEET 1 OF 1';
}
