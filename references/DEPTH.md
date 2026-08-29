# Depth — the third dimension of the sheet

The fourth axis, after THEME (colour), MODE (the vessel) and SHEET WORLD
(the ground). Those three decide what the page is made of. This one decides
**how far away each thing is**, and it is the axis the first six builds did
not have at all.

## Why it exists

The verdict that produced it, on a set of builds that had theme, mode and
sheet world all chosen correctly:

> "the text overlaps and there's no dimension. It doesn't feel like there's
> dimension. It just feels like everything is kind of plopped on the same
> layer."

That is one complaint, not two. The text overlapped **because** everything
was on one layer. The format's separation tool was opacity, and opacity
cannot do this job: a label at 0.38 is still a sharp label at full size,
competing for the same eye at the same distance; a grid at 0.5 is still a
grid. Every fix downstream of that was a workaround for it. The authored
camera-pan tables, the per-stop clearance values, the "does any sheet line
cross the card's text boxes" probes: all of them exist to keep two things
apart that were never on separate planes to begin with.

What separates planes is **focus** and **occlusion**. Give the page those
two and the overlap stops being a defect to route around and becomes depth.

## The three planes

| Plane | What lives there | Treatment |
|---|---|---|
| **BACKGROUND** | the furniture, every resting stop, their labels, the rest of the drawing | washed toward the ground colour, thrown out of focus |
| **MIDGROUND** | the aperture: the current subject, its nodes, its internals, its labels | untouched, because the veil simply is not there |
| **FOREGROUND** | the card, the leader line, the HUD, the mast | sharp, lifted, sitting on a field that has gone quiet |

One element makes all three: a fixed-size div with a **wash**, a
**backdrop-filter blur**, and a **radial mask** that cuts an aperture over
the subject. Above it: foreground. Under the aperture: midground. Under the
wash: background. The kit is `references/depth/depth.css` and
`references/depth/depth.js`.

## The five rules

1. **Z-order is the contract, and the stage is a stacking context.**
   `.sc-stage` carries a `z-index`, so a veil mounted on `<body>` at z 11
   paints over cards that are z 20 *inside* that context, and the copy
   arrives blurred and bleached along with the drawing it was meant to be
   lifted off. Mount the veil inside `[data-sc-stage]`. The kit does this by
   default; do not "fix" it back to body. Full stack: sheet 1, veil 11,
   overlay 12, cards 20, chrome 30.

2. **Ramp the blur radius and the wash alpha, never the element's opacity.**
   A backdrop-filter element at `opacity: 0.5` composites a blurred copy of
   the page over the unblurred original, and the whole sheet arrives doubled,
   like badly registered print. Opacity stays 1 for the veil's whole life;
   `.is-off` removes it outright.

3. **On a light ground the veil bleaches.** The wash is always the ground's
   own colour, pushed toward the ground. Darkening paper reads as a stain,
   and lightening slate reads as fog. Same inversion as SHEETS rule 4.

4. **The background must survive.** A wash deep enough to erase the drawing
   is not depth, it is an empty page: there is nothing left to be *behind*
   anything. Tune the alpha until the resting drawing is still legible as a
   ghost of itself. Chalkboard needs the shallowest wash of the five worlds
   because chalk on slate is already low-contrast; bare stage needs the
   deepest because it has no furniture to soften the drop between planes.

5. **The aperture is the SUBJECT, not the node.** Centring a circle on the
   station node leaves that stop's internals diagram and its labels stranded
   out in the veil, which is precisely the overlap the veil exists to end.
   Feed it the **focus plate rect**: that rectangle was already authored, per
   stop, as "everything this stop owns", which makes it exactly the right
   shape. Union it with the node. A stop with several plates unions all of
   them; a terminal with no plate gets an authored box, never a radius guess.

## What depth retires

