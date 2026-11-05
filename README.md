# codebase-explainer-video — a Claude Code skill

Make narrated **codebase explainer videos for developers**: how a feature or data flow works end to end (UI → endpoint → tables written → who owns which code), with Gemini TTS narration, burned-in subtitles and frame-exact rendering. No video framework: HTML + Web Animations / GSAP → Playwright → ffmpeg.

## Styles
- **House style** (default): a ByteMonk-inspired system-design look — near-black stage with soft colour washes, a hue per actor (glass cards, line icons), thin arrowed links that light up as gradients, packets that draw their own line, real UI screenshots with ring callouts, Mac-window code cards, transaction cards, Poppins headlines.
- **13 alternatives** in [`styles/`](styles/README.md): Swimlane Sheet, Live Diff, Proof, Code Report, Zürich Schematic, Sticker Brutal, Front Page Graphic, Bento Keynote, Patent Drawing, Engineering Whiteboard, Phosphor Terminal, Comic Panel, Engineer's Desk. Each has a spec; 12 have a 9.8 s working sample on the same narrated beat. These are built **narration-first**: voice → word timings → every reveal cued to its spoken word.

## Install
```bash
git clone <this repo> ~/.claude/skills/codebase-explainer-video
```
Then ask Claude Code for "a codebase explainer video of <flow>", optionally naming a style.

## Requirements
- Node 18+, `ffmpeg`/`ffprobe`, Playwright (`npm i -D playwright && npx playwright install chromium`)
- `GEMINI_API_KEY` in env or a gitignored `.env` / `.env.local` (narration)
- For styled videos: `npx hyperframes transcribe` (word timings; Parakeet/Whisper run locally)

## Layout
- `SKILL.md` — the workflow Claude follows
- `scripts/` — `engine.js`/`engine.css` (house style), `render.mjs`, `tts.mjs`, `words.mjs`, `capture.mjs`, `join.mjs`
- `examples/orders.*` — neutral house-style sample covering every element
- `styles/` — alternative styles, `cues.js` runtime, samples and `preview.mjs`
- `assets/` — CC0 sound effects by Kenney (kenney.nl)

## Notes
Style names credit their inspirations (ByteMonk, ByteByteGo, Fireship, 3Blue1Brown, MinutePhysics, NYT/The Pudding, Apple/Linear, …); this project is not affiliated with any of them and ships none of their material. Fonts load from Google Fonts; GSAP and Rough.js load from jsDelivr.

MIT licensed.
