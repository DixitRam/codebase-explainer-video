# Style: Bento Keynote (light product-launch film)

Reference clip: `examples/bento-keynote.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs bento-keynote`.

**Pitch:** An Apple/Linear-style keynote on a light canvas. The beat lives in a bento grid of rounded tiles, and a virtual camera flies tile to tile. Each tile has one idea and one big number or word.
Refs opened: https://getlago.com/blog/we-killed-our-motion-design-job · https://studiomeyer.io/en/blog/bento-grid-layouts

**Why it suits explainers:** A codebase explanation is naturally a set of facts: input, function, output, no DB, no history. Bento tiles give each fact a sized compartment (hero 2×2, facts 1×1), the hierarchy the bento guides recommend. Lago documents rebuilding Linear's film language in code with motion tokens, "one motion at a time", "the camera handles every transition", and "no intro card". It feels like a premium product, which helps when the video goes to non-dev stakeholders. Weak at: showing sequential flow across many hops, because tiles fragment the path.

**Visual spec:**
- Palette: canvas `#F5F5F7`, tile `#FFFFFF`, ink `#1D1D1F`, secondary `#86868B`, accent indigo `#5E5CE6`, success `#30D158`, stop `#FF453A`.
- Fonts: display **Inter Tight** 700 (−0.03em), body **Inter** 400, mono **Geist Mono**.
- Tiles: radius 28px, gap 20px, a 1px `#E5E5EA` border, and a soft shadow `0 1px 2px #0000000F, 0 12px 32px #0000000A`.
- Code: a tile containing an editor-like card with light theme syntax and a single highlighted token.
- Flow: a short indigo connector between adjacent tiles with an animated gradient pulse, or the camera move itself acts as the arrow.

**Motion grammar:**
- Tiles rise 24px plus fade with a spring-like `expo.out` (0.6 s), staggered 0.08 s.
- The camera is a parent-transform tween (`scale` and `x/y`) with `power3.inOut`, 0.8 s. Every transition is a camera move, with no cuts.
- Emphasis: a number or word counts or scales up inside its tile, and the tile gets a 2px indigo ring.
- Avoid: overlapping motions, cards floating with no grid, and dark mode, which would collide with the house style.

**Storyboard:**
1. **Now 0.00 → change 1.04:** The camera is tight on a single hero tile reading "The biggest change." On **change** the camera pulls back to reveal a 4×2 bento of empty skeleton tiles.
2. **Build 1.84 → function 3.84:** The camera glides to the 2×2 hero. `buildConfig()` sets in big type. On **pure 3.52** a pill "PURE" pops in indigo; on **function 3.84** a code card fades in beneath.
3. **snapshot 4.80 → out 7.04:** The camera pans to a 2×1 tile showing `snapshot →` ƒ `→ config`. The snapshot chip slides in on **in 5.68**, the config chip emerges on **out 7.04**, and the indigo pulse runs through the connector.
4. **No 7.44 → history 8.56:** The camera settles on two 1×1 tiles: a database glyph with a red "0 writes" on **database 7.68**, and a clock glyph with a red "0 rows" on **history 8.56**. The camera pulls back to the full bento as the beat ends.

**Build notes:**
- Virtual camera: put the whole bento inside `#world` and tween `#world` with `transform: translate() scale()`. Compute targets from each tile's grid rect (`target = -rect.center*scale + viewport.center`) once at build time, so seeking stays pure.
- Crisp text under scale: author at 2× size inside the world and keep the camera scale ≤ 1. Otherwise use `will-change: transform` and accept a rasterised blur during motion.
- Soft shadows at 60fps: frame-by-frame rendering means cost is irrelevant to playback, but stacked box-shadows on 8 tiles slow screenshot time. Pre-render one shadow PNG, or use `filter: none` and keep two shadow layers at most.

## Lessons from the sample build

- Reads premium; camera hero → skeleton bento → hero → flow tile → fact tiles → full bento.
- Zooming past 1× stayed sharp in stills, but author at 2× if text softens.
- A 2×2 hero nearly fills the frame height, so neighbours peek in the hero shot — size the hero tile to ~70% height. Weak for multi-hop flows.
