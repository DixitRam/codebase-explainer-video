# Style: Zürich Schematic (Swiss / International Typographic motion)

Reference clip: `examples/zurich-schematic.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs zurich-schematic`.

**Pitch:** A Müller-Brockmann poster that explains code. A strict column grid, flush-left grotesk type, one red, and no ornament.
Refs opened: https://www.webdesignerdepot.com/2016/01/swiss-in-css-animating-the-international-typographic-style/ · https://wearefevr.com/the-influence-of-swiss-design

**Why it suits explainers:** The grid gives every concept a fixed address: input in column 1, function in column 2–3, output in column 4. That position-as-meaning reads like a type signature. Yablonski points out that the style's rectilinear grid fits CSS natively. Weak at: warmth, and long screenshot-heavy segments, because UI chrome fights the poster purity.

**Visual spec:**
- Palette: paper `#F2F0EA`, ink `#111111`, red `#E2231A`, grey rule `#BDB8AE`.
- Fonts: display **Inter Tight** 800 (tight tracking −0.04em, huge sizes); body **Inter** 500; mono **JetBrains Mono** 500.
- Background: flat paper with a visible 12-col grid (hairline `#BDB8AE`, 30% opacity) that appears only during transitions.
- Code: set as typography. A big mono line on the grid with no window chrome; tokens are coloured only ink or red.
- Flow: thick (14px) straight red bars on grid lines with orthogonal turns and no arrowheads. The bar ends abut the target block flush.

**Motion grammar:**
- Entrances are wipes along grid axes (clip-path inset) at `power4.inOut`, 0.35–0.5 s.
- Large words slide in from off-frame on their baseline.
- Emphasis means a red block snaps behind a word, or the word scales to fill a column.
- Transitions: the grid lines draw, the layout re-flows to new column spans, and the grid fades.
- Pacing: hard and metronomic, hitting exactly on word onsets.
- Avoid: rotation, bounce, blur, drop shadows, gradients, more than one accent colour.

**Storyboard:**
1. **Now 0.00 → change 1.04:** "THE BIGGEST" slides in on the baseline. "CHANGE." wipes in red, cols 1–12, filling the top two-thirds.
2. **Build 1.84 → function 3.84:** Type shrinks to the col-1 header. `buildConfig()` sets in mono at 120px. On **pure 3.52** a red rectangle snaps behind "pure"; on **function 3.84** a hairline frame draws around the function in cols 5–8.
3. **snapshot 4.80 → in 5.68:** A grey block labelled `snapshot` slides along a red bar from col 1 into the frame on **in**.
4. **config 6.24 → out 7.04:** A red block `config` exits along a bar into cols 10–12 on **out**.
5. **No 7.44 database 7.68 / No 8.40 history 8.56:** Two struck-through labels, `DATABASE` and `HISTORY`, set in grey at the bottom-left. A red rule strikes each one on its "No". The frame holds.

**Build notes:**
- Grid snapping: define the grid once as CSS custom properties (`--col: calc((1920px - 2*96px - 11*24px)/12)`). Position everything with `calc(var(--col)*n …)` so re-flows tween `left/width` between known values.
- Baseline slide-in: wrap each line in an `overflow:hidden` span and tween the inner `yPercent: 100 → 0`, so the text appears to rise out of its own baseline.
- Strike-through: use an absolutely positioned div with `scaleX 0→1` and `transformOrigin: left`. It is more deterministic than SVG `text-decoration`.

## Lessons from the sample build

- Probably the most polished per effort: 12-col grid draws in on transitions, baseline rises, red block behind 'pure', schematic reflow into input → frame → red output.
- Kept the snapshot in col 1 with the bar drawing in (instead of sliding the block) — reads cleaner.
- A deliberate ~1 s still hold at the end works in this style.
