# conceptcraft mechanics

A map of every subsystem in the reference `loop.js` / `index.html`, split into
**MECHANICS** (carry over untouched) and **AUTHORED** (rewrite per concept).
Section names below match the comment banners in the reference files.

## Contents
1. The engine contract (MECHANICS)
2. Geometry + stops (AUTHORED)
3. The camera (MECHANICS machinery, AUTHORED boxes/keyframes)
4. Counter-scaled labels (MECHANICS) + placement (AUTHORED)
5. Two-state focus (MECHANICS) + focus windows (AUTHORED)
6. Plates, spotlight, halos (MECHANICS, plate rects AUTHORED)
7. Draw-on-scroll masks (MECHANICS, windows AUTHORED)
8. The token + finale (pattern MECHANICS, motion AUTHORED)
9. The HUD instrument (pattern MECHANICS, segments AUTHORED)
10. Cards (anatomy fixed, content AUTHORED)
11. Chrome: mast, strip nav, title/colophon scrims
12. Reduced motion
13. Ownership rule: lods vs focus

## 1 · Engine contract
One pinned act: `<section data-sc-act="pin" data-sc-span="14">` with a
`[data-sc-stage]` child. The engine publishes progress as `--sc-p` on the act
element; all bespoke behavior derives from it. Cards use
`data-sc-cue="from to rampIn rampOut"` (fractions of the window; 0.14/0.18
gives a ~70% reading plateau). Only the final cue may be one-valued. Never
edit `scrollcraft.js`/`scrollcraft.css`.

## 2 · Geometry + stops (AUTHORED)
World is a 1600×1000 sheet drawn into `#stage-sheet` (a second full-viewport
`#overlay` SVG is screen-space). The reference draws a ring (`CX,CY,R`,
`pt(theta)`); replace with the concept's topology and give every stop:
position, `no`, `name`, `plain` tagline, and authored label placement
`{lx, ly, la, pAbove}` in screen px relative to the node — pick the quadrant
that stop's internals leave empty. Each stop also gets an internals group
(`intGroup(key)`) whose lines/rects/labels illustrate the concept with REAL
content, and a plate rect sized to contain the whole cluster including its
screen-offset labels (screen offsets ÷ ppu ≈ world units; be generous).

Focus-window mapping: the reference render() assumes STATIONS[i] ↔ REGIONS[i]
one-to-one. Any topology with an off-path stop (a decision panel between two
path stops, say) breaks that indexing — give each station an explicit window
index (`wIdx`) into REGIONS and look focus up through it instead of `i`.

## 3 · Camera
`CAM_BOXES` (named world rects) + `CAM` keyframes `[p, name]` (AUTHORED).
Holding the same box across two keyframes is a rest; card cues live inside
holds. `cameraAt(p)`: centres lerp linearly, sizes lerp in log space — this
is what makes zoom feel even (MECHANICS). `fit()` letterboxes to viewport
aspect; output written as `viewBox` per frame; `ppu = innerWidth / vb.w`.
TITLE box shifts the drawing right of the title copy; reuse it for the
colophon bookend. Reduced motion pins the camera to TITLE.

Numbers you will otherwise re-derive: at 1440x900 the reference's station
framing lands at ppu ≈ 1.88 (aspect-dependent — recompute via `fit()` if the
boxes change), which is the number to use when converting a label's screen
offset into world units for plate sizing. And the card eats roughly half the
frame: a stop's internals must stay within about ±270 world units on the side
AWAY from its card at the station framing, or the frames will show the card
covering the diagram — the two collisions this rule comes from were both
caught in screenshots, not in code review.

## 4 · Counter-scaled labels
`label(txt, x, y, {dx, dy, a, fs, cls, lod}, parent)` registers text whose
font-size is `fs / ppu` px — i.e. `fs` IS the on-screen pixel size at every
zoom. `rescale(ppu)` repositions anchors (world point + screen offset × inv)
and toggles `lods` entries. All sheet text carries a paint-order olive halo
(CSS). Floors: names 15, taglines 12, internals 11.5. `t-fixed` class text is
sheet furniture that scales with the drawing instead (title block).

## 5 · Two-state focus
THE load-bearing hierarchy. Per stop: a rest ring (`e-station-rest`, sage
blend) always drawn; a paper ring + core + name/tagline/internals/plate whose
opacities render() drives from `f = trap(p, region.w0, region.w1)` (trapezoid,
22% ramps). Application per frame:
ring `f`; core `0.45+0.55f`; name `0.38+0.62f`; tagline/internals/plate
`detail ? f : 0` where `detail = ppu >= 1.45`. The decision point obeys the same two-state
rule as the stops: give it a rest outline and a separate live cluster rather
than the reference's always-half-lit `0.3 + 0.7f`, which on a large instrument
panel reads as neither state. Decision point and terminal
are their own clusters; after the resolution moment they use
`clamp01((p - resolveStart)/0.05)` so they light and then STAY lit through
the close. Reduced motion: all f = 1. The screen-space spotlight (radial
gradient rect in the overlay, centred on the focused stop while its card is
lit) stacks on top of this for edge dimming.

