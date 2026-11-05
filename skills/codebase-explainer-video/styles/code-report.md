# Style: CODE REPORT: hundred-second punch

Reference clip: `examples/code-report.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs code-report`.

**Pitch:** A Fireship-inspired newsroom pace. The editor *is* the stage, with crash-zooms onto tokens, sticker labels and a sound hit on every claim.

**Refs:** https://skills.sh/jarmen423/skills/fireship-video-style · https://betterstack.com/community/comparisons/best-youtube-channels-for-developers/

**Why it suits us:** Developers will sit through a 3-minute architecture video if every 2 seconds something lands. It reads code as code (real files, real line numbers). The skills.sh guide's point that "fast because they ARE fast" is a *writing* constraint: one fact per shot.
**Weak at:** Nuanced multi-step flows. It gets tiring after about 2 minutes, and it makes topics look jokier than they are.

**Visual spec**
- The stage is a full-bleed editor at `#0D1117`, with an offset frame `#161B22` and 0 px chrome. It is never a floating card.
- Accent palette:
  - highlighter yellow `#FFD43B`
  - hot orange `#FF6B1A` (callouts)
  - mint `#3DDC97` ("yes")
  - red `#FF4D4D` ("no")
- Stickers are white `#FFFFFF` with a 6 px black stroke and a −4° tilt.
- Fonts: display **Bebas Neue** is *not* Anton, which keeps it distinct from our title cards. Body is **Inter Tight 800**. Mono is **Fira Code**.
- Texture is a subtle 2% noise and a CRT-free vignette.
- Code shows real lines with a syntax theme. Emphasis is a yellow marker swipe *behind* the token (a skewed rect, `mix-blend-mode: multiply` on a light token, or a 30% fill on dark).
- Flow uses no diagrams. A thick hand-ish arrow sticker *slaps* on and points at a token.

**Motion grammar**
- Hard cuts only, with each shot 0.6–1.5 s.
- Crash zoom: scale 1 → 2.4 in 6 frames with `expo.out`, plus 2 frames of motion blur (a CSS `filter: blur` on the outgoing state).
- Sticker slap: scale 1.4 → 1, rotation −10 → −4, settling with `back.out(3)`.
- Text pops in word by word on the narration timestamps.
- Sound cues: whoosh on zooms, a "thock" on stickers, a record-scratch or buzzer on "No".
- Avoid: memes or stock GIFs (not allowed, and they date badly), more than one sticker at a time, and slow fades.

**Storyboard**
1. **Now 0.00 → change 1.04:** black frame. "BIGGEST CHANGE" in Bebas punches in at 0.56, then shakes once at 1.04.
2. **Build 1.84 → function 3.84:** hard cut to the editor showing `export function buildConfig(`. Crash-zoom to `buildConfig` at 2.40. At 3.52 a yellow marker swipes under "pure" in an inline comment, and a "PURE" sticker slaps on at 3.84.
3. **snapshot 4.80 → out 7.04:** split screen. The left half is the `snapshot` param, which highlights at 4.80, and a "IN" sticker lands at 5.68. The right half is the `return config`, highlighted at 6.24, and an "OUT" sticker lands at 7.04.
4. **No database 7.44:** cut to a full-frame `grep "db\." → 0 results` terminal line and a red "NO DB" sticker, with a buzzer sound.
5. **No history 8.40:** the same treatment with `grep "prev\|history" → 0 results`, then a smash cut to black.

**Build notes**
- *Crash zoom on a token while staying seekable:* compute the token's rect at build time, then tween `transform-origin` plus scale on a wrapper. Do not use CSS transitions.
- *Motion blur:* render 2–3 ghost copies of the frame layer at decreasing opacity with offset transforms during the 6-frame zoom. It is cheap and deterministic.
- *SFX:* not visual, but cue SFX from the same word-timestamp table and mix them in ffmpeg (`adelay` per hit) so sound stays frame-exact.

## Lessons from the sample build

- Strong and punchy: black cold open, GitHub-dark editor, crash zoom with yellow highlight, sticker, IN/OUT split, full-frame grep → 0 RESULTS.
- Bebas Neue has no ƒ glyph — sticker text must stay in its glyph set.
- No SFX in our mix, so the energy comes from cuts and stickers alone; add SFX via join/tts mix if you want the full feel. Motion blur was a 2-frame CSS blur.
