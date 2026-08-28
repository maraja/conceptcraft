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
