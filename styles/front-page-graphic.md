# Style: Front Page Graphic (data-journalism annotated diagram)

Reference clip: `examples/front-page-graphic.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs front-page-graphic`.

**Pitch:** An NYT / Pudding / Reuters-style explanatory graphic. A calm newsprint diagram drawn step by step, with serif headlines and thin leader-line annotations that "explain the chart" instead of axis labels.
Refs opened: https://pudding.cool/process/how-to-implement-scrollytelling/ · https://www.datawrapper.de/blog/better-more-responsive-annotations-in-Datawrapper-data-visualizations · https://datawrapper.de/blog/annotations-in-bar-charts (via search)

**Why it suits explainers:** Scrollytelling is literally "one fixed graphic, `update(step)` per narration sentence" (Pudding), which maps 1:1 to our seekable timeline. Annotation-over-labels (Datawrapper) suits naming tables, endpoints and owners. It reads as trustworthy and senior. Weak at: punchy drama and hype beats, and it is slow if the diagram is too dense.

**Visual spec:**
- Palette: newsprint `#FAF8F3`, ink `#1A1A1A`, secondary text `#6B6B6B`, accent orange `#D9531E`, data blue `#2F6DB5`, highlight wash `#FCE8C8`.
- Fonts: display **Newsreader** 600 (headline), body **Libre Franklin** 400/600 (annotations, small caps kickers), mono **IBM Plex Mono** 400.
- Texture: none beyond a 1px hairline frame and a "kicker" label top-left, e.g. `HOW IT WORKS · CONFIG V2`.
- Code: a small mono "specimen box" with grey line numbers; one line gets a `#FCE8C8` wash band.
- Flow: 1.5px ink leader lines with small dot ends and elbow joints. Data flow uses thin blue curves with a single moving dot, sparse and not glowing. Labels carry a white halo (paint-order stroke) where they cross lines.

**Motion grammar:**
- One state change per sentence. The graphic stays put and only its state changes.
- Elements fade-and-rise 8px (0.4 s, `power2.out`). Leader lines draw (stroke-dashoffset) and then their label types on by word.
- Emphasis means the wash band, an orange circle drawn around the target, or everything else dimming to 35%.
- Transitions are cross-fades of annotation layers. There are no camera moves except a slow 3% push.
- Avoid: kinetic type, shakes, more than two annotations visible at once.

**Storyboard:**
1. **Now 0.00 → change 1.04:** Kicker and headline "The biggest change" set in Newsreader. A thin orange rule draws under "change" on 1.04.
2. **Build 1.84 → function 3.84:** The headline shrinks to the top. A diagram draws in the centre: a rounded box `buildConfig()` with a specimen card beside it. On **pure 3.52** a leader line draws from the box to the annotation "pure function: same input → same output".
3. **snapshot 4.80 → in 5.68:** A left node "device snapshot" fades up. A blue curve draws into the box and its dot arrives on **in 5.68**.
4. **config 6.24 → out 7.04:** A right node "config" fades up. The curve draws out and the dot lands on **out 7.04**.
5. **No 7.44 → history 8.56:** Ghosted grey nodes "database" (cylinder) and "history" (clock) sit below. Dashed lines toward them are drawn and then cut with an orange ✕ at 7.68 and 8.56. Annotation: "touches neither".

**Build notes:**
- Leader line plus typed label in sync: one GSAP sub-timeline per annotation, `strokeDashoffset` then a SplitText-free word reveal (pre-split spans, `stagger 0.06`), all keyed by absolute times from the word list.
- Text halos: SVG `<text paint-order="stroke" stroke="#FAF8F3" stroke-width="6">`. Check that Chromium's headless render keeps it, which it does on current builds.
- Dot travel: `MotionPathPlugin` along the same `<path>`, with `progress` tweened linearly so seeking is exact.

## Lessons from the sample build

- Strong; reads like a real NYT explainer. Headline shrinks, box + specimen card, leader-line annotation, single dot lands on 'in'/'out', dimming to 35%.
- Labels as HTML placed clear of lines worked (no SVG halos needed). Dot moved by a small path-length function rather than MotionPathPlugin.
- First ~1.6 s is just the headline — fine for an opener, but don't repeat that per chapter.
