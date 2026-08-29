/* CHALKBOARD only: roughen strokes so they read as chalk.

   READ THIS BEFORE USING IT. The naive version of this filter is unusable
   on a conceptcraft, and the first build that tried it shredded every wire
   into sparkle. Two reasons, both structural:

   1. FILTER CONSTANTS ARE WORLD UNITS; STROKES ARE NOT. Every sheet stroke
      uses vector-effect: non-scaling-stroke, so a 2.4px wire is only ~1.15
      world units wide at a stop framing (ppu ~2.1). A fixed scale of 2.2
      then displaces by ~96% of the stroke width and the line disintegrates.
      Drive both constants from ppu inside rescale() instead, so the grain
      stays constant in SCREEN px at every zoom.

   2. A PERCENTAGE FILTER REGION COLLAPSES ON AN AXIS-ALIGNED ELEMENT. A
      perfectly horizontal or vertical line has a zero-height (or -width)
      bounding box, and 140% of zero is zero: that element vanishes. Put
      straight edges in a GROUP and filter the group, whose bbox is always
      two-dimensional. Circles and arcs are safe to filter individually.

   feTurbulence is evaluated in user space rather than per filter region, so
   separate filter instances on co-located elements displace identically and
   stay registered with each other. That is what makes per-element filtering
   viable at all.

   FILTER THE WIRES AND THE RINGS. NEVER FILTER TEXT: displacement turns an
   11px label to mush. Keep animated elements (a travelling token, flow dots)
   out of the filtered group too, or turbulence re-rasterises every frame. */

var cf = el('filter', { id: 'chalk', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
var cfTurb = el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.27',
                                  numOctaves: '2', result: 'n' }, cf);
var cfDisp = el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '0.6',
                                       xChannelSelector: 'R', yChannelSelector: 'G' }, cf);

/* then, inside rescale(ppu), keep the grain constant on screen:
     cfDisp.setAttribute('scale', (1.3 / ppu).toFixed(3));
     cfTurb.setAttribute('baseFrequency', (ppu / 3.3).toFixed(3));
   which gives ~1.3px of displacement on a ~3.3px grain at any zoom.

   numOctaves 2 is deliberate: octaves 3+ are sub-pixel at these
   frequencies and cost real frame time, because turbulence re-rasterises
   on every camera move and its cost scales with bounding-box AREA (a long
   diagonal wire has a large bbox for very little ink). */
