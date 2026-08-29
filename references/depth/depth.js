/* --------------------------------------------------------------- CCDepth --
   The three-plane compositor. Drop this file in before loop.js, copy the
   matching :root block out of depth.css, and drive it from render().

   WHY THIS EXISTS. The format's first six builds put the furniture, the
   resting stations, their labels, the focused cluster and the card all on
   one plane, then tried to separate them with opacity alone. Amit's verdict:
   "the text overlaps and there's no dimension, it just feels like everything
   is kind of plopped on the same layer." Opacity cannot do this job. A label
   at 0.38 is still a sharp label competing for the same eye; a grid at 0.5 is
   still a grid. What separates planes is FOCUS and OCCLUSION, and this does
   both with one element.

   USE, in three lines of render():

     var ap = DEPTH.box(plateWorldRect, vb, ppu);   // subject -> screen
     DEPTH.set(cueOpacity, ap);                     // 0 fades it out entirely

   and once at build time:

     var DEPTH = CCDepth.mount({ reduced: reduced });

   THE APERTURE SHOULD BE THE SUBJECT, NOT THE NODE. Centring a circle on
   the station node leaves the internals diagram and its labels sitting in
   the veil, which is the exact overlap the veil is meant to end. Feed it
   the focus PLATE rect: that rectangle was already authored, per stop, as
   "everything this station owns". Builds with no plates should author one
   rect per stop rather than falling back to a radius guess.               */

(function (w, d) {
  'use strict';

  var CORE = 0.58;           /* the clear fraction of the mask radius; the
                                remaining 42% is the falloff. Matches the
                                --d-core default in depth.css. */

  function num(v, f) { return (typeof v === 'number' && isFinite(v)) ? v : f; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function mount(opts) {
    opts = opts || {};
    /* the pinned stage, not body: see the mount note in depth.css. */
    var host = opts.mount || d.querySelector('[data-sc-stage]') || d.body;
    var reduced = !!opts.reduced;

    var veil = d.createElement('div');
    veil.className = 'depth-veil is-off' + (host === d.body ? ' d-fixed' : '');
    veil.setAttribute('aria-hidden', 'true');
    host.appendChild(veil);

    /* No backdrop-filter (old Firefox, some embedded webviews) means the
       wash is carrying the separation on its own, so it has to go deeper.
       Detected once, not per frame. */
    var canBlur = !!(w.CSS && CSS.supports &&
      (CSS.supports('backdrop-filter', 'blur(2px)') ||
       CSS.supports('-webkit-backdrop-filter', 'blur(2px)')));
    var aBoost = canBlur ? 1 : 1.18;

    var st = veil.style;
    var read = getComputedStyle(d.documentElement);
    var aMax = parseFloat(read.getPropertyValue('--d-a-max')) || 0.74;
    var bMax = parseFloat(read.getPropertyValue('--d-blur-max')) || 3.5;


    var lastO = -1, off = true, foreEl = null;

    function set(o, ap) {
      o = clamp01(num(o, 0));
      if (reduced) o = 0;
      if (!ap || !isFinite(ap.x)) o = 0;

      if (o <= 0.005) {
        if (!off) { off = true; veil.classList.add('is-off'); lastO = 0; }
        return;
      }
      if (off) { off = false; veil.classList.remove('is-off'); }

      /* Geometry every frame: the camera is still moving under the card, so
         a stale aperture drifts off its own subject visibly. */
      st.setProperty('--d-x', ap.x.toFixed(1) + 'px');
      st.setProperty('--d-y', ap.y.toFixed(1) + 'px');
      st.setProperty('--d-rx', (Math.max(56, ap.rx) / CORE).toFixed(1) + 'px');
      st.setProperty('--d-ry', (Math.max(48, ap.ry) / CORE).toFixed(1) + 'px');

      /* Strength only when it actually moved: setting a backdrop blur is a
         layer invalidation, and at 0.01 steps it is free to skip. */
      if (Math.abs(o - lastO) > 0.012) {
        lastO = o;
        st.setProperty('--d-a', (aMax * aBoost * o).toFixed(3));
        st.setProperty('--d-blur', (bMax * o).toFixed(2) + 'px');
      }
    }

    /* THE FOREGROUND LIFT. One card at a time carries `.is-fore`; the class
       is a no-op on worlds whose cards are transparent, by design (see
       depth.css). Toggling by identity rather than per-frame keeps this off
       the style-recalc path. */
    function fore(elm) {
      if (elm === foreEl) return;
      if (foreEl) foreEl.classList.remove('is-fore');
      foreEl = (elm && !reduced) ? elm : null;
      if (foreEl) foreEl.classList.add('is-fore');
    }

    return { el: veil, set: set, fore: fore };
  }

  /* world rect -> screen aperture. `r` is [x, y, w, h] in sheet units, `vb`
     the live viewBox, `ppu` screen px per sheet unit horizontally. The
     vertical scale is derived separately because fit() may letterbox. */
  function box(r, vb, ppu, pad) {
    if (!r || !vb) return null;
    var vppu = w.innerHeight / vb.h;
    pad = num(pad, 26);
    return {
      x: (r[0] + r[2] / 2 - vb.x) * ppu,
      y: (r[1] + r[3] / 2 - vb.y) * vppu,
      rx: (r[2] / 2) * ppu + pad,
      ry: (r[3] / 2) * vppu + pad
    };
  }

  /* the union of several world rects, for a stop whose subject is a node
     PLUS a plate that sits off to one side. */
  function union() {
    var xs = [], ys = [], xe = [], ye = [], i, r;
    for (i = 0; i < arguments.length; i++) {
      r = arguments[i];
      if (!r) continue;
      xs.push(r[0]); ys.push(r[1]); xe.push(r[0] + r[2]); ye.push(r[1] + r[3]);
    }
    if (!xs.length) return null;
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
    return [x0, y0, Math.max.apply(null, xe) - x0, Math.max.apply(null, ye) - y0];
  }

  /* a square world rect centred on a point, for stops with no plate */
  function at(p, halfW, halfH) {
    if (!p) return null;
    halfH = num(halfH, halfW);
    return [p[0] - halfW, p[1] - halfH, halfW * 2, halfH * 2];
  }

  w.CCDepth = { mount: mount, box: box, union: union, at: at };
}(window, document));
