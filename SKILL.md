---
name: conceptcraft
description: >-
  Build a conceptcraft: a scroll-driven zoom-canvas explainer that teaches ONE
  concept on a single engraved sheet. The camera zooms stop by stop; each stop
  expands from a quiet mark into a labeled diagram with a captioned, readable
  artifact panel; a live HUD instrument tracks the concept's state the whole
  way; the finale runs the whole system live under scroll. Use this whenever
  the user wants a concept, mechanism, process, pipeline, or system explained
  as an interactive page — "explain X as a scroll page", "make a conceptcraft
  on X", "zoom canvas", "teaching canvas", "scroll explainer", "interactive
  explainer", or a concept page for a talk, a lecture, or YouTube (agents,
  RAG, transformers, context windows, protocols, algorithms, architectures).
  Also use for a "worked example" companion of an existing conceptcraft. NOT
  for landing pages or marketing and NOT for rendered video — conceptcraft
  ships an interactive web page.
---

# conceptcraft

One concept. One drawing. A camera that zooms. That is the whole format:
the page is a single engraved instrument sheet (the "canvas"), the concept is
drawn on it once, and scroll drives a camera from stop to stop. Reading the
page IS operating the machine.

The reference implementations in `references/reference-build/` define the
standard: `index.html` + `loop.js` is an abstract concept page (an AI agent
loop); `worked-index.html` + `worked-loop.js` is its worked-example companion
(the same loop traced through one real task).

Read the reference `loop.js` before building anything: it is organized into
AUTHORED layers (geometry, stops, content, instrument data — rewrite these per
concept) and MECHANICS layers (camera, labels, focus, cues, verification
plumbing — carry these over untouched). `references/MECHANICS.md` maps every
subsystem and says which side of that line it is on.

## The format laws

Each of these was earned through rounds of real feedback on the reference
builds. Violating one re-creates a failure that has already been paid for.

1. **Two states, nothing in between.** At rest, every stop is an icon: a
   muted mark that blends with the sheet, a low-opacity grey name, NO
   internals, no platform. Only the scroll-current stop expands: bright node,
   full-strength name, tagline, internals diagram, translucent platform.
   Driven by per-region focus trapezoids of scroll progress, never by card
   fades or hover. Anything gentler produced overlap complaints twice.
2. **Labels are screen-sized and haloed.** Counter-scaled label `fs` values
   are literal screen pixels: names 15, taglines 12, internals 11.5–12,
   never below 11. Every sheet label carries the ground-toned paint-order
   halo so lines never cut through letterforms.
3. **Label placement is authored per stop, not derived.** Each stop's
   internals occupy a quadrant; the name goes where that stop's drawing
   leaves clear space. A radial formula WILL collide somewhere.
4. **The drawing narrates the example.** Internals labels carry the concept's
   real content (real filenames, real numbers, real commands), not generic
   part names. Taglines too.
5. **Cards follow one anatomy**: mono head with stage number + step counter
   ("turn 01 · step 3 of 6") → display headline (the story) → one plain
   sentence → artifact caption ("▸ the sandbox terminal, exactly as
   observed") → the artifact panel (mono, ≥0.8rem desktop, gold line-
   highlight range that shifts at the stage's midpoint) → one `//` mono tip
   (the engineering lesson). Trim ruthlessly; no em dashes anywhere.
6. **One live instrument.** A fixed HUD panel tracks the concept's own state
   as a pure function of scroll (a context-window bar with typed segments
   that fill, overflow the budget tick, and compact is the model). Pick the
   instrument from the concept: the one quantity that grows, drains, or
   compounds.
7. **The finale runs the system — through its payoff structure.** After the
   guided tour, the diagram switches on: deterministic scroll-driven playback
   with accumulating state (trails, counters, checklists), including one
   caught failure — showing the failure path honestly is editorial law.
   Resolved elements STAY lit through the close; everything else returns to
   rest. And the run must visibly exercise the concept's defining operation,
   not just repeat the tour's route: a graph is TRAVERSED (a query walks its
   edges), a queue DRAINS, a gate DECIDES. A build whose run climbed past the
   graph four times without ever walking it felt hollow until a walker looped
   through the edges each pass.
8. **Calm, one crescendo.** Measured teaching throughout; the live run is the
   only loud stretch. Title and colophon sit on gradient scrims (solid on
   mobile) with the drawing pushed to the other side of the frame.
9. **One skin family, per-build theme variant.** The default skin is an
   engraved editorial look: ground olive #2b3122, paper #f2eee4, clay
   #b07a54 (attention, scarce, never small text), gold #d2a24a (selection,
   highlight bands), sage #97a06a (verified, rest-state, done), muted
   #cfc7b2, Space Grotesk display, Inter prose, Space Mono literal state, no
   danger color (failure is clay), `//` comment voice, crop marks, hairlines,
   a one-line title block. Substitute your own brand family if you have one —
   but keep the ROLES (ground, paper, attention, selection, verified, muted).
   And no two builds in a series wear the EXACT same skin: vary the
   temperature of the ground and the lead accent per concept — the reference
   family uses canonical olive/gold for the loop page, a mossy olive #272b1e
   with gold-tinted engraving ("the ledger") for a graph page, and a warm
   umber #332d20 with clay-warmed inks ("the shop floor") for a production
   example. Pick the variant FROM the concept, shift only the ground, grid,
   and ink tint tokens, and re-run the contrast pass after.

