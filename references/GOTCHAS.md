# conceptcraft gotchas

Every row cost real debugging or a round of the format owner's feedback
during the reference builds. Check here FIRST when something renders wrong.

| Symptom | Cause | Fix |
|---|---|---|
| Self-drawing path renders as broken fragments | `vector-effect: non-scaling-stroke` inherited by **mask** paths breaks `pathLength` dash normalisation in Chromium | `.stage-sheet mask path, .stage-sheet mask circle { vector-effect: none; }` |
| Short segment fully drawn before its window | `stroke-linecap: round` on the mask paints a cap-dot at the dash boundary | `stroke-linecap: butt` on the drawmask |
| Every frame past the first is blank when embedded | An ancestor `overflow: hidden` creates a scroll container and kills `position: sticky` | Class-scoped `overflow: visible` on the main wrapper |
| Console sprays `<text> attribute x: Expected length "Infinity"/"NaN"` | render() ran against a zero-size viewport (hidden pane, pre-layout frame) | Guard: return early when `innerWidth/innerHeight < 2` or `!isFinite(ppu)` |
| In-app browser screenshots come back blank/stale while DOM probes look perfect | The app's browser pane is hidden; the compositor serves dead frames | Verify with the headless harness (shoot.mjs), not the pane |
| All the sheet text is squint-small | Counter-scaled `fs` is a LITERAL screen pixel size at every zoom | Floors: names 15, taglines 12, internals 11.5; olive halo on all sheet text |
| Code panels have a phantom blank line between every line | `.ln` spans are blocks AND the raw newlines between them render under `white-space: pre` | `code { white-space: normal }` + `.ln { white-space: pre }` |
| Internals/platforms pop in during the wide finale view on some screens only | Detail threshold too close to the mid framing's ppu; ppu depends on viewport ASPECT (810 vs 900 tall differ) | Threshold 1.45, and verify at both 810- and 900-tall viewports |
| A cluster is visible when it should be hidden, or vice versa, intermittently | Two owners writing the same element's opacity (`lods` in rescale vs the focus pass in render) | One owner per element: focus-driven elements never go into `lods`; they gate on `detail` inside render() |
| Overlapping platforms create a double-dark patch | Two translucent rects stacking | All plates in one `<g class="e-plates">` with group opacity and solid child fills |
| Station name runs through its own diagram | Radial label-placement formula | Author `{lx, ly, la, pAbove}` per stop into its empty quadrant |
| Neighbor stops still "block" the focused one | Dimming instead of two states | Rest = sage mark + grey name + NO internals/plate; only the subject expands (focus trapezoids) |
| Long internals label pokes past its platform | Screen-px label ÷ ppu is world width; plates sized to glyphs only | Size plates for labels too; widen when relabeling |
| Title/colophon copy fights the grid and frame lines | Bare text on the sheet | Gradient scrim behind `card--bare` copy; SOLID background on mobile (long headlines escape gradients — this failed contrast at 2.3:1 once) |
| Mast runs under the HUD on phones | Both fixed at top | `mast { max-width: calc(100vw - 12.5rem) }` on mobile |
| Harness reports dead scroll everywhere | It cannot see the bespoke camera, CSS-driven ink, or JS state playback; authored plateaus look dead | Probe live state (viewBox, token, counters, lit lines) across flagged windows; document false positives |
| Side-rail nav collides with cards at some point | Cards anchor to both bottom corners; any vertical rail shares a corner | Strip nav bottom-center on all sizes |
| `Day <!-- -->01`-style comment splits (if ported into React) | React separates static text and interpolations | One template literal |
| Cue stays lit while the act unpins | A non-final cue given one value | Every cue except the last closes with a two-value window |
| Port already in use | Any written list of taken ports is stale the day after it is written | Probe before binding (`lsof -ti :PORT` or just try and step up); record the port actually used in the FINGERPRINTS row |
| The 810-tall verification run silently ran at 900 | shoot.mjs's undocumented default desktop viewport is 1440x900 | Pass `--height 810` explicitly for the second run; and on a one-act page `--per-act N` is simply the total frame count |
| A multi-line counter-scaled text block smears into one blob on phones | Lines offset in WORLD units under screen-px type: at ppu ~0.2–0.6 the 12px glyphs outgrow the world leading | Gate the block on a ppu floor (~0.6), or space the lines with screen offsets ÷ ppu like rescale() does |
| Sheet labels refuse to column-align with spaces | SVG `<text>` collapses runs of spaces | Interpuncts (`·`) for gaps on sheet labels; only HTML panels can space-align (via `.ln` + `pre`) |
| Finale/plane labels pile into an unreadable heap on phones only | Fixed-screen-px labels over a world region that phone framings compress to ppu 0.2–0.3 | Gate dense label groups on ppu ≥ ~0.45; below it show the bare shapes and let the card carry the words |
| The breath card sits on top of a lit cluster | The breath's screen anchor coincides with whatever the camera frames near its window (a decision point at the ring's bottom vs a bottom-center card) | When sketching camera boxes, also pick the breath card's anchor to be disjoint from the cluster lit near p ≈ its window |
| The token parks on a name's letterforms at the resolution moment | Exit/arrival paths authored to end near a label line; the parked state is held for many frames | End token travel at a node CENTER (dock it inside the terminal ring), never at a path endpoint chosen for the drawn spur; nudge the label down for air |
| A moving dot vanishes at its most dramatic moment | It was recolored to match the element it sits on (a clay dot stalled ON a clay dashed edge is camouflage) | Keep the mover its identity color; put the verdict color in a swelling ring or halo around it |
| A key beat exists in code but never appears in any frame | The harness samples ~2% steps; a beat narrower than one step falls between frames | Give every load-bearing beat a hold of at least 0.02 of p, and confirm it lands in an actual frame |
| Copy edits silently violate the skin | — | No em dashes anywhere visible; clay never on small text; no danger color; keep your own wordmark styling consistent everywhere |
| The finale drifts on phones or in the harness | Time- or randomness-driven animation | Every frame is a pure function of scroll p; no Date.now(), no Math.random() |
