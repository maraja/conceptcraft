# conceptcraft sheet worlds: how much of the page is furniture

A conceptcraft now has three independent axes.

- **THEME** (law 9) is colour temperature within one world.
- **MODE** (law 10) is the information-display language of the artifact panels.
- **SHEET WORLD** (law 11) is the ground itself: how much furniture the page
  carries, whether it is dark or light, and how the chrome is drawn.

The reference sheet was a dark engraved instrument plate carrying five
furniture layers at once: a fine grid, a coarse grid, a frame, four crop
marks and a title block. None of them carries information. Recolouring that
plate produced pages that all read as the same technical drawing, which was
the complaint that created this axis: the blueprint background and styling
read as complicated and busy on every page that inherited it.

**Furniture is opt-in, not inherited.** Every layer is off unless the world
asks for it. Use `sheets/_furniture.js` in place of the reference build's
"the desk, then the sheet" block and set `SHEET` once at the top of loop.js.

## The five worlds

| World | Ground | Furniture | Best for | Pairs with |
|---|---|---|---|---|
| **Blueprint** | dark olive | all five layers | subjects that genuinely ARE instruments: systems, protocols, code | terminal |
| **Clean paper** | light warm | none | anything you want calm; video and print | archive, field guide |
| **Chalkboard** | matte slate | none, chalk-edged strokes | teaching in a room; a lecture-hall projector | notebook |
| **Editorial** | warm paper | two rules, at most | pages that read as writing with diagrams | archive |
| **Bare stage** | near-black | none | one strong drawing that needs no context | any |

Pick the world FROM the subject and the room it will be read in, not from
the last build. A dark ground projects better in a lecture hall; a light
ground reads better on video and in print.

## The rules

1. **Furniture must earn its place.** A grid is justified when the reader
   needs to judge position or scale. Crop marks and a title block are
   justified when the page is pretending to be a printed plate. Otherwise
   they are costume, and five costume layers at once is the busyness this
   axis exists to fix.
2. **A TRANSPARENT CARD changes the composition** — this follows from the
   card treatment, not the world, so it applies wherever a world makes the
   card transparent (paper, editorial, bare) and not where the card keeps an
   opaque ground (blueprint, chalkboard). The drawing must be moved genuinely
   clear of the card rather than merely overlapped.
   **Clearance is the invariant; the offset is only a proxy for it.** Aim to
   maximise the world distance from the cluster's card-side edge to the card's
   inner edge, subject to keeping the whole cluster framed. A flat "+260
   toward the card side" works for compact clusters that hang toward the card,
   and BREAKS where a stop's internals sit on the far side of its node: there
   the offset pushes them off frame.
   **Clearance is not monotone in the pan, and a ring can need a NEGATIVE
   one.** On a closed topology, panning the near side away from the card
   swings the far limb in behind the copy from the other edge, so there is an
   optimum rather than a direction: one shipped build needed +260 at its gate
   and −80 at its terminal, where panning INTO the card side was what cleared
   the copy by driving the far limb off the screen edge. Author the pan per
   stop and measure it; never apply one number across a page.
   **Try rule 1 before rule 2.** Construction furniture — guide paths,
   midpoint ticks, direction chevrons — carries nothing at station zoom and
   is usually what crosses the card. Making those render-owned and visible
   only at the wide framings took five of seven stops to zero crossings on
   one build, without moving the camera at all.
   **Check the pan against the box before asking for it.** The reference's
   660x430 box caps the pan near 155 world units; asking for 260 there clips
   every stop's internals off the far edge. A bigger pan means a bigger box,
   which lowers stop ppu and moves the `detail` threshold, so re-pick that
   threshold as one named constant in a real gap between your framings.
   **Phones and reduced motion have no card side.** A phone stacks the card
   full-width at the bottom, and reduced motion parks the camera with the
   whole drawing lit; both put the entire drawing under the copy and no pan
   can help. Give the card a solid `var(--sc-canvas)` ground in those two
   cases: paper on paper reads as a clean sheet laid over the drawing.
   **Panning cannot save a page-spanning topology.** A drawing that is one
   continuous line with an axis, rather than a set of clusters, has ink
   everywhere the cards live and no camera box clears it. For those, give the
   card a GROUND-MATCHED WASH: `background: var(--sc-canvas)` plus a `::before`
   at the same colour, inset slightly, `filter: blur(11px)`. Because the wash
   is exactly the page ground it is invisible as a shape, yet the drawing
   stops softly before it reaches type. Declare the card's ground colour
   explicitly rather than leaving it transparent, or the verification harness
   samples the drawing underneath and reports a false contrast failure. Give
   the mast, HUD and nav the same treatment.
