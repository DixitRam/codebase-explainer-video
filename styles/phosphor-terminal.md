# Style: Phosphor Terminal ("VT-320 / ASCII Architecture")

Reference clip: `examples/phosphor-terminal.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs phosphor-terminal`.

**Pitch:** The whole video lives inside a curved green-phosphor CRT; diagrams are box-drawing characters, arrows are `──▶`, the camera is the cursor.
**Refs (opened):** https://www.web-developpeur.com/en/blog/retro-consoles-css-scanlines-dark-theme (2 px scanline repeating-gradient, 0.08 opacity tuned) · https://gsap.com/docs/v3/Eases/SteppedEase · VT323 described as built from DEC VT320 glyphs adjusted for CRT horizontal smear (Google Fonts specimen, via search).

**Why it fits:** Native developer vernacular; ASCII diagrams are what people paste in READMEs and PRs, so the diagram *is* plausible documentation. Monospace grid makes layout trivially deterministic. **Weak at:** screenshots (show them dithered to 2-tone phosphor), long sentences (low resolution), anything needing more than 2 colours. Differs from the desk's terminal prop: here the CRT is the *world*, with curvature, bloom and a rolling refresh bar.

**Visual spec**
- Palette: tube black `#0A0F0A`, phosphor `#33FF66`, dim `#1A7F33`, bloom `#33FF66` @ 35%, amber alt-theme `#FFB000` (use for "NO" lines only).
- Fonts: display **VT323** at 96–160 px; body **VT323**; mono **IBM Plex Mono** for the rare crisp code inset (looks like a "high-res mode" overlay — optional).
- Texture: scanlines (2 px, 0.08–0.12), vignette radial-gradient, barrel curvature via SVG `feDisplacementMap` using a pre-baked radial map, faint ghost of previous frame (persistence).
- Code: typed at a prompt `$ cat build-config.ts`, cursor block blinking at 2 Hz.
- Flow: box-drawing `┌─┐│└─┘`, arrows `──▶`, data travelling as an inverted-video character `█` along the line, one cell per step.

**Motion grammar:** Everything is **character-grid quantised**: typing at 40–60 cps, boxes "print" row by row, moves happen in whole cells with `steps()`. Emphasis = inverse video (black on green) or blink ×2. Transitions = `clear` (screen flashes 1 frame then empties) or rolling refresh bar. Avoid: smooth sub-cell motion, more than one glitch per beat (RGB tear gets tacky fast), cyberpunk neon.

**Storyboard**
1. **Now 0.00** — prompt `> CHANGELOG --biggest`; **change. 1.04** banner `*** BIGGEST CHANGE ***` prints in large VT323, inverse flash.
2. **Build 1.84** — `clear`; box `┌ buildConfig() ┐` prints row by row; **pure 3.52** tag `[PURE]` inverse-video beside it.
3. **snapshot 4.80** — box `snapshot` prints left; **goes in 5.44** `█` steps along `──▶` into function.
4. **config 6.24 / comes out 6.72** — `█` exits right into `config.json` box, which prints `{ … }`.
5. **No database 7.44** — amber line `DB ......... NOT FOUND`; **No history 8.40** — `HISTORY .... NOT FOUND`, cursor blinks.

**Build notes**
- *Curvature + bloom deterministically:* render content in a 1920×1080 div, apply one SVG filter chain: `feGaussianBlur` (bloom) merged over source, then `feDisplacementMap` with a static radial-gradient map image (data-URI) for barrel. Static map = no per-frame noise.
- *Typing seekable:* store full string; set `textContent = s.slice(0, n)` from a GSAP proxy tween `{n}` with `steps(len)`; no setInterval.
- *Phosphor persistence:* duplicate the text layer, delay it 1/24 s in the timeline at 25% opacity — fake decay without a canvas feedback loop.

## Lessons from the sample build

- Strong. Built as a real 80×20 character framebuffer computed from t on each seek, so everything snaps to whole cells.
- Bloom via text-shadow was enough (no feGaussianBlur chain); barrel curvature via a static SVG displacement map.
- Keep cursor blink / refresh bar alive in holds so the end frame isn't frozen.
