# Style: PROOF: a function as a mapping

Reference clip: `examples/proof.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs proof`.

**Pitch:** A 3Blue1Brown-style chalkless proof. The idea is written as math (`f : Snapshot → Config`), and glyphs physically morph into one another.

**Refs:** https://raw.githubusercontent.com/3b1b/manim/master/manimlib/default_config.yml · https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/creative/creative-manim-video

**Why it suits us:** "Pure function", "no side effects" and "input → output" are mathematical claims, and manim's grammar makes them feel *proven* rather than just asserted. It is also the calmest style for dense concepts.
**Weak at:** UI screenshots, and anything with more than about 5 entities. It is slow, so it costs runtime.

**Visual spec**
- Background is flat `#1C1C1C` with no grid and no glow. This is the main difference from the house style: dark, but purely typographic.
- Semantic palette from manim (one meaning per colour):
  - blue `#58C4DD` = input
  - green `#83C167` = output
  - gold `#F0AC5F` = the function
  - red `#FC6255` = forbidden or side effect
  - grey `#888888` / `#444444` = context
- Opacity layers: focus 1.0, context 0.4, scaffolding 0.15.
- Fonts: display **Computer Modern** is unavailable on Google Fonts, so use **Libre Baskerville italic** for math variables and **Inter** for labels. Mono is **JetBrains Mono**. manim's own default is Consolas.
- Code appears as a *signature only*: `buildConfig(snapshot) → config`. It is typeset as an equation, never as a code card.
- Flow is a single curved `\mapsto` arrow, drawn stroke-on. Sets are drawn as soft ellipses (domain on the left, codomain on the right), with dots as elements.

**Motion grammar**
- *Write* entrances (stroke-dashoffset, then fill fades in).
- *TransformMatching*: shared glyphs fly to their new positions and the rest cross-fade. This is the signature move.
- Emphasis is a yellow `#FFFF00` surround-rectangle that draws, holds, then undraws. Exits are fade-outs, then a clean frame.
- Pacing: about 1.5 s per transform, with a hold after every move. Nothing overlaps unless it is shared.
- Avoid: camera shake, hard cuts, more than 3 colours on screen at once, and writing new text over old text.

**Storyboard**
1. **Now 0.00 / biggest 0.56:** "the biggest change" writes on in Inter, at 40% grey except "change", which is in gold.
2. **Build 1.84 → function 3.84:** "change" TransformMatches into `buildConfig`. "pure function" writes below it, and a yellow box draws around "pure" at 3.52.
3. **snapshot 4.80 / config 6.24 / out 7.04:** the text collapses into `f : S → C`. A blue ellipse "Snapshot" appears on the left and a green "Config" ellipse on the right. At "goes in" (5.44) a blue dot slides into `f`, and at "comes out" (6.72) a green dot emerges from it.
4. **No database 7.44 / No history 8.40:** red ghost terms appear as an extra input (`DB`) and as a self-loop (`t−1`) on `f`, then each gets a red strike and fades to 0.15. Only `f : S → C` remains at full opacity.

**Build notes**
- *TransformMatching in HTML:* render each glyph as an absolutely positioned `<span>` with a stable key (the letters of `config` are shared). Before the move, measure both layouts with `getBoundingClientRect`, then tween x/y/scale per key. Unmatched glyphs cross-fade. Precompute the layouts on frame 0 so the timeline stays seekable.
- *Math type:* use KaTeX (cdnjs) rendered to static HTML at build time, then split the result into keyed spans. Do not re-render per frame.
- *Write effect on text:* convert the text to SVG paths with opentype.js once, then animate `stroke-dashoffset` followed by `fill-opacity`.

## Lessons from the sample build

- Manim look works: stroke-then-fill glyphs, change → buildConfig → f : S → C, ellipse sets with a dot in/out.
- Narration is faster than manim pacing: transforms ran ~0.8 s, not 1.5 s. Budget more script time per concept if you use this style.
- Frame near-empty while the first word writes — give the opening one held visual. Glyph 'morph' is a cross-fade of matched glyphs, not true outline morph.
