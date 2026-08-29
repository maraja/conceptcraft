# conceptcraft

A [Claude Code](https://claude.com/claude-code) skill that builds **scroll-driven
zoom-canvas explainers**: one concept, one engraved drawing, a camera that
zooms. Scroll drives everything — the camera walks the concept stop by stop,
each stop expands from a quiet mark into a labeled diagram with a readable
artifact panel, a live HUD instrument tracks the concept's own state, and the
finale runs the whole system deterministically under scroll, including one
caught failure.

The output is a single self-contained `artifact.html` you can host anywhere:
a static directory on your site, a Claude artifact, an S3 bucket. No build
step, no dependencies at runtime, fonts from Google Fonts, everything else
inlined. Built for teaching: classroom lectures, conference talks, YouTube
companions.

## Install

```bash
git clone https://github.com/maraja/conceptcraft ~/.claude/skills/conceptcraft
```

That's it — Claude Code picks it up as a skill. Then, in any session:

> make a conceptcraft explaining how RAG retrieval works

Claude interviews you briefly (the stops, the depth, the HUD instrument, the
finale), scaffolds a build from the reference implementation, rewrites the
authored layers for your concept, and runs a screenshot-based verification
harness (desktop at two heights, mobile, reduced motion, contrast) before
shipping.

## What's in the box

```
SKILL.md                     the format laws + workflow Claude follows
references/MECHANICS.md      every subsystem, split MECHANICS vs AUTHORED
references/MODES.md          the four presentation modes + how to pick one
references/modes/            copy-paste panel kits, one per mode
references/SHEETS.md         the five sheet worlds + the furniture switch
references/sheets/           one token block per world, and the switch
references/DEPTH.md          the three planes + the veil that makes them
references/depth/            depth.css + depth.js, the compositor kit
references/GOTCHAS.md        the debugging table (every row cost real time)
references/reference-build/  two full reference pages (concept + worked example)
engine/                      the scrollcraft runtime (vendored, never edited)
scripts/scaffold.mjs         one command starts a new build
scripts/serve.mjs            tiny static server for verification
scripts/shoot.mjs            the screenshot/contact-sheet verification harness
scripts/probe.mjs            screenshot + live state at exact scroll positions
scripts/svgcontrast.mjs      on-screen contrast for SVG sheet labels (+ px.mjs)
```

The only tooling dependency is `playwright-core` (installed per-build, used
only by the verification harness).

## The format in one paragraph

At rest, every stop on the sheet is an icon — a muted mark and a dim name.
Only the scroll-current stop expands into a full diagram, driven by focus
trapezoids of scroll progress. Labels are screen-sized and haloed, placed by
hand per stop. The drawing narrates a real example (real filenames, real
numbers), never generic part names. After the guided tour, the page runs the
system it just taught — deterministically, as a pure function of scroll, with
accumulating state and one caught failure — and what the run resolves stays
lit through the close. Every frame of that is verified from screenshots
before it ships.

## Sheet worlds: how much of the page is furniture

The reference sheet is a dark engraved plate carrying five furniture layers
at once: a fine grid, a coarse grid, a frame, crop marks and a title block.
None of them carries information, and inheriting all five everywhere reads
as busy. **Furniture is opt-in**: `references/sheets/_furniture.js` replaces
the hardcoded block with a `SHEET` config, and each world ships a token block.

| World | Ground | Furniture | Best for |
|---|---|---|---|
| Blueprint | dark olive | all five layers | subjects that genuinely ARE instruments |
| Clean paper | light warm | none | calm; video and print |
| Chalkboard | matte slate | none, chalk strokes | teaching in a room |
| Editorial | warm paper | two rules at most | pages that read as writing |
| Bare stage | near-black | none | one strong drawing |

The three axes compose: a page is a theme, a mode and a world. Going light
inverts more than colour, and a transparent card changes the composition,
so read `SHEETS.md` before switching an existing build.

## Modes: the vessel matches the material

A conceptcraft has three independent axes, plus depth on every build.
**Theme** is colour temperature, so a series never looks identical. **Sheet
world** is the ground and how much furniture it carries. **Mode** is the
information-display language, and it is chosen from the TYPE of material
being taught:

| Mode | Material | Panels look like |
|---|---|---|
| Terminal | code, commands, logs | dark well, mono lines, syntax colour |
| Archive | history, people, documents | typeset excerpts, citations, highlighter |
| Notebook | math, derivations | ruled paper, worked steps, margin notes |
| Field Guide | comparisons, data | numbered plates, specimen boxes, charts |

One dominant mode per page, declared as `mode--<name>` on the act root; a
single card may borrow another mode's panel when its material calls for it.
The engraved sheet, camera, and instrument never change. This exists because
a history page once shipped a 1973 government report inside a syntax-coloured
terminal well: a quotation is a document, and it should look like one.

## Depth: three planes, never one

Theme, mode and sheet world decide what the page is made of. Depth decides
how far away each thing is, and every build gets it.

Every card-up frame carries three planes: **background** (the furniture and
every resting stop, washed toward the ground colour and thrown out of focus
by a backdrop blur), **midground** (an aperture cut over the current subject,
left untouched), and **foreground** (the card and the chrome, sharp, on a
field that has gone quiet). One element does all three.

This replaced opacity, which cannot separate planes: a label at 0.38 is still
a sharp label at full size competing for the same eye. It also retires the
radial vignette the format used to carry, most of the focus plate, and the
reason builds needed hand-measured camera-pan tables to keep the drawing off
the copy. `references/DEPTH.md` has the five rules and the per-world wash
tokens; the two traps that cost the most are mounting the veil on `<body>`
(the pinned stage is a stacking context, so the veil then blurs the cards it
was meant to lift) and ramping the veil's `opacity` (a backdrop-filter
element at opacity < 1 composites its blurred copy over the sharp original,
and the sheet arrives doubled).

## Topologies

The reference page draws a ring (an agent loop), but the format is
topology-first: a pipeline is a path, a hierarchy is a tree, a shared-memory
system is a hub with its operations cycling around it. The skill's first job
on a new concept is decomposing it onto its TRUE shape.

## Credits

- Format and reference builds by [Amit Maraj](https://github.com/maraja).
- The scroll engine (`engine/scrollcraft.js` + `.css`) and the verification
  harness (`scripts/shoot.mjs`, `scripts/serve.mjs`) are from
  [scroll-craft](https://github.com/nateherkai/scroll-craft) by Nate Herk,
  MIT licensed, vendored unmodified.

## License

MIT — see [LICENSE](LICENSE).