## 6 · Plates, spotlight, halos
All plate rects live in one `<g class="e-plates">` with group opacity 0.6 and
solid child fills so overlapping platforms never double-darken. Build that
group BEFORE any focus-managed cluster it sits under: SVG paints in document
order, so a plate created later covers the internals and the instrument it was
meant to sit behind (that bug measured 1.9:1 once). The spotlight's radial
stops are AUTHORED, not carried over: the reference's clear radius is tuned
for a ring whose internals hug their node, and a linear topology whose labels
sit 150-270 world units out will land them in the dim band unless you widen
the clear stop. Halos
(`e-halo`) pulse stations during the finale by angular/positional proximity
to the token.

## 7 · Draw-on-scroll
Each drawable segment is duplicated into an SVG `<mask>` with
`pathLength="1"` and a CSS dash driven by `--sc-p` between `--f0`/`--fw`
(pure CSS, no JS per frame). Windows are AUTHORED to coincide with camera
transits so ink front = token = camera arrival. Gotchas table covers the two
Chromium traps (vector-effect, round caps).

## 8 · Token + finale
The token is a clay dot riding waypoints `lerpWay(TH_WAY, p)` during the
guided tour, then an accelerating function through the finale (the ring used
shrinking per-lap p-spans; a pipeline would stream repeated passes). The
finale ALSO deposits a visible record (trail rings / accumulating marks via
masked shapes windowed to each pass) and drives a checklist with one FAIL
before the pass. Deterministic playback only: every frame is a pure function
of p — no Date.now, no randomness — which is what makes the harness able to
verify it and phones render it identically.

Non-wrapping topologies: a ring laps continuously, but a path or tree cannot
wrap. Run the finale as per-pass sweeps — each pass's p-span maps 0→full
distance, the token restarting at the origin — which both shipped non-ring
builds found reads naturally. And park the token at the END of its journey
inside a node's center (docked in the terminal ring), never at a spur
endpoint near a label: the parked state holds for many frames, so any
overlap with letterforms is a standing collision, not a flicker.

## 9 · HUD instrument
Fixed top-right panel: caption row, a segment bar (flex `<i>` elements whose
widths render() sets from per-segment waypoint arrays in "k" units against a
fixed scale), a budget tick, one status row (turn / value / verdict). Choose
segments that mean something in the concept and let the finale pump them
(grow → compact sawtooth). Numbers in cards and the HUD should agree loosely
(the HUD is a gauge, not an invoice). Compact variant shows on mobile; keep
the mast `max-width` clear of it. The PANEL (fixed position, caption, status
row, mobile compaction) is the mechanic; what lives inside it is authored —
one segment bar is only the reference's choice, and a two-bar or other
instrument shape means rewriting the panel's inner HTML/CSS, which is
expected, not a violation.

## 10 · Cards
Anatomy (fixed): `card__head` (stage no + `// name` + step counter in
`card__ctx`) → `h2` → `card__plain` → `card__cap` ("▸ what this artifact is")
→ `card__code` panel → `card__tip`. Panels: mono ≥0.8rem desktop / 0.72
mobile; each visual line is `<span class="ln">` (block, `white-space: pre`
on the line, `normal` on the container — see GOTCHAS); `data-hl-a`/`-b` line
ranges get the gold band, switching at the stage's scroll midpoint. Palette
classes: `.k` gold structural, `.f` bold paper names, `.s`/`.n` sage
strings/numbers/green results, `.bad` clay failures, `.c` italic muted
comments. Title/breath/colophon are `card--bare` with gradient scrims
(solid backgrounds on mobile). Leader line + halo in the overlay connect the
lit card to its subject (anchors: stop ids, decision point, token, terminal).

## 11 · Chrome
Mast top-left (brand + live state line from REGIONS). Strip nav
bottom-center on ALL sizes (labels on desktop, numbers on mobile, gold
marker band on current, 44px targets) — a side rail collides with cards.
One-row title block bottom-right of the sheet.

## 12 · Reduced motion
The complete final composition, statically: camera at TITLE, everything
drawn, finale state final, checklist done, f=1 everywhere; cards still cycle
on scroll (engine cues keep working). This state is the spec for "what does
finished look like".

## 13 · Ownership rule
An element's opacity has exactly ONE owner. `lods` entries are toggled by
`rescale()`; focus-driven elements (plates, internals groups, taglines,
rest/focus rings) are owned by render()'s focus pass and must NOT be in
`lods` — the reference removes them. Focus-driven elements still gate on
`detail` (ppu >= 1.45) inside render() so phones never leak internals. When
an element misbehaves, first ask: who owns its opacity?
