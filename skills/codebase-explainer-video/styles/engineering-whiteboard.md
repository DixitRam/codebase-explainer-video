# Style: Engineering Whiteboard ("MinutePhysics / Practical Engineering")

Reference clip: `examples/engineering-whiteboard.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs engineering-whiteboard`.

**Pitch:** A senior engineer explains it at the whiteboard: marker lines draw themselves, gently boiling, one red accent.
**Refs (opened):** https://video.golpoai.com/guide/popular-explainer-video-styles-golpo (RSA Animate / MinutePhysics / Practical Engineering traits) · https://github.com/rough-stuff/rough/wiki (Rough.js `seed`, `roughness`, `bowing`, hachure fills) · https://gsap.com/docs/v3/Eases/SteppedEase

**Why it fits:** Box-and-arrow is how devs already explain systems in real life; "draw it as I say it" maps 1:1 to narration. Credible because it is economical: black line, lots of white space, one accent. **Weak at:** dense code (more than ~6 lines looks pasted on), real UI screenshots (need a taped-on "photo" treatment).

**Visual spec**
- Palette: board `#F4F2EC`, ink `#1E2226`, marker blue `#2F5DA8`, accent red `#D6452F`, highlighter `#FFE66D` @ 55% multiply, ghost-erase `#E3E0D8`.
- Fonts: display **Permanent Marker**; body **Kalam** 400/700; mono **JetBrains Mono** (code written "neatly" in blue).
- Texture: 3% feTurbulence speckle + faint smudge ellipses (old erasures). No grid.
- Code: 3–5 lines, hand-boxed with a rough rectangle, key token gets highlighter swipe.
- Flow: rough arrows (bowing 1.5) with a hand-drawn arrowhead stroke drawn last; dashed blue for data paths.

**Motion grammar:** Everything enters by **stroke-draw** (dashoffset), at marker speed (~900 px/s), never by fade. Emphasis = circle-it, underline-twice, or highlighter. Transitions = camera pan across one infinite board, or an eraser wipe. Lines "boil" at 8 fps throughout. Avoid: bouncy eases, drop shadows, hands/markers on screen (cheap stock look).

**Storyboard**
1. **Now 0.00** — "BIGGEST CHANGE" written in Permanent Marker; **change. 1.04** red double-underline.
2. **Build 1.84** — pan right; a box draws, `buildConfig()` written inside; **pure 3.52** red label "PURE" + circle snaps around box.
3. **snapshot 4.80** — a small doc-icon labelled `snapshot` sketches left; **goes in 5.44** arrow draws into box.
4. **config 6.24** — arrow draws out (**comes out 6.72**) to a `config {…}` card with highlighter on `{`.
5. **No 7.44 database** — a drum (DB) cylinder draws below, red X slashes it at 7.68; **No history 8.40** — clock icon, red X at 8.56.

**Build notes**
- *Deterministic boil:* pre-generate 3 Rough.js variants per shape (`seed: base+0..2`), stack them, show one by `Math.floor(t*8)%3`. Never call Rough.js per frame.
- *Draw-on for Rough paths:* Rough emits several sub-paths per shape; tween each `strokeDashoffset` sequentially in one GSAP sub-timeline (getTotalLength once at build).
- *Handwriting:* fonts can't stroke-draw; reveal text with a left→right `clip-path: inset()` driven by `steps(n)` per glyph count, slight per-letter rotate jitter seeded.

## Lessons from the sample build

- Strong. Every Rough.js stroke draws on; lines boil at 8 fps by cycling 3 seeded variants; handwriting revealed in glyph steps.
- Generate Rough.js shapes ONCE with fixed seeds; never per frame.
- The red 'circle it' crossed the in/out arrows — circle before arrows draw, or size it inside them.