**The radial vignette.** Every build carried one: clear to 36–38% of its
radius, ~0.7 only at the far corner, centred on the node. It never reached
full strength anywhere on screen, so the resting labels stayed sharp and kept
colliding. The veil replaces it outright; delete the gradient, the rect, and
its `sizeOverlay()` sizing.

**Most of the focus plate.** The plate existed to give the focused cluster
its own ground on a page where everything shared one plane. The aperture does
that job better and with no edge. A stroked or tinted rounded rect sitting
*inside* a lit aperture reads as a second card floating on the drawing.
Drop the stroke, and drop the group opacity to roughly half; on dark worlds
paint the plate in `var(--sc-canvas)` so it is invisible over empty stage and
survives only as a fog where the drawing runs behind a cluster.

**Some of the camera-pan table.** Not automatically, and not yet: the pans
are authored and measured, and pulling them out is a separate pass with its
own verification. But the reason they were needed is gone. A ring's far limb
crossing the copy from the other edge, the case with no clean pan value at
all, is now a blurred ghost under a bleached wash. When a build next needs
its pans revisited, expect most of them to relax toward the plain 145.

## The tokens, per world

Copy one block into the build's `:root`. `--d-wash` is space-separated RGB
channels because the alpha is driven per frame.

| World | `--d-wash` | `--d-a-max` | `--d-blur-max` | `--d-sat` |
|---|---|---|---|---|
| Blueprint | `18 22 12` | 0.74 | 3.5px | 0.75 |
| Bare stage | `5 7 4` | 0.78 | 4px | 0.7 |
| Chalkboard | `20 24 20` | 0.66 | 3px | 0.8 |
| Clean paper | `244 241 232` | 0.62 | 4px | 0.55 |
| Editorial | `239 233 221` | 0.74 | 3.5px | 0.6 |

Clean paper runs the lowest alpha of the light pair because its ground is the
brightest of the five: the same wash that reads as "behind" on editorial's
warm paper reads as "blank" here.

## Wiring a build

Five edits, and they are the same in every build except the fourth.

1. Copy `depth.js` into the build; add `<script src="depth.js"></script>`
   after the engine, and the matching pair of lines to `assemble.mjs`.
2. Paste the veil CSS block and the world's `:root` tokens into `index.html`.
3. Keep the focus-plate world rects as data (`PLATE_R`) instead of throwing
   them away after constructing the rects.
4. Author `subjectPlate(anchor)`: anchor id to world rect. This is the one
   per-build part, because anchors are named after the concept (`w20`, `yh`,
   `gauge`), not after a stop index.
5. In `render()`, replace the vignette block with:

```js
var ap = null;
if (on && best.anchor !== 'token') {
  ap = CCDepth.box(CCDepth.union(subjectPlate(best.anchor),
                                 CCDepth.at(anchorPt, 46)), vb, ppu);
}
DEPTH.set(ap ? bo : 0, ap);
DEPTH.fore(ap ? best.el : null);
```

**Exempt the finale.** The live run is the page's one loud stretch and the
subject there is the whole system, not one stop of it; an aperture would pick
a winner among equals. Exempt any other anchor whose card is *about* the
sheet rather than about one node. A card that reads the page's live
instrument is the usual case: cut an aperture around one node there and you
veil the very instrument the card is discussing.

## Verifying it

The four shoot runs still apply and still have to be run one at a time. Two
things to check that are specific to depth, and neither is automated:

- **Read a frame at a stop midpoint, not just the contact sheet.** The three
  planes either read or they do not, and a 24-across contact sheet is too
  small to tell a bleached background from a blank one.
- **Confirm the card is not being veiled.** The symptom is subtle at low
  wash: copy that looks slightly grey and slightly soft. `getComputedStyle`
  on the card during a probe is not enough, because the veil does not touch
  the card's own styles; look at the pixels.

The contrast pass covers the rest for free: the harness measures on the
composited page, and a backdrop-filter is composited, so a wash that hurts a
cue shows up as a contrast failure rather than as a surprise later.