## Workflow

### 0 · Interview (short)

Ask the user four things, one pass: **the stops** (their decomposition of the
concept, 4–7), **the depth** (default: layered — plain English wide,
engineer detail zoomed), **the instrument** (what quantity the HUD tracks),
**the finale** (what the live run shows, and its one failure). Default
everything else. If no human is reachable (subagent or automated run),
self-answer in the page's voice, mark the build report "interview
self-answered", and proceed.

### 1 · Decompose onto a canvas

Teach the mechanism, not the source. When the brief hands you a paper, a
video, or a post, extract how the concept WORKS and teach that; a page that
narrates the source's story arc is a book report, not an explainer. Source
material supplies mechanics, real numbers, and credit lines — never the
page's structure.

Draw the concept's TRUE topology, not the reference's ring: a cycle is a
ring, a pipeline is a path, a hierarchy is a tree, a tradeoff is an axis, a
protocol is two columns exchanging, a shared-memory system is a hub with its
operations cycling around it. The 1600×1000 sheet, stops placed on the
shape, one special decision point (the reference loop has "the gate"), and
one terminal where the resolved thing exits. Sketch the camera boxes so
every stop's framing leaves room for its card (cards alternate left/right;
offset the box center toward the card side by ~145 world units — and see
MECHANICS 3 for the real internals-width budget). Plan the finale's motion
on the same shape (a ring laps; a pipeline streams items; a tree
propagates; a hub is orbited).

### 2 · Scaffold

```bash
node ~/.claude/skills/conceptcraft/scripts/scaffold.mjs <build-name>
```

This copies the reference implementation + engine into
`./conceptcraft-builds/<build-name>/` (override with a second argument or
`CONCEPTCRAFT_WORKSPACE`). Add `--worked` to start from the worked-example
companion (narrated real-artifact cards with captions) when the build IS a
worked example rather than an abstract concept page. The engine files
(`scrollcraft.js`, `scrollcraft.css`) are the mechanism: never edit them.

### 3 · Rewrite the AUTHORED layers

In `loop.js` (top of file, clearly sectioned): STATIONS (stops, taglines,
per-stop label placement), geometry constants and path construction, CAM
boxes + keyframes, draw-on-scroll segment windows, token waypoints, the
finale state functions, HUD segment waypoints, TODOS/checklist timings,
REGIONS. In `index.html`: title, cards, breath, finale card, exit, colophon,
mast. Progress map convention: title ~0.05, stops ~0.06–0.07 each, decision
point, breath (authored silence), finale ~0.20 (the largest span by far),
resolution, colophon hold. Cue plateaus: `data-sc-cue="from to 0.14 0.18"`;
only the last cue may be one-valued.

### 4 · Verify — not optional, and read the images

```bash
cd <build dir> && npm i playwright-core                      # once per build
node ~/.claude/skills/conceptcraft/scripts/serve.mjs --root . --port <PORT> &
S=~/.claude/skills/conceptcraft/scripts
node $S/shoot.mjs --url http://localhost:<PORT> --out lab/shots --per-act 44
node $S/shoot.mjs --url http://localhost:<PORT> --out lab/shots810 --height 810 --per-act 24
node $S/shoot.mjs --url http://localhost:<PORT> --out lab/mobile --width 390 --height 844
node $S/shoot.mjs --url http://localhost:<PORT> --out lab/reduced --reduced-motion
```

(Pick PORT by probing — any written list of taken ports goes stale;
`lsof -ti :PORT` or just try one and step up. shoot.mjs's default desktop
viewport is 1440x900, so the 810-tall run needs `--height 810` explicitly;
on a one-act page `--per-act` is the total frame count.) Then READ the
contact sheets and individually read every stop's framing plus the finale
and colophon frames — collisions live in frames, not in reports. The harness
flags authored plateaus and JS-driven motion as "dead scroll": verify those
windows by probing live state (viewBox, token position, counters) and
document them as false positives. Contrast must clear 4.5:1; run BOTH
810-tall and 900-tall viewports because detail thresholds interact with
aspect (see GOTCHAS). Reduced motion must show the complete final
composition with cards still cycling. The harness samples ~2% steps, so
every load-bearing beat needs a hold of at least 0.02 of scroll progress —
confirm each beat lands in an actual frame.

### 5 · Ship

`node assemble.mjs` inlines everything into `artifact.html` — a complete,
self-contained document you can host anywhere: publish it as a Claude
artifact, drop it into a site's static directory, or serve it as-is. When
you update a shipped page, republish to the same URL/path rather than
minting a new one. If you keep a registry of shipped builds, append a row.
Report what was verified, what was not, and whether the interview was
self-answered.

## References

- `references/MECHANICS.md` — every subsystem mapped: camera, counter-scaled
  labels, two-state focus, plates, spotlight, masks, HUD instrument, cards,
  nav, reduced motion. Read before touching `loop.js`.
- `references/GOTCHAS.md` — the debugging table. Every row cost real time in
  the reference builds; check it FIRST when something renders wrong.
- `references/reference-build/` — the canonical files. `index.html`+`loop.js`
  is the abstract concept page; `worked-*` is the worked-example content
  pattern on the same mechanics.
- `engine/` — the scrollcraft runtime (MIT, © Nate Herk,
  github.com/nateherkai/scroll-craft), vendored. Never edit it per-build.
