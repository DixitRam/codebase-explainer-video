# Style: Sticker Brutal (neo-brutalist kinetic)

Reference clip: `examples/sticker-brutal.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs sticker-brutal`.

**Pitch:** A neo-brutalist UI come to life. Flat loud colour, 4px black outlines, hard unblurred offset shadows, chunky type, and graphics animated "on twos" at 12fps for a handmade stutter.
Refs opened: https://rometheme.net/blog/uncategorized/neubrutalism-in-design/ · https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/

**Why it suits explainers:** Its visual vocabulary is already UI (cards, buttons, window title bars, per Rometheme), so endpoints, tables and functions become tactile objects that stack, slam and get stamped. The stutter (PremiumBeat's Vox technique: 12fps graphics in a 24/30fps edit) gives simple shapes personality at zero illustration cost. It is the most energetic, Gen-Z style and good for team-internal "big change" videos. Weak at: long, nuanced segments, where it gets tiring, and at subtle hierarchy, because everything is loud.

**Visual spec:**
- Palette: canvas `#FFF4D6`, ink `#000000`, yellow `#FFD23F`, pink `#FF6B9A`, blue `#4D96FF`, green `#3DDC97`, red `#FF4B3E`. Colours are slightly desaturated, per Rometheme's ≤80% saturation rule, with pure black outlines.
- Fonts: display **Archivo Black** (or **Space Grotesk** 700), body **Space Grotesk** 500, mono **Space Mono** 700.
- Cards: 4px black border, radius 12px, and a hard shadow `8px 8px 0 #000`.
- Background: flat canvas with an optional 40px dot grid in `#0000001A`.
- Code: a card with a fake title bar (three black-outlined circles) holding a bold mono code block. Highlights are flat yellow blocks behind tokens.
- Flow: thick 6px black arrows with chunky triangular heads, drawn in 3–4 stepped segments.

**Motion grammar:**
- Entrances slam in from off-frame with overshoot (`back.out(2.5)`). The shadow starts at `0 0` and pops to `8px 8px` on landing, so the card "lifts".
- Emphasis: a rubber-stamp rotate-in (−8°, scale 1.4→1) and a wiggle.
- Transitions: a full-frame colour panel wipes across, edges hard.
- Quantise all graphic motion to 12fps.
- Pacing: punchy, an action on almost every stressed word.
- Avoid: blur, gradients, glass, and soft shadows. They break the style instantly.

**Storyboard:**
1. **Now 0.00 → change 1.04:** "BIGGEST" slams in on a yellow card at 0.56. "CHANGE" lands as a pink sticker rotated −4° on 1.04, with a camera jolt of 6px.
2. **Build 1.84 → function 3.84:** A blue panel wipes in. A code card drops in with `buildConfig()` big. A yellow block slides behind `pure` on **pure 3.52**, and a green "PURE ƒ" stamp hits on **function 3.84**.
3. **snapshot 4.80 → in 5.68:** A small card "snapshot" slides from the left. A stepped arrow draws, and the card is sucked into the function card (scale 0) on **in 5.68**.
4. **config 6.24 → out 7.04:** A "config" card pops out the right with overshoot on **out 7.04**.
5. **No 7.44 → history 8.56:** Two outlined cards "DATABASE" and "HISTORY" drop. A red "NO" stamp hits each one: 7.44/7.68 on database, 8.40/8.56 on history.

**Build notes:**
- 12fps stutter, deterministic: in the frame driver, seek the graphics timeline to `Math.floor(t*12)/12` while captions and audio use true `t`. This is one line, and it applies to everything inside the graphics root.
- Shadow pop: tween a CSS var `--sh` (0→8px) used by `box-shadow: var(--sh) var(--sh) 0 #000`. Register it with `@property` so GSAP interpolates it, or tween a pseudo-element's `translate` instead.
- Stepped arrows: build each arrow as an SVG path with N segments and reveal one segment per 12fps step with `strokeDashoffset` keyframes. Snap the arrowhead in on the final step.

## Lessons from the sample build

- Lively and on-style; 12 fps 'on twos' via a second timeline seeked to floor(t*12)/12; shadow pops on landing; small camera jolts on stamps.
- Don't 'suck' a card into another if an arrow is attached — the tail floats; nudge it instead.
- Arrows as 3-step dash reveals were sufficient. Tires fast: use for short announcements.
