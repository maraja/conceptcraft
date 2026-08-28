# conceptcraft modes: the vessel matches the material

A conceptcraft has two independent axes.

- **THEME** is colour temperature (law 9): olive/gold, "the ledger", "the
  shop floor", "the frost". It varies per build so a series does not look
  identical.
- **MODE** is the information-display language: what an artifact PANEL looks
  like, how its material is set, and the voice of the tip beneath it.

Mode is chosen from the TYPE of material being taught, never inherited from
the last build. This law was earned: an AI-history page shipped with
Lighthill's 1973 report and Simon's 1965 forecast rendered in dark,
syntax-coloured terminal wells, because terminal was the only panel language
the format had. It read as a category error, and it was. A historical
quotation is a document. It should look like one.

## Selection matrix

| Mode | The material | Panel language | Tip voice |
|---|---|---|---|
| **Terminal** | code, commands, logs, protocols, system state | dark `--inkk` well, mono `.ln` lines, syntax colours, gold lit band | `// comment` |
| **Archive** | history, people, documents, events, decisions | typeset excerpt on paper, clay left rule, oversized opening quote, citation line in small mono caps, gold highlighter sweep | `n.b.` italic footnote |
| **Notebook** | math, theory, derivations, algorithms | ruled paper, typeset steps (mono for formulas), margin annotations and arrows in a handwriting face, pencil circle/underline as the sweep | handwritten margin note |
| **Field Guide** | taxonomies, comparisons, benchmarks, measured data | numbered figure plates, specimen boxes, engraved mini-charts with annotated axes, legend chips | `fig. N —` caption |

If the page teaches a mechanism made of code, it is Terminal. If it teaches
what people claimed and what happened, it is Archive. If it teaches why the
math works, it is Notebook. If it teaches how things compare, it is Field
Guide. When two apply, pick the one the MAJORITY of panels need and borrow
for the rest.

## The rules that make this a system

1. **One dominant mode per page**, declared as a class on the act root:
   `<section class="loop mode--archive" data-sc-act="pin" ...>`. Panel CSS
   is scoped under that class so modes cannot leak into each other.
2. **A card may borrow ONE other mode's panel** when its own material demands
   it: a chart plate (Field Guide) inside an Archive page is correct, because
   error rates are data even on a history page. Borrowing is per-card and
   deliberate; a page that borrows on half its cards chose the wrong
   dominant mode.
3. **The sheet never changes.** Mast, HUD, strip nav, engraving labels, the
   title block, and the `//` voice on the DRAWING stay mono and identical in
   every mode. That instrument-sheet backbone is the format's signature; only
   the material vessels change. Modes are not skins for the whole page.
4. **The lit-band mechanic is universal, its skin is not.** Every mode keeps
   the scroll-driven highlight that switches range at the stage's midpoint
   (`data-hl-a` / `data-hl-b`). Terminal paints a gold row; Archive sweeps a
   highlighter; Notebook draws a pencil underline; Field Guide rings a plate.
   Same JS, different paint.
5. **Light panels need their own contrast pass.** Terminal wells are
   light-on-dark and always clear. Archive/Notebook/Field Guide are
   dark-on-paper: the harness DOES read HTML cue text, so its contrast pass
   covers them, but citation lines and annotations are the small text that
   fails first. Muted ink on paper: use `rgba(35,36,30,0.62)` or darker,
   never the sheet's `--e-faint`.

## Per-mode spec

Copy-paste vessels live in `references/modes/`. Each is a standalone HTML
file you can open directly to see the panel; the CSS block is scoped and
drops into a build's `index.html` unchanged.

### Archive — `modes/archive-panel.html`
An excerpt is a quotation from a real document. It carries: an oversized
opening quotation mark (clay, low opacity, absolutely positioned so it does
not push the text), the quoted text set in the prose face at ~0.95rem with
generous leading, a clay left rule, and a citation line beneath in mono caps
at 0.62rem letterspaced (`LIGHTHILL REPORT · UK SRC · 1973`). Multiple
excerpts stack with a hairline between. The highlighter sweep is a gold
background with a slight vertical inset and a soft left/right fade, so it
reads as marker pen rather than a table row. Exhibit lists (dated items) use
the same paper ground with a year stamp in mono at the left.

### Notebook — `modes/notebook-panel.html`
Ruled paper: repeating-linear-gradient horizontal rules at the line height,
plus a single clay vertical margin rule about 2.2rem from the left. Steps are
typeset in the prose face, formulas in mono, one step per ruled line so the
rules line up with the baselines (set `line-height` to match the gradient
period exactly or it drifts visibly). Margin annotations sit LEFT of the
vertical rule in the handwriting face, rotated a degree or two, with a small
hand-drawn arrow (inline SVG path, `stroke-linecap: round`). The sweep is a
pencil underline: a 2px gold line with a slight skew.

**The handwriting face.** Use a real handwriting face for the annotations;
the whole point is that a person is talking in the margin. Caveat, from
Google Fonts, is the shipped default and is allowed by the artifact CSP.
If you own a handwriting typeface, embed its REGULAR cut as a base64 data
URI instead: regular cuts of handwriting faces read far better at UI size
than their bold cuts, and if a note needs more presence, stroke it
(`-webkit-text-stroke: 0.4px currentColor`) rather than loading a heavier
file.

### Field Guide — `modes/fieldguide-panel.html`
A plate is numbered (`fig. 3`) in mono caps at the top-left of the panel,
with a hairline frame. Inside: either a specimen box grid (bordered cells,
one subject each, mono label beneath) or an engraved mini-chart. Charts are
inline SVG with a hairline axis, tick labels in mono at 0.62rem, bars filled
with the theme's sage/clay, and the value printed at the bar end rather than
on a gridline. Legend chips are 0.62rem mono with a 8px colour square. The
figure caption doubles as the tip.
