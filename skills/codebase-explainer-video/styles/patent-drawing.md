# Style: Patent Drawing ("FIG. 1")

Reference clip: `examples/patent-drawing.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs patent-drawing`.

**Pitch:** The architecture filed as a patent: black hairline on cream, reference numerals, leader lines, "FIG. 2" captions, cross-hatching.
**Refs (opened):** https://ibm.com/design/language/illustration/line-style/usage (search excerpt: line-style suits precise diagrams; animate via stroke + position/rotation/scale, sparse camera) · https://video.golpoai.com/guide/popular-explainer-video-styles-golpo (orthographic views, dimension lines, magnified detail inserts)

**Why it fits:** Patents describe *mechanisms* in numbered parts — exactly what "who owns what" explainers do. Reference numerals (`102 snapshot`, `104 buildConfig`) let narration point at things without colour. Reads as serious and a little witty. **Weak at:** emotion/energy; colour-coding many lanes (it's monochrome by rule); screenshots must be redrawn as line art or shown as halftone "exhibits".

**Visual spec**
- Palette: paper `#F3EEDF`, ink `#141414`, hatch `#141414` @ 0.6, single annotation colour (sparingly, as if pencilled by an examiner) `#B3261E`.
- Fonts: display **Libre Caslon Text** (sheet header "U.S. Patent · Oct. 16, 2026 · Sheet 3 of 7"); labels **Courier Prime**; mono **IBM Plex Mono** for the claim text.
- Texture: paper fibre (feTurbulence 0.9 freq, 2% alpha), sheet border, page-numbering header.
- Code: shown as a **"Claim"** paragraph: *"1. A method comprising: receiving a snapshot (102); producing a configuration (106) …"*, with the real signature in Plex Mono beneath.
- Flow: 0.75 px solid lines, arrowheads as filled 30° triangles; leader lines with small curve ending at numeral; dashed lines for "optional" paths; exploded-view dotted axes.

**Motion grammar:** Line draw-on at constant linear speed (ruler-straight, no ease on the draw). Numerals type in (Courier, steps). Emphasis = a hatch fill sweeps into a part, or a dashed **detail circle** + magnified inset ("FIG. 2A"). Transitions = sheet change (hard cut with sheet number ticking) or zoom into a detail circle. Pacing calm, ~1 element per word-group. Avoid: wobble/boil, gradients, any colour beyond the one red.

**Storyboard**
1. **Now 0.00** — sheet header types; **biggest change 0.56–1.04** title "FIG. 1 — CONFIGURATION SYSTEM (PRIOR ART vs. PRESENT)".
2. **Build config 1.84–2.40** — rectangle `104` draws, leader line to label "BUILD CONFIG"; **pure function 3.52–3.84** hatch fills its border, claim text "…wherein said function is pure" types.
3. **snapshot 4.80** — part `102` (stacked sheets icon) draws; **goes in 5.44** arrow 108 into 104.
4. **config 6.24 comes out 7.04** — part `106` draws out the other side; exploded dotted axis separates its fields.
5. **No database 7.44–7.68** — dashed outline of a DB (`110`) appears, labelled "OMITTED"; **No history 8.40–8.56** — dashed `112` clock, both struck with examiner red.

**Build notes**
- *Hatching that respects shape:* SVG `<pattern>` of 45° lines, `patternUnits=userSpaceOnUse`, reveal via an animated `<clipPath>` rect so hatch "sweeps" in.
- *Leader lines that hit the part:* compute a quadratic from label anchor to nearest point on part (`getPointAtLength` scan once at build), then draw-on.
- *Constant-speed draws:* duration = length / 1200 px·s⁻¹, `ease:"none"` — the mechanical evenness is what sells "drafted, not drawn".

## Lessons from the sample build

- Most distinctive. Constant-speed hairline draws (1200 px/s, ease none), Courier numerals typed with leaders, hatch sweep on 'pure', Claim paragraph built per phrase.
- Paper texture at 2–5% alpha barely shows — use ~6–8% if you want it seen.
- No detail-circle inset was built; add 'FIG. 2A' zooms for emphasis in full videos. Added a closing red underline + 'allowed' so the last second isn't frozen.
