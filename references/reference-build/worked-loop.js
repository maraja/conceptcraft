/* One continuous engraving. The camera flies the ring; stations pop their code
   cards; after one guided turn the blueprint runs and the laps compound.
   Bespoke to this page; the engine (scrollcraft.js) is untouched. */
(function () {
  'use strict';

  /* ------------------------------------------------------------ geometry -- */
  var CX = 800, CY = 510, R = 300;
  var RAD = Math.PI / 180;
  function pt(theta, r) {
    r = r == null ? R : r;
    return [CX + r * Math.sin(theta * RAD), CY - r * Math.cos(theta * RAD)];
  }

  /* Label placement is authored per station, not derived: each cluster's
     internals occupy a different quadrant, so the name goes wherever that
     station's drawing leaves clear space. lx/ly are screen px from the node,
     la is the anchor, pAbove puts the phrase eyebrow-style above the name. */
  var STATIONS = [
    { id: 'st0', th: 0,   no: '01', name: 'INGEST',            plain: 'two files, one memory',
      lx: 0,  ly: 48,  la: 'middle', pAbove: false },  // feeders above, labels below
    { id: 'st1', th: 60,  no: '02', name: 'ASSEMBLE',          plain: '17k, in order',
      lx: 36, ly: -27, la: 'start',  pAbove: true },   // stack inside-ring, labels up-right
    { id: 'st2', th: 120, no: '03', name: 'MODEL CALL',        plain: 'a thought + one call',
      lx: 36, ly: 35,  la: 'start',  pAbove: false },  // box up-right, labels down-right
    { id: 'st3', th: 180, no: '04', name: 'PARSE + ROUTE',     plain: '1 say · 1 call',
      lx: 0,  ly: -48, la: 'middle', pAbove: true },   // branch below, labels above
    { id: 'st4', th: 240, no: '05', name: 'EXECUTE + OBSERVE', plain: 'pytest, sandboxed',
      lx: 38, ly: -20, la: 'start',  pAbove: true },   // sandbox left, labels interior
    { id: 'st5', th: 300, no: '06', name: 'COMPACT + VERIFY',  plain: '4.1k → one line',
      lx: 38, ly: 40,  la: 'start',  pAbove: false }   // funnel up-left, labels interior
  ];
  var GATE_TH = 336;
  var G = pt(GATE_TH);                       // the gate
  var TERM = [330, 140];                     // the RETURN terminal
  var EXIT_D = 'M ' + G[0].toFixed(1) + ' ' + G[1].toFixed(1) +
    ' C 600 210, 470 168, 346 144';

  /* camera: named boxes, then keyframes. Centres lerp, sizes log-lerp. */
  function stationBox(i, side) {
    var s = pt(STATIONS[i].th);
    var cx = s[0] + (side === 'right' ? 145 : -145);
    var cy = s[1] + (STATIONS[i].th === 0 ? 60 : (STATIONS[i].th === 180 ? -40 : 10));
    return [cx - 330, cy - 215, 660, 430];
  }
  var CAM_BOXES = {
    FULL: [0, 0, 1600, 1000],
    TITLE: [-420, -40, 1780, 1113],   /* ring pushed right of the title copy */
    S1: stationBox(0, 'right'),
    S2: stationBox(1, 'left'),
    S3: stationBox(2, 'left'),
    S4: stationBox(3, 'left'),
    S5: stationBox(4, 'right'),
    S6: stationBox(5, 'right'),
    GATE: [G[0] + 145 - 350, G[1] + 55 - 228, 700, 456],
    MID:  [800 - 540, 510 - 350, 1080, 700],
    EXITB: [504 - 360, 208 - 234, 720, 468]
  };
  var CAM = [
    [0.000, 'TITLE'], [0.050, 'TITLE'],
    [0.075, 'S1'],   [0.112, 'S1'],
    [0.138, 'S2'],   [0.176, 'S2'],
    [0.202, 'S3'],   [0.246, 'S3'],
    [0.272, 'S4'],   [0.311, 'S4'],
    [0.337, 'S5'],   [0.381, 'S5'],
    [0.407, 'S6'],   [0.451, 'S6'],
    [0.472, 'GATE'], [0.518, 'GATE'],
    [0.545, 'FULL'], [0.562, 'FULL'],
    [0.578, 'MID'],  [0.750, 'MID'],
    [0.772, 'EXITB'],[0.815, 'EXITB'],
    [0.850, 'TITLE'],[1.001, 'TITLE']
  ];

  /* the ring, drawn in seven arcs across turn one */
  var ARCS = [
    { a: 0,   b: 60,  f: [0.112, 0.138] },
    { a: 60,  b: 120, f: [0.176, 0.202] },
    { a: 120, b: 180, f: [0.246, 0.272] },
    { a: 180, b: 240, f: [0.311, 0.337] },
    { a: 240, b: 300, f: [0.381, 0.407] },
    { a: 300, b: 336, f: [0.451, 0.472] },
    { a: 336, b: 360, f: [0.528, 0.556] }
  ];

  /* the token's angle across the whole page: turn one is guided, then laps */
  var TH_WAY = [
    [0.050, 0],    [0.112, 0],
    [0.138, 60],   [0.176, 60],
    [0.202, 120],  [0.246, 120],
    [0.272, 180],  [0.311, 180],
    [0.337, 240],  [0.381, 240],
    [0.407, 300],  [0.451, 300],
    [0.472, 336],  [0.526, 336],
    [0.556, 360],  [0.560, 360],
    [0.6425, 696], [0.688, 1056],
    [0.7255, 1416],[0.760, 1776]
  ];

  /* laps: [pStart, pEnd, trail radius] */
  var LAPS = [
    [0.560, 0.6425, 287],
    [0.6425, 0.688, 276],
    [0.688, 0.7255, 266],
    [0.7255, 0.760, 257]
  ];

  /* the context window, decomposed: what fills it, and when, as pure
     functions of p (thousands of tokens). The HUD bar draws these. */
  var SEG_SYS = 8;   // system + task, always resident
  var SEG_KNOW = [   // files + memory + tool schemas (paper)
    [0, 0], [0.05, 0], [0.115, 9], [0.18, 16], [0.415, 16], [0.45, 0],
    [0.56, 0], [0.6337, 9], [0.6425, 0], [0.6835, 9], [0.688, 0],
    [0.7218, 9], [0.7255, 0], [0.7565, 9], [0.76, 0], [1.001, 0]
  ];
  var SEG_REPLY = [  // model output (clay)
    [0, 0], [0.18, 0], [0.25, 14], [0.315, 16], [0.415, 16], [0.45, 0],
    [0.56, 0], [0.6337, 10], [0.6425, 0], [0.6835, 10], [0.688, 0],
    [0.7218, 10], [0.7255, 0], [0.7565, 10], [0.76, 0], [1.001, 0]
  ];
  var SEG_OBS = [    // tool observations (sage)
    [0, 0], [0.315, 0], [0.385, 18], [0.415, 22], [0.45, 0],
    [0.56, 0], [0.6337, 15], [0.6425, 0], [0.6835, 15], [0.688, 0],
    [0.7218, 15], [0.7255, 0], [0.7565, 15], [0.76, 0], [1.001, 0]
  ];
  var SEG_SUM = [    // compacted history (gold), the part that compounds
    [0, 0], [0.415, 0], [0.45, 23], [0.6337, 23], [0.6425, 28],
    [0.6835, 28], [0.688, 31], [0.7218, 31], [0.7255, 33],
    [0.7565, 33], [0.76, 34], [1.001, 34]
  ];
  var CTX_SCALE = 80;   // bar spans 0..80k; the 64k budget tick sits at 80%

  /* todos in the laps card: [failFrom or null, doneFrom] */
  var TODOS = [
    { done: 0.47 },
    { done: 0.6425 },
    { done: 0.688 },
    { fail: 0.7255, done: 0.757, tagDone: 'turn 05' },
    { done: 0.758 }
  ];

  var REGIONS = [
    { id: 's1',   w: [0.050, 0.115], no: '01', lab: 'INGEST',   state: 'stage 01 // ingest' },
    { id: 's2',   w: [0.115, 0.180], no: '02', lab: 'ASSEMBLE', state: 'stage 02 // assemble' },
    { id: 's3',   w: [0.180, 0.250], no: '03', lab: 'MODEL',    state: 'stage 03 // model call' },
    { id: 's4',   w: [0.250, 0.315], no: '04', lab: 'PARSE',    state: 'stage 04 // parse + route' },
    { id: 's5',   w: [0.315, 0.385], no: '05', lab: 'EXECUTE',  state: 'stage 05 // execute + observe' },
    { id: 's6',   w: [0.385, 0.455], no: '06', lab: 'COMPACT',  state: 'stage 06 // compact + verify' },
    { id: 'gate', w: [0.455, 0.520], no: '·',  lab: 'GATE',     state: 'the gate // continue or exit' },
    { id: 'run',  w: [0.520, 0.760], no: '»',  lab: 'RUN',      state: 'live // turns 02–05, to green' },
    { id: 'ret',  w: [0.760, 1.001], no: '✓',  lab: 'RETURN',   state: 'returned // diff + green suite' }
  ];

  /* --------------------------------------------------------------- helpers -- */
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  function smooth(t) { return t * t * t * (t * (6 * t - 15) + 10); }
  function lerpWay(way, p) {
    if (p <= way[0][0]) return way[0][1];
    for (var i = 0; i < way.length - 1; i++) {
      if (p <= way[i + 1][0]) {
        var t = (p - way[i][0]) / (way[i + 1][0] - way[i][0]);
        return way[i][1] + (way[i + 1][1] - way[i][1]) * t;
      }
    }
    return way[way.length - 1][1];
  }
  function arcD(a, b, r) {
    var p0 = pt(a, r), p1 = pt(b, r);
    return 'M ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
      ' A ' + r + ' ' + r + ' 0 ' + (b - a > 180 ? 1 : 0) + ' 1 ' +
      p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }
  function circleD(cx, cy, r) {
    return 'M ' + cx + ' ' + (cy - r) +
      ' A ' + r + ' ' + r + ' 0 1 1 ' + cx + ' ' + (cy + r) +
      ' A ' + r + ' ' + r + ' 0 1 1 ' + cx + ' ' + (cy - r);
  }
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------- build the sheet -- */
  var svg = document.getElementById('stage-sheet');
  var scaled = [];   // { el, kind: 'label'|'r', ... }
  var lods = [];     // { el, lod }

  function label(txt, x, y, opts, parent) {
    var t = el('text', { 'class': opts.cls || '', 'text-anchor': opts.a || 'start' }, parent || svg);
    t.textContent = txt;
    t.style.setProperty('--fs', opts.fs || 9.5);
    scaled.push({ el: t, kind: 'label', x: x, y: y, dx: opts.dx || 0, dy: opts.dy || 0 });
    if (opts.lod) lods.push({ el: t, lod: opts.lod });
    return t;
  }

  // the desk, then the sheet
  el('rect', { x: -500, y: -400, width: 2600, height: 1800, fill: 'var(--sc-surface)', stroke: 'none' }, svg);
  el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: 'var(--sc-canvas)', stroke: 'none' }, svg);

  // grid inside the frame
  var grid = el('g', { 'class': 'e-grid' }, svg);
  var gridx = el('g', { 'class': 'e-gridx' }, svg);
  for (var gx = 80; gx < 1600; gx += 80)
    el('line', { x1: gx, y1: 24, x2: gx, y2: 952 }, gx % 400 === 0 ? gridx : grid);
  for (var gy = 80; gy < 1000; gy += 80)
    el('line', { x1: 24, y1: gy, x2: 1576, y2: gy }, gy % 400 === 0 ? gridx : grid);

  // frame + crop marks
  el('rect', { x: 24, y: 24, width: 1552, height: 928, 'class': 'e-frame' }, svg);
  [[24, 24, 1, 1], [1576, 24, -1, 1], [24, 952, 1, -1], [1576, 952, -1, -1]].forEach(function (c) {
    el('line', { x1: c[0] - c[2] * 6, y1: c[1], x2: c[0] - c[2] * 22, y2: c[1], 'class': 'e-crop' }, svg);
    el('line', { x1: c[0], y1: c[1] - c[3] * 6, x2: c[0], y2: c[1] - c[3] * 22, 'class': 'e-crop' }, svg);
  });

  // title block: one quiet row
  var tb = el('g', { 'class': 'titleblock' }, svg);
  el('rect', { x: 1236, y: 908, width: 340, height: 44 }, tb);
  var tbt = el('text', { x: 1252, y: 934, 'class': 't-fixed' }, tb);
  tbt.textContent = 'LOOP ENGINEERING · WORKED · SHEET 2 OF 2';

  // construction guide, midpoint ticks, direction chevrons
  el('circle', { cx: CX, cy: CY, r: R + 16, 'class': 'e-ringguide' }, svg);
  for (var tk = 30; tk < 360; tk += 60) {
    if (tk === 330) continue;   // that tick sits under THE GATE label
    var t0 = pt(tk, R - 7), t1 = pt(tk, R + 7);
    el('line', { x1: t0[0], y1: t0[1], x2: t1[0], y2: t1[1], 'class': 'e-tick' }, svg);
  }
  ARCS.forEach(function (ar) {
    var mid = (ar.a + ar.b) / 2, q = pt(mid, R + 16);
    var ch = el('path', { d: 'M -5 -4 L 4 0 L -5 4', 'class': 'e-chev',
      transform: 'translate(' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ') rotate(' + mid.toFixed(1) + ')' }, svg);
    lods.push({ el: ch, lod: 0.9 });
  });

  // lap trail rings (the record), each masked to draw across its lap
  var defs = el('defs', {}, svg);
  LAPS.forEach(function (L, i) {
    var d = circleD(CX, CY, L[2]);
    var mk = el('mask', { id: 'mk-lap' + i, maskUnits: 'userSpaceOnUse', x: -500, y: -400, width: 2600, height: 1800 }, defs);
    el('rect', { x: -500, y: -400, width: 2600, height: 1800, fill: '#000' }, mk);
    var mp = el('path', { d: d, 'class': 'e-drawmask', pathLength: 1 }, mk);
    mp.style.setProperty('--f0', L[0]);
    mp.style.setProperty('--fw', (L[1] - L[0]).toFixed(4));
    el('path', { d: d, 'class': 'e-trail', mask: 'url(#mk-lap' + i + ')',
      stroke: 'rgba(207, 199, 178, ' + (0.35 + i * 0.1).toFixed(2) + ')' }, svg);
  });

  // the ring's seven arcs, masked so scroll inks them
  ARCS.forEach(function (ar, i) {
    var d = arcD(ar.a, ar.b, R);
    var mk = el('mask', { id: 'mk-a' + i, maskUnits: 'userSpaceOnUse', x: -500, y: -400, width: 2600, height: 1800 }, defs);
    el('rect', { x: -500, y: -400, width: 2600, height: 1800, fill: '#000' }, mk);
    var mp = el('path', { d: d, 'class': 'e-drawmask', pathLength: 1 }, mk);
    mp.style.setProperty('--f0', ar.f[0]);
    mp.style.setProperty('--fw', (ar.f[1] - ar.f[0]).toFixed(4));
    ar.el = el('path', { d: d, 'class': 'e-arc', mask: 'url(#mk-a' + i + ')' }, svg);
  });

  // the exit line, masked, sage
  (function () {
    var mk = el('mask', { id: 'mk-exit', maskUnits: 'userSpaceOnUse', x: -500, y: -400, width: 2600, height: 1800 }, defs);
    el('rect', { x: -500, y: -400, width: 2600, height: 1800, fill: '#000' }, mk);
    var mp = el('path', { d: EXIT_D, 'class': 'e-drawmask', pathLength: 1 }, mk);
    mp.style.setProperty('--f0', 0.772);
    mp.style.setProperty('--fw', '0.0330');
    el('path', { d: EXIT_D, 'class': 'e-exit', mask: 'url(#mk-exit)' }, svg);
  }());
  var exitPath = el('path', { d: EXIT_D, fill: 'none', stroke: 'none' }, svg); // for getPointAtLength

  // the RETURN terminal, one focus-managed cluster
  var termCluster = el('g', {}, svg);
  el('circle', { cx: TERM[0], cy: TERM[1], r: 16, 'class': 'e-term' }, termCluster);
  el('circle', { cx: TERM[0], cy: TERM[1], r: 9, 'class': 'e-term' }, termCluster);
  label('RETURN', TERM[0], TERM[1], { dy: 40, a: 'middle', fs: 14, cls: 't-name', lod: 1.4 }, termCluster);
  label('answer, verified', TERM[0], TERM[1], { dy: 57, a: 'middle', fs: 11.5, cls: 't-plain', lod: 1.4 }, termCluster);
  label('// the only way out', 470, 200, { fs: 12, cls: 't-note', lod: 1.4 }, termCluster);

  /* focus plates: a translucent platform under each station's diagram, so the
     glyphs and their labels sit on their own ground when zoomed in */
  var plateGroup = el('g', { 'class': 'e-plates' }, svg);
  var plateEls = [];
  [
    [615, 78, 325, 190, 1.45],    // S1 feeders + labels below
    [800, 328, 312, 182, 1.45],   // S2 prompt stack
    [1028, 566, 250, 130, 1.45],  // S3 black box
    [688, 758, 224, 126, 1.45],   // S4 router, labels above
    [400, 576, 255, 130, 1.45],   // S5 sandbox, labels interior
    [392, 258, 265, 152, 1.45],   // S6 funnel, labels interior
    [575, 170, 225, 134, 1.45]    // the gate (labels stay at 0.9; the platform is zoom-only)
  ].forEach(function (pl) {
    // plates are focus-driven, not lod-driven: render() owns their opacity
    var r = el('rect', { x: pl[0], y: pl[1], width: pl[2], height: pl[3], rx: 8,
      'class': 'e-plate', opacity: 0 }, plateGroup);
    plateEls.push(r);
  });

  /* stations: node, name, plain phrase, halo */
  var halos = [];
  STATIONS.forEach(function (s) {
    var q = pt(s.th);
    s.x = q[0]; s.y = q[1];
    var halo = el('circle', { cx: q[0], cy: q[1], r: 30, 'class': 'e-halo', opacity: 0 }, svg);
    halos.push({ el: halo, th: s.th });
    el('circle', { cx: q[0], cy: q[1], r: 16, 'class': 'e-station-rest' }, svg);
    s.ring = el('circle', { cx: q[0], cy: q[1], r: 16, 'class': 'e-station', opacity: 0 }, svg);
    s.core = el('circle', { cx: q[0], cy: q[1], r: 5.5, 'class': 'e-station-core', opacity: 0.45 }, svg);
    var pdy = s.pAbove ? s.ly - 18 : s.ly + 19;
    s.nameEl = label(s.no + ' ' + s.name, q[0], q[1], { dx: s.lx, dy: s.ly, a: s.la, fs: 15, cls: 't-name' });
    s.plainEl = label(s.plain, q[0], q[1], { dx: s.lx, dy: pdy, a: s.la, fs: 12, cls: 't-plain' });
    s.plainEl.style.opacity = '0';
  });

  /* internals, one small drawing per station; labels live inside each group.
     Groups are focus-driven: render() owns their opacity entirely. */
  var intEls = {};
  function intGroup(key) { var g = el('g', { 'class': 'e-int', opacity: 0 }, svg); intEls[key] = g; return g; }

  (function () { // S1: feeders
    var g = intGroup('st0');
    [[[730, 140], [788, 196]], [[800, 118], [800, 190]], [[870, 140], [812, 196]]].forEach(function (l) {
      el('line', { x1: l[0][0], y1: l[0][1], x2: l[1][0], y2: l[1][1] }, g);
    });
    label('the code + its test', 730, 140, { dx: -8, dy: -8, a: 'end', fs: 12, lod: 1.45 }, g);
    label('"flaked 3x on CI"', 800, 118, { dy: -14, a: 'middle', fs: 12, lod: 1.45 }, g);
    label('3 tools', 870, 140, { dx: 8, dy: -8, fs: 12, lod: 1.45 }, g);
  }());
  (function () { // S2: the prompt stack, inside the ring so it owns clear space
    var g = intGroup('st1');
    el('line', { x1: 1046, y1: 372, x2: 995, y2: 396 }, g);
    ['system 8.0k', 'history 0', 'knowledge 8.9k', 'ask 0.1k'].forEach(function (n, i) {
      el('rect', { x: 903, y: 388 + i * 24, width: 90, height: 16, 'class': i === 3 ? 'fill' : '' }, g);
      label(n, 897, 388 + i * 24 + 8, { dx: -8, dy: 4, a: 'end', fs: 12, lod: 1.45 }, g);
    });
  }());
  (function () { // S3: the rented black box
    var g = intGroup('st2');
    el('rect', { x: 1098, y: 600, width: 54, height: 54 }, g);
    var h = el('g', { 'class': 'e-hatch' }, g);
    for (var i = 1; i < 6; i++)
      el('line', { x1: 1098, y1: 600 + i * 9, x2: 1098 + i * 9, y2: 600 }, h);
    for (var j = 1; j < 6; j++)
      el('line', { x1: 1098 + j * 9, y1: 654, x2: 1152, y2: 600 + j * 9 }, h);
    el('line', { x1: 1075, y1: 655, x2: 1098, y2: 640 }, g);
    label('17k in → 0.3k out', 1160, 626, { dx: 12, fs: 12, lod: 1.45 }, g);
    label('"reproduce it first"', 1098, 588, { dy: -4, fs: 11.5, lod: 1.45 }, g);
  }());
  (function () { // S4: the router
    var g = intGroup('st3');
    el('line', { x1: 800, y1: 824, x2: 770, y2: 852 }, g);
    el('line', { x1: 800, y1: 824, x2: 830, y2: 852 }, g);
    label('say it', 770, 852, { dx: -8, dy: 14, a: 'end', fs: 12, lod: 1.45 }, g);
    label('run_tests', 830, 852, { dx: 8, dy: 14, fs: 12, lod: 1.45 }, g);
  }());
  (function () { // S5: the sandbox
    var g = intGroup('st4');
    el('rect', { x: 430, y: 610, width: 75, height: 52 }, g);
    el('rect', { x: 444, y: 624, width: 34, height: 26, 'class': 'fill' }, g);
    el('line', { x1: 505, y1: 648, x2: 527, y2: 656 }, g);
    label('$ pytest -q', 430, 598, { dy: -4, fs: 11.5, lod: 1.45 }, g);
    label('1 failed, 4 passed', 434, 662, { dy: 20, fs: 11.5, lod: 1.45 }, g);
  }());
  (function () { // S6: the funnel
    var g = intGroup('st5');
    el('line', { x1: 420, y1: 292, x2: 500, y2: 292 }, g);
    el('line', { x1: 420, y1: 292, x2: 460, y2: 336 }, g);
    el('line', { x1: 500, y1: 292, x2: 460, y2: 336 }, g);
    el('line', { x1: 460, y1: 336, x2: 460, y2: 352 }, g);
    label('4.1k of log', 420, 278, { dy: -6, fs: 11.5, lod: 1.45 }, g);
    label('→ one kept sentence', 420, 352, { dy: 20, fs: 11.5, lod: 1.45 }, g);
  }());

  /* the gate: hinge + lever between LOOP and RETURN, grouped as one cluster */
  var LOOP_DIR = [Math.cos(GATE_TH * RAD), Math.sin(GATE_TH * RAD)];   // ring tangent, clockwise
  var EXIT_DIR = (function () {
    var dx = TERM[0] - G[0], dy = TERM[1] - G[1], m = Math.hypot(dx, dy);
    return [dx / m, dy / m];
  }());
  var gateCluster = el('g', {}, svg);
  var lever = el('line', { x1: G[0], y1: G[1], x2: G[0] + 40 * LOOP_DIR[0], y2: G[1] + 40 * LOOP_DIR[1], 'class': 'e-gate' }, gateCluster);
  el('circle', { cx: G[0], cy: G[1], r: 5, 'class': 'e-gate' }, gateCluster);
  label('LOOP', G[0] + 46 * LOOP_DIR[0], G[1] + 46 * LOOP_DIR[1], { dx: 8, dy: -8, fs: 12, lod: 0.9 }, gateCluster);
  label('RETURN', G[0] + 46 * EXIT_DIR[0], G[1] + 46 * EXIT_DIR[1], { dx: -8, dy: -8, a: 'end', fs: 12, lod: 0.9 }, gateCluster);
  label('THE GATE', G[0], G[1], { dy: 36, a: 'middle', fs: 12.5, cls: 't-name', lod: 0.9 }, gateCluster);

  /* stage focus: a trapezoid over each region window. At rest a station is a
     quiet sage mark with a grey name; the subject expands to full strength. */
  function trap(pp, a, b) {
    var w = b - a, r = w * 0.22;
    if (pp <= a || pp >= b) return 0;
    if (pp < a + r) return (pp - a) / r;
    if (pp > b - r) return (b - pp) / r;
    return 1;
  }

  /* centre readout: the machine's heartbeat */
  var centerTurn = label('TURN 01', CX, CY + 4, { a: 'middle', fs: 28, cls: 't-center' });

  /* the token */
  var token = el('circle', { r: 7, 'class': 'e-token', 'stroke-width': 2 }, svg);
  scaled.push({ el: token, kind: 'r', r: 7 });
  token.style.display = 'none';

  /* --------------------------------------------------------- the stack nav -- */
  var stack = document.getElementById('stack');
  var stackBtns = [];
  var act = { el: document.getElementById('loop'), top: 0, travel: 1 };
  REGIONS.forEach(function (r) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', r.state);
    b.title = r.state;
    b.innerHTML = '<span class="num">' + r.no + '</span><span class="lab">' + r.lab + '</span>';
    b.addEventListener('click', function () {
      var mid = (r.w[0] + r.w[1]) / 2;
      window.scrollTo({ top: act.top + act.travel * mid, behavior: reduced ? 'auto' : 'smooth' });
    });
    stack.appendChild(b);
    stackBtns.push(b);
  });

  /* ------------------------------------------------------------- runtime -- */
  var mastState = document.getElementById('mast-state');
  var hudTurn = document.getElementById('hud-turn');
  var hudCtx = document.getElementById('hud-ctx');
  var hudVerify = document.getElementById('hud-verify');
  var overlay = document.getElementById('overlay');
  var segs = {
    sys: document.getElementById('seg-sys'),
    sum: document.getElementById('seg-sum'),
    know: document.getElementById('seg-know'),
    reply: document.getElementById('seg-reply'),
    obs: document.getElementById('seg-obs')
  };
  var todoEls = Array.prototype.slice.call(document.querySelectorAll('#todos li'));

  var cards = Array.prototype.slice.call(document.querySelectorAll('.card[data-anchor]')).map(function (c) {
    var cue = c.getAttribute('data-sc-cue').split(/\s+/).map(parseFloat);
    return { el: c, anchor: c.getAttribute('data-anchor'),
             from: cue[0], to: cue[1], rIn: cue[2] || 0.3, rOut: cue[3] || 0.3,
             pre: c.querySelector('pre[data-hl-a]') };
  });
  cards.forEach(function (c) {
    if (!c.pre) return;
    c.lines = Array.prototype.slice.call(c.pre.querySelectorAll('.ln'));
    c.hlA = c.pre.getAttribute('data-hl-a').split(' ').map(Number);
    c.hlB = c.pre.getAttribute('data-hl-b').split(' ').map(Number);
  });
  // the spotlight: while a station's card is up, the rest of the sheet steps back
  var spotDefs = el('defs', {}, overlay);
  var spotGrad = el('radialGradient', { id: 'spot-g', gradientUnits: 'userSpaceOnUse',
    cx: 0, cy: 0, r: 600 }, spotDefs);
  el('stop', { offset: '0%', 'stop-color': '#12160c', 'stop-opacity': 0 }, spotGrad);
  el('stop', { offset: '38%', 'stop-color': '#12160c', 'stop-opacity': 0 }, spotGrad);
  el('stop', { offset: '78%', 'stop-color': '#12160c', 'stop-opacity': 0.58 }, spotGrad);
  el('stop', { offset: '100%', 'stop-color': '#12160c', 'stop-opacity': 0.68 }, spotGrad);
  var spot = el('rect', { x: 0, y: 0, width: 100, height: 100, fill: 'url(#spot-g)', opacity: 0 }, overlay);

  var leader = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 }, overlay);
  var halo = el('circle', { 'class': 'pinhalo', r: 9, opacity: 0 }, overlay);

  function measure() {
    var r = act.el.getBoundingClientRect();
    act.top = r.top + window.scrollY;
    act.travel = Math.max(act.el.offsetHeight - window.innerHeight, 1);
  }

  function boxOf(name) {
    var b = CAM_BOXES[name];
    return { x: b[0], y: b[1], w: b[2], h: b[3] };
  }
  function cameraAt(p) {
    if (reduced) return boxOf('TITLE');
    var i = 0;
    while (i < CAM.length - 2 && p >= CAM[i + 1][0]) i++;
    var a = CAM[i], b = CAM[i + 1];
    var A = boxOf(a[1]);
    if (a[1] === b[1]) return A;
    var B = boxOf(b[1]);
    var t = smooth(clamp01((p - a[0]) / (b[0] - a[0])));
    var cx = (A.x + A.w / 2) * (1 - t) + (B.x + B.w / 2) * t;
    var cy = (A.y + A.h / 2) * (1 - t) + (B.y + B.h / 2) * t;
    var w = Math.exp(Math.log(A.w) * (1 - t) + Math.log(B.w) * t);
    var h = Math.exp(Math.log(A.h) * (1 - t) + Math.log(B.h) * t);
    return { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
  }
  function fit(b) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var A = vw / vh;
    var w = b.w, h = b.h;
    if (w / h < A) w = h * A; else h = w / A;
    return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w: w, h: h };
  }

  var lastPpu = 0;
  function rescale(ppu) {
    if (lastPpu && Math.abs(ppu - lastPpu) / ppu < 0.004) return;
    lastPpu = ppu;
    var inv = 1 / ppu;
    svg.style.setProperty('--inv', inv.toFixed(4));
    for (var i = 0; i < scaled.length; i++) {
      var s = scaled[i];
      if (s.kind === 'label') {
        s.el.setAttribute('x', (s.x + s.dx * inv).toFixed(2));
        s.el.setAttribute('y', (s.y + s.dy * inv).toFixed(2));
      } else if (s.kind === 'r') {
        s.el.setAttribute('r', (s.r * inv).toFixed(3));
      }
    }
    for (var j = 0; j < lods.length; j++) {
      lods[j].el.style.opacity = ppu >= lods[j].lod ? '' : '0';
      lods[j].el.style.pointerEvents = 'none';
    }
  }

  function cueOpacity(c, p) {
    if (p < c.from || p > c.to) return 0;
    var w = c.to - c.from, t = (p - c.from) / w;
    if (t < c.rIn) return t / c.rIn;
    if (t > 1 - c.rOut) return (1 - t) / c.rOut;
    return 1;
  }

  function turnAt(p) {
    if (p < 0.560) return 1;
    for (var i = 0; i < LAPS.length; i++) if (p < LAPS[i][1]) return i + 2;
    return 5;
  }

  var lastRegion = -2, lastDim = '';
  function render() {
    if (window.innerWidth < 2 || window.innerHeight < 2) return;
    var p = clamp01((window.scrollY - act.top) / act.travel);

    // camera
    var vb = fit(cameraAt(p));
    svg.setAttribute('viewBox', vb.x.toFixed(1) + ' ' + vb.y.toFixed(1) + ' ' + vb.w.toFixed(1) + ' ' + vb.h.toFixed(1));
    var ppu = window.innerWidth / vb.w;
    if (!isFinite(ppu) || ppu <= 0) return;
    rescale(ppu);

    // the turn counter belongs to the wide framings; at station zoom it is
    // a stray word floating behind the cards
    centerTurn.style.opacity = ppu > 1.45 ? '0' : '';

    // region state: mast + stack nav
    var ri = -1;
    for (var i = 0; i < REGIONS.length; i++) if (p >= REGIONS[i].w[0] && p < REGIONS[i].w[1]) ri = i;
    if (ri !== lastRegion) {
      lastRegion = ri;
      mastState.textContent = ri === -1 ? 'the same machine, given a real job' : REGIONS[ri].state;
      stackBtns.forEach(function (b, k) { b.setAttribute('aria-current', String(k === ri)); });
    }

    // turn-one arcs settle to the record tone once passed; the run re-inks them
    for (i = 0; i < ARCS.length; i++) {
      var passed = p > ARCS[i].f[1] + 0.012 && p < 0.556;
      if (passed !== ARCS[i].passed) {
        ARCS[i].passed = passed;
        ARCS[i].el.classList.toggle('e-passed', passed);
      }
    }

    // the token
    var tokPt = null;
    if (!reduced && p >= 0.05) {
      if (p >= 0.772) {
        var L = exitPath.getTotalLength();
        var f = clamp01((p - 0.772) / 0.033);
        var q = exitPath.getPointAtLength(f * L);
        tokPt = [q.x, q.y];
      } else if (p >= 0.760) {
        tokPt = G.slice();
      } else {
        var th = lerpWay(TH_WAY, p);
        tokPt = pt(th % 360);
      }
      token.style.display = '';
      token.setAttribute('cx', tokPt[0].toFixed(2));
      token.setAttribute('cy', tokPt[1].toFixed(2));
    } else {
      token.style.display = 'none';
    }

    // station pulses while the run laps
    var running = !reduced && p >= 0.560 && p < 0.760;
    var thNow = running ? lerpWay(TH_WAY, p) % 360 : -999;
    for (i = 0; i < halos.length; i++) {
      var op = 0;
      if (running) {
        var d = Math.abs(thNow - halos[i].th);
        if (d > 180) d = 360 - d;
        op = Math.max(0, 1 - d / 26) * 0.9;
      }
      halos[i].el.setAttribute('opacity', op.toFixed(2));
    }

    // the gate lever: LOOP until the run earns RETURN
    var open = reduced ? 1 : clamp01((p - 0.760) / 0.012);
    var lx = LOOP_DIR[0] * (1 - open) + EXIT_DIR[0] * open;
    var ly = LOOP_DIR[1] * (1 - open) + EXIT_DIR[1] * open;
    var lm = Math.hypot(lx, ly) || 1;
    lever.setAttribute('x2', (G[0] + 40 * lx / lm).toFixed(1));
    lever.setAttribute('y2', (G[1] + 40 * ly / lm).toFixed(1));
    lever.classList.toggle('e-gate--armed', open > 0.5);

    // the context window: segments fill, overflow the budget tick, compact
    var turn = reduced ? 5 : turnAt(p);
    var pd = reduced ? 1 : p;
    var kKnow = lerpWay(SEG_KNOW, pd), kReply = lerpWay(SEG_REPLY, pd),
        kObs = lerpWay(SEG_OBS, pd), kSum = lerpWay(SEG_SUM, pd);
    segs.sys.style.width = (SEG_SYS / CTX_SCALE * 100).toFixed(2) + '%';
    segs.sum.style.width = (kSum / CTX_SCALE * 100).toFixed(2) + '%';
    segs.know.style.width = (kKnow / CTX_SCALE * 100).toFixed(2) + '%';
    segs.reply.style.width = (kReply / CTX_SCALE * 100).toFixed(2) + '%';
    segs.obs.style.width = (kObs / CTX_SCALE * 100).toFixed(2) + '%';
    var ctx = Math.round(SEG_SYS + kKnow + kReply + kObs + kSum);
    hudTurn.textContent = (p >= 0.76 || reduced) ? '5 turns' : 'turn 0' + turn;
    hudCtx.textContent = ctx + 'k';
    var vTxt = '·', vCls = '';
    if (reduced || p >= 0.7565) { vTxt = 'pass'; vCls = 'v-pass'; }
    else if (p >= 0.7255) { vTxt = 'FAIL'; vCls = 'v-fail'; }
    else if (p >= 0.392 && p < 0.455) { vTxt = '1/5'; vCls = ''; }
    if (hudVerify.textContent !== vTxt) { hudVerify.textContent = vTxt; hudVerify.className = vCls; }
    centerTurn.textContent = reduced ? '5 TURNS' : (p >= 0.76 ? 'RETURNED' : 'TURN 0' + turn);

    // todos in the laps card
    for (i = 0; i < TODOS.length; i++) {
      var td = TODOS[i], st = 'open';
      var pp = reduced ? 1 : p;
      if (td.fail && pp >= td.fail && pp < td.done) st = 'fail';
      else if (pp >= td.done) st = 'done';
      if (todoEls[i].getAttribute('data-state') !== st) {
        todoEls[i].setAttribute('data-state', st);
        if (td.tagDone) {
          var tag = todoEls[i].querySelector('.turntag');
          tag.textContent = st === 'done' ? td.tagDone : 'turn 04';
        }
      }
    }

    // code line highlights: first half of a card's window lights range A, second half B
    var best = null, bo = 0;
    for (i = 0; i < cards.length; i++) {
      var c = cards[i];
      var o = cueOpacity(c, p);
      if (o > bo) { bo = o; best = c; }
      if (!c.lines) continue;
      var sub = clamp01((p - c.from) / (c.to - c.from));
      var rng = (p >= c.from && p <= c.to) ? (sub < 0.5 ? c.hlA : c.hlB) : null;
      if (c.lastRng !== (rng && rng[0])) {
        c.lastRng = rng && rng[0];
        for (var ln = 0; ln < c.lines.length; ln++)
          c.lines[ln].classList.toggle('lit', !!rng && ln + 1 >= rng[0] && ln + 1 <= rng[1]);
      }
    }

    // leader line from the visible card to its subject
    var anchorPt = null;
    if (best && bo > 0.15) {
      if (best.anchor === 'token') anchorPt = tokPt;
      else if (best.anchor === 'gate') anchorPt = G;
      else if (best.anchor === 'term') anchorPt = TERM;
      else {
        for (i = 0; i < STATIONS.length; i++)
          if (STATIONS[i].id === best.anchor) anchorPt = [STATIONS[i].x, STATIONS[i].y];
      }
    }
    if (anchorPt) {
      var sx = (anchorPt[0] - vb.x) * ppu, sy = (anchorPt[1] - vb.y) * (window.innerHeight / vb.h);
      var cr = best.el.getBoundingClientRect();
      var ex = clamp01((sx - cr.left) / cr.width) * cr.width + cr.left;
      var ey = sy > cr.top + cr.height / 2 ? cr.bottom : cr.top;
      if (sx < cr.left) { ex = cr.left; ey = Math.min(Math.max(sy, cr.top + 12), cr.bottom - 12); }
      else if (sx > cr.right) { ex = cr.right; ey = Math.min(Math.max(sy, cr.top + 12), cr.bottom - 12); }
      var on = sx > -40 && sx < window.innerWidth + 40 && sy > -40 && sy < window.innerHeight + 40;
      leader.setAttribute('x1', ex.toFixed(1)); leader.setAttribute('y1', ey.toFixed(1));
      leader.setAttribute('x2', sx.toFixed(1)); leader.setAttribute('y2', sy.toFixed(1));
      leader.setAttribute('opacity', on ? (bo * 0.85).toFixed(2) : 0);
      halo.setAttribute('cx', sx.toFixed(1)); halo.setAttribute('cy', sy.toFixed(1));
      halo.setAttribute('opacity', on ? bo.toFixed(2) : 0);
      if (on && !reduced && best.anchor !== 'token') {
        spotGrad.setAttribute('cx', sx.toFixed(1));
        spotGrad.setAttribute('cy', sy.toFixed(1));
        spot.setAttribute('opacity', bo.toFixed(2));
      } else {
        spot.setAttribute('opacity', 0);
      }
    } else {
      leader.setAttribute('opacity', 0);
      halo.setAttribute('opacity', 0);
      spot.setAttribute('opacity', 0);
    }

    // stage focus: the subject expands, everything else rests as quiet marks
    var detail = ppu >= 1.45;
    for (var si = 0; si < STATIONS.length; si++) {
      var st = STATIONS[si];
      var f = reduced ? 1 : trap(p, REGIONS[si].w[0], REGIONS[si].w[1]);
      st.ring.setAttribute('opacity', f.toFixed(2));
      st.core.setAttribute('opacity', (0.45 + 0.55 * f).toFixed(2));
      st.nameEl.style.opacity = (0.38 + 0.62 * f).toFixed(2);
      st.plainEl.style.opacity = detail && !reduced ? f.toFixed(2) : '0';
      intEls[st.id].style.opacity = detail ? f.toFixed(2) : '0';
      plateEls[si].style.opacity = detail ? f.toFixed(2) : '0';
    }
    // the gate and the terminal light for their moment, then STAY lit: the
    // earned exit is what the finished drawing keeps
    var fExit = clamp01((p - 0.752) / 0.05);
    var fGate = reduced ? 1 : Math.max(trap(p, 0.455, 0.520), fExit);
    gateCluster.style.opacity = (0.3 + 0.7 * fGate).toFixed(2);
    plateEls[6].style.opacity = detail ? trap(p, 0.455, 0.520).toFixed(2) : '0';
    termCluster.style.opacity = (0.3 + 0.7 * (reduced ? 1 : fExit)).toFixed(2);
  }

  function sizeOverlay() {
    overlay.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
    overlay.setAttribute('width', window.innerWidth);
    overlay.setAttribute('height', window.innerHeight);
    spot.setAttribute('width', window.innerWidth);
    spot.setAttribute('height', window.innerHeight);
    spotGrad.setAttribute('r', Math.round(Math.max(window.innerWidth, window.innerHeight) * 0.52));
  }

  var dirty = false;
  function schedule() {
    if (dirty) return;
    dirty = true;
    requestAnimationFrame(function () { dirty = false; render(); });
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', function () { measure(); sizeOverlay(); lastPpu = 0; schedule(); });
  addEventListener('load', function () { measure(); schedule(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); schedule(); });

  ScrollCraft.mount(document.body);
  measure();
  sizeOverlay();
  render();
}());