3. **The chrome follows the world.** A boxed HUD on clean paper reintroduces
   exactly the fussiness you removed. Light and bare worlds use a hairline
   or nothing; only blueprint gets a filled panel. Know the trade: a panel
   with no fill lets the drawing pass through it, so check the wide framings
   for lines crossing the HUD and nudge the geometry if one lands badly.
4. **Light grounds invert the ink roles.** Every stroke that was light-on-dark
   becomes dark-on-light, and the label halo becomes the PAPER colour: on a
   light ground you stroke light behind dark type, not the reverse. Do NOT
   swap the `--paper` / `--inkk` token names themselves; they are role names
   used across the cards and chrome, and swapping their values silently turns
   paper-on-paper text invisible. Change what each role RESOLVES to instead.
   Every alpha in GOTCHAS' paper-contrast row governs the SHEET labels too,
   not just the cards: `rgba(35,36,30,0.62)` measures 4.38:1 on warm paper and
   fails, so 0.68 is the floor for sheet ink.
   **All three family accents need re-cutting, not just one.** On `#efe9dd`,
   gold `#d2a24a` is 1.93:1 and vanishes as a stroke, sage `#97a06a` is
   2.29:1, and clay `#b07a54` is 3.02:1. Add darkened line-work variants
   (`#7a5f1c` gold, `#5f6840` sage, `#8d5a36` clay all clear 4.5:1) and keep
   the family colours only as washes UNDER dark ink, such as a highlighter
   band, where they still work.
5. **A handwriting face is not a full character set.** Chalkboard sets the
   sheet labels in your hand, but handwriting faces routinely carry no
   Greek, no combining marks, no interpunct and no arrows: a label reading
   `sigma`, `yhat` or `a · b` will silently fall back to a system cursive
   and stop matching the mono in the cards. Check the face's coverage, and
   give symbol-bearing labels an opt-out class that keeps them mono. If the
   face ships only a Regular cut, drop `font-weight: 700` from those labels
   or the browser synthesises a bold. Handwriting also reads smaller than
   mono at the same px: raise names to ~17 and taglines to ~14.
6. **The furniture switch is authoritative; the CSS is belt and braces.**
   Each world's token block also sets the grid tokens transparent, so the
   layers stay off even if someone re-enables them in `SHEET`. Keep the
   furniture CSS rules in the build rather than deleting them, so the switch
   remains flippable.
7. **The three axes compose, but not every pairing is good.** Chalkboard with
   terminal mode fights itself (a syntax-coloured well on a blackboard);
   editorial with terminal is worse. Blueprint+terminal, paper+archive,
   chalkboard+notebook and editorial+archive are the natural pairs.

## Kits

`sheets/_furniture.js` is the switch. Each world ships a token block that
drops into `index.html` near the top of the style element:

- `sheets/blueprint.css` — the original plate
- `sheets/paper.css` — light, zero furniture, inverted ink roles
- `sheets/chalkboard.css` — matte slate, hand-lettered sheet labels
- `sheets/editorial.css` — warm paper, serif display, section rules. Its
  "at most two rules" is hard to honour against fixed chrome: any full-width
  rule near the sheet's head or foot lands under the mast or the strip nav at
  some framing. It works when those elements sit on ground-matched washes, so
  the rule breaks behind them the way a rule breaks behind a folio.
- `sheets/bare.css` — near-black, nothing
- `sheets/_chalk-filter.js` — the stroke roughening for chalkboard only.
  Filter the wires and rings; never the small labels, which go mushy.
