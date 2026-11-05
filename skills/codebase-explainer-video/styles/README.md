# Styles

The house style (dark map, real-UI screenshots, transaction cards; `scripts/engine.*`) is the default. These 13 are alternative looks. Each has a spec (`<id>.md`: palette, fonts, how code and flow appear, motion grammar, a storyboard, build notes, and lessons from building its sample); 12 have a working 9.8 s sample (`examples/<id>.html`) — Engineer's Desk is spec-only. The 12 short samples play the same narrated beat ("Build config is a pure function… No database. No history."), so they compare like for like.

| id | Style | Inspired by | Use it for | Weak at |
|---|---|---|---|---|
| `swimlane-sheet` | Swimlane Sheet | ByteByteGo, Josh Comeau | UI → API → DB → code flows; numbered steps the narration can name | Drama, title moments |
| `live-diff` | Live Diff | Motion Canvas, Shiki Magic Move | Showing the real code change; "removing this import IS the point" | Cross-system flows (pair with Swimlane) |
| `proof` | Proof | 3Blue1Brown / manim | One concept beat: pure function, input → output, invariants | Anything with > 5 entities; slow |
| `code-report` | Code Report | Fireship | Intros, recaps, "what changed" bursts | Long nuanced flows; tiring |
| `zurich-schematic` | Zürich Schematic | Swiss typographic posters | Clean input → function → output; cheapest to build | Warmth, screenshot-heavy parts |
| `sticker-brutal` | Sticker Brutal | Neo-brutalism | Short team announcements, high energy | Subtle hierarchy; tires over 3 min |
| `front-page-graphic` | Front Page Graphic | NYT, The Pudding | Long architecture walkthroughs; one diagram, one change per sentence | Hype beats |
| `bento-keynote` | Bento Keynote | Apple, Linear launch films | Audiences beyond devs (managers, other teams) | Multi-hop flows |
| `patent-drawing` | Patent Drawing | Patent filings | "Mechanism with numbered parts" explainers; distinctive | Energy, colour-coded lanes |
| `engineering-whiteboard` | Engineering Whiteboard | MinutePhysics, Practical Engineering | How engineers explain in person: boxes + arrows drawn as spoken | Dense code |
| `phosphor-terminal` | Phosphor Terminal | Green CRT, ASCII diagrams | Short dev-vernacular beats, CLI/infra topics | Screenshots, long sentences |
| `comic-panel` | Comic Panel | Comic books (Ben-Day) | "Big change" moments, one idea per panel | Long code; risks looking juvenile |
| `engineers-desk` | Engineer's Desk (mixed media) | Tactile collage: printouts, index cards, sticky notes | Handovers and proposals: today's code on paper vs proposed cards, a real product photo | Long code, UI screenshots |

Good base styles for a whole video: Swimlane Sheet, Front Page Graphic, Engineering Whiteboard, Live Diff. Good as single-beat inserts: Proof, Code Report, Comic Panel.

## Choosing
Ask the human which style (show this table; offer `node <skill>/styles/preview.mjs <id>` to render a sample). Default to the house style when they don't care. One style per video; an insert style may take at most one chapter.

## Building a styled video (narration-first)
The house style places scenes on a planned timeline and stretches them to the voice afterwards. Styled videos do the opposite, so every reveal lands on its spoken word:

1. Write `<name>.json` as usual (`lines` with rough cue times; `sfx`/`music` optional).
2. Voice only: `VOICE_ONLY=1 VIDEO=<name> node tts.mjs <Voice>` → line wavs + `<name>.timing.json` (real line starts, total `end`).
3. Word timings: `VIDEO=<name> node words.mjs` → `<name>.words.json` (script wording, transcribed timing; it warns when a word can't be matched).
4. Author `<name>.html` in the chosen style: load GSAP, then `styles/cues.js` (copy it next to the page), then your script. Put every animation on `CUES.tl` at `CUES.cue(line, 'word', nth)`; build captions with `CUES.captions(el)` (style `.cap-group` / `.cap-word`, `--on` goes 0→1 as each word is spoken); call `CUES.done()` last. Read the style's `<id>.md` and its example first — copy its CSS tokens and motion helpers rather than re-inventing them.
5. Check stills: `VIDEO=<name> node render.mjs 3 12 25 …` (look at them), then render + mix: `REUSE=1 VIDEO=<name> node tts.mjs <Voice>` (reuses the wavs, no API calls).

Rules that every style shares: nothing appears before its word; never front-load then freeze; deterministic only (no `Math.random`, `Date.now`, CSS transitions/keyframes, `setInterval`); keep content above y = 896 (captions); a seek function must return nothing (returning the GSAP timeline hangs Playwright). For 12 fps / 8 fps looks, build those graphics on a second paused timeline and seek it to `Math.floor(t*12)/12` inside `window.seek` after `CUES.done()`.

## Files
- `<id>.md` — the style spec + lessons. `examples/<id>.html` — sample clip (uses `../lab.js`, the 9.8 s demo harness with the same API shape as `cues.js` minus the line argument).
- `cues.js` — runtime for full styled videos. `lab.js` + `beat.wav` + `preview.mjs` — render a sample: `node <skill>/styles/preview.mjs <id> [stills…]` (from a folder with Playwright; writes `<id>.mp4` or `<id>-<t>.png` in the cwd).
