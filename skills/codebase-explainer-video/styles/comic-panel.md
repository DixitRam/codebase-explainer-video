# Style: Comic Panel / Ben-Day ("Tech Comic")

Reference clip: `examples/comic-panel.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs comic-panel`.

**Pitch:** Each beat is a comic panel: thick ink borders, Ben-Day dot shading, caption boxes, a SFX word for the payoff ("PURE!"), panels slide in on a page grid.
**Refs (opened):** https://leanrada.com/notes/pure-css-halftone/ (radial-gradient dots + `blur()+contrast(999)` threshold) · search notes on uniform Ben-Day dots vs variable halftone and CMYK angle offsets (css-irl.info, frontendmasters).

**Why it fits:** Panels give a natural storyboard rhythm — one idea per panel — and caption boxes carry the technical sentence while the art carries the metaphor. Credible if styled like a *Google Chrome comic* (Scott McCloud, 2008) or a manga-ish engineering zine: no mascots mugging, objects as characters. **Weak at:** long code, continuous flows across many nodes (panels chop space). Keep characters out; the "hero" is the function box.

**Visual spec**
- Palette: paper `#FBF6E9`, ink `#111111`, process cyan `#00A3E0`, magenta `#E5007E`, yellow `#FFD400`, misregistered at 1–2 px.
- Fonts: SFX **Bangers**; captions **Comic Neue** 700 (all caps, reads technical not childish); mono **Space Mono** for code balloons.
- Texture: Ben-Day dots (uniform radial-gradient, 6–9 px pitch, rotated 15°/75°) in fills; paper grain; 6 px panel borders with 18 px gutters.
- Code: inside a rectangular "speech balloon" whose tail points at the function box.
- Flow: speed lines and big chunky arrows with ink outline + dot fill; motion streaks behind moving objects.

**Motion grammar:** Panels **slam** in (scale 1.06→1 in 3 frames, 1-frame overshoot), held still; inside panels motion runs at **12 fps** (steps) to feel drawn-on-twos. Emphasis = SFX word pops with rotation −8°, or radial speed-lines burst. Transitions = page turn or camera slides to next panel on the grid. Avoid: emoji-faced devices, cartoon bounce on everything, more than one SFX per beat.

**Storyboard**
1. **Now 0.00** — 3-panel page grid draws borders; caption box "MEANWHILE, IN BUILD-CONFIG…"; **change. 1.04** SFX "BIG CHANGE!".
2. **Build 1.84** — panel 1: function box in hero three-quarter view, dot-shaded; **pure 3.52** SFX "PURE!" bursts with speed lines.
3. **snapshot 4.80** — panel 2: snapshot card flies in with streaks; **in 5.68** swallowed by box.
4. **config 6.24 comes out 7.04** — panel 3: config card shoots out, code balloon `{…}`.
5. **No database 7.44** — inset panels: DB cylinder greyed in dots with "✕"; **No history 8.40** — clock inset, same; camera pulls back to full page.

**Build notes**
- *Ben-Day fills without raster:* SVG `<pattern>` circle, `patternTransform="rotate(15)"`, used as `fill="url(#dots)"`; second pattern offset 2 px in magenta for misregistration.
- *On-twos inside, 60 fps outside:* tween with `ease:"steps(N)"` where N = duration×12 for panel content; camera/panel moves stay smooth.
- *Panel clipping:* each panel is `overflow:hidden` with ink border drawn as a separate SVG stroke on top so art can "break the panel" deliberately for the SFX.

## Lessons from the sample build

- Good; panel borders draw, panels slam in 3 frames, inside motion on twos, one SFX per beat breaking the panel, camera push per panel then pull back.
- Chrome's rasteriser HUNG on SVG <pattern> Ben-Day fills — pre-draw dots to a canvas image and clip it to each shape.
- A panel empties after its object is swallowed — give each panel a resting state. Strict no-mascots rule to stay credible.
