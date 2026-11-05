---
name: codebase-explainer-video
description: Make narrated codebase explainer videos for DEVELOPERS — how a feature/data flow works end to end (UI button → endpoint → tables written → config/code ownership), in a mixed style: ByteMonk-style animated system diagram + real UI screenshots with zoom/ring callouts + code cards with hand-drawn underlines + kinetic title cards, Gemini TTS narration, burned-in subtitles. Also 13 alternative looks (Swimlane Sheet, Live Diff, Front Page Graphic, Engineering Whiteboard, Proof, Code Report, Zürich Schematic, Sticker Brutal, Bento Keynote, Patent Drawing, Phosphor Terminal, Comic Panel, Engineer's Desk), built narration-first with visuals cued to spoken words. Framework-free pipeline (HTML + Web Animations API → Playwright frame-exact render → ffmpeg). Use when the user asks for a "codebase explainer video", "explain how X works in a video", "video of this flow for the team/new devs", "onboarding video of the code". NOT for client/end-user product demos (use app-walkthrough-video) or launch promos (use brag).
---

# Codebase explainer video

A 2–8 minute narrated video that teaches a developer how a part of the codebase really works. Every claim comes from the code, every screen is the real app, and every scene answers "which button → which endpoint → which table".

## The style

| Layer | Share | What it is |
|---|---|---|
| **Map** (motion graphics) | ~40% | ByteMonk look: near-black stage lit by soft colour washes (grid only faintly behind the centre); **every actor owns a hue** — glass cards tinted in it, a line icon, a mono pill subtitle; group containers with an uppercase chip; thin arrowed links that light up as a gradient between the two hues; a white-hot packet whose line draws in behind it, or a `stream` of small dots. One master map per video is fine (camera zooms in and returns), but also compose small dedicated scenes per idea, joined by `blurIn` / `whip` / `tiltIn`. |
| **Real UI** (screencast stills) | ~25% | Real screenshots of the running app in a window frame (our addition — ByteMonk uses none, but developers need to see the real control); the camera pans/zooms to the control, an orange **ring** pulses on it, a small **tag** says why it matters ("free items only", "fixed once saved"). |
| **Backend** (cards) | ~25% | "Transaction cards": endpoint + file, then one row per write in order (`TABLE.COLUMN ← value`), checks in orange. **Code cards**: a Mac-window card (traffic lights, file name in the title bar, `.lang` pill), 3–6 lines (real code, or clearly-annotated `COLUMN ← value` form); a glowing `hl` pill on the token that matters, plus the orange hand-drawn underline when it is our code. |
| **Kinetic type** | ~10% | Poppins 800 sentence case, one accent phrase in `<em>` ("Now it's *an order.*"); a dim mono kicker with wide tracking above it; optional grey `.takeaway` line under a diagram with one coloured `<b>` phrase. Frame 0 is the hook = the thumbnail. |

Palette (engine.css tokens): `cyan sky magenta violet lilac teal gold red`, one per actor, reused for its links, packets and numbers; set `--wash` per video. Pages load Poppins 600/800, Inter and JetBrains Mono. Two colour rules: **orange `ours` badge** for code the team owns; **grey hatched `.blackbox` "not maintained by us"** for vendor/legacy code (show only IN / READS / WRITES / limits, never internals).

**Other styles.** That is the house style and the default. `styles/` holds 13 alternatives — Swimlane Sheet, Live Diff, Proof, Code Report, Zürich Schematic, Sticker Brutal, Front Page Graphic, Bento Keynote, Patent Drawing, Engineering Whiteboard, Phosphor Terminal, Comic Panel, Engineer's Desk — each with a spec and a working reference. When the human hasn't said, show `styles/README.md`'s table and ask which style; offer to render samples. A styled video is built **narration-first** (voice → word timings → page cued to words → render), following `styles/README.md`; the house style keeps the workflow below.

Narration: a calm senior engineer doing a live walkthrough for a new teammate. First person plural. Explain the *why* while the screen shows the *what* — never read the card aloud. Subtitles = exactly what is spoken.

## Workflow

### 0. Setup (once per repo)
- Needs: Node 18+, `ffmpeg`/`ffprobe`, Playwright (`npm i -D playwright && npx playwright install chromium` in the repo, or global), a Gemini API key as `GEMINI_API_KEY` in env or `.env.local`/`.env` (**make sure that file is gitignored — check with `git check-ignore -v .env.local`**).
- Create a working folder **outside version control or gitignored** (e.g. `explainer-video/`), then copy `<skill-dir>/scripts/*` and `<skill-dir>/assets/*` (→ `assets/`) into it. Run scripts with the repo as cwd (so Playwright and the key resolve): `VIDEO=<name> node explainer-video/render.mjs`.
- Smoke test: copy `<skill-dir>/examples/orders.*` in and run `VIDEO=orders node explainer-video/tts.mjs` — a 50 s video with no screenshots needed.

### 1. Research — facts with file:line, nothing invented
Fan out parallel agents (they keep file dumps out of your context):
- **Backend agent** (read-only): every endpoint in the flow → pg/db function → each write in order (table, columns, values), checks + exact error messages, transactions, what is NOT written, who owns what (mark vendor code). Ask for `file:line` and to mark anything **inferred**.
- **Frontend agent** (read-only): user flow step by step — pages, button labels, pickers and *what they list/filter*, which API call each button makes, permission/stage gating.
- **Screenshot agent**: write `capture.config.mjs` (from `capture.config.example.mjs`) and run `capture.mjs`. Rules for it: **read-only** (open pickers/tabs/panels, never submit/save/delete), log in **once** per run, prefer real test data, verify every PNG by opening it. Boxes go to `shots/boxes.json`.
- **Ask the human** what code can't tell you (domain meaning, "why does this button exist"). Code says *what*; only people know *why*. Wrong "why" is the most likely error in these videos.

### 2. Script — `<name>.json`
```json
{ "baseEnd": 140,
  "lines": [[0.3, "Hook line…"], [7.0, "…"]],          // [cue second, spoken line]
  "sfx":   [[0.45, "impactSoft_medium_001.ogg", 0.6]], // [second, file in assets/, volume]
  "music": ["your-track.mp3", 0.12] }                  // or null
```
- Plan scenes on a base timeline (cue times = scene starts, ~5–10 s each); real timing comes from the voice later.
- Hook in the first 2 s (a question or a situation: "An order arrives."), map, then one scene per concept: card → real UI → backend → code. End with a "Next:" / summary card.
- ~1 idea per line, 10–35 words. Spell things the way they should be *spoken* ("stage eleven", "user dot email", "build config").
- Only state facts the research proved. Leave inferred things out, or say "probably".

### 3. Build — `<name>.html` using `engine.js` / `engine.css`
Start from `examples/orders.html`. Define `window.DIAGRAM = { nodes, links, labels }` before loading `engine.js`, then write the timeline. Times are base-timeline seconds; **declare each element's animations in chronological order** (later animations win).

| Helper | Use |
|---|---|
| `fadeIn(sel, t, d?, dy?)`, `fadeOut(sel, t, d?)`, `slideIn(sel, t)`, `fade(sel, t, from, to, d?)` | basic reveals (selector string or element) |
| `buildDiagram()`, `diagramIn(t)` | build map (all nodes start hidden), stagger it in. Nodes `[x, y, title, sub, hue, icon]` (hue = palette name or colour; icons: db server user users file cpu lock globe zap clock gear phone cloud box queue code bell map); `DIAGRAM.groups = [[x, y, w, h, 'CHIP', hue]]` |
| `light(id, t)` (glows in the node's own hue), `unlight`, `dim([ids], t)`, `undim([ids], t)` | focus a node; keep dim/undim balanced (they fade 1↔0.35 — context stays visible) |
| `flow('a-b', t, d=1.1)` | packet travels and the lit gradient line draws in behind it, same pace |
| `stream('a-b', t, d=2.4, n=4)` | several small dots in the destination hue riding a link (requests, particles) |
| `step(['a','b','c'], t0, gap)` | dashed "current step" box that hops along a pipeline |
| `hl('#tokenId', t, color)` | glowing pill behind a code token (`<span class="hl" id=…>`) |
| `blurIn` / `blurOut` / `whip(sel, t, dir)` / `tiltIn` / `push(sel, t, d)` | scene entrances & exits; `push` is a slow 1→1.04 push-in |
| `strike(sel, t)` | red rounded bar drawn across text |
| `cam(t, d, camNode(id, scale, screenX, screenY))`, `camAt(x, y, s, px, py)`, `CAM_HOME` | camera on the map |
| `shotWin(id, 'file.png')` | screenshot window (redacts the sidebar-footer user name area — adjust for your app) |
| `ring(winId, png, boxKey, {cls:'green', tag, tagCls, tagAt:'top', pad})` → `{r, t}` | ring + tag from `boxes.json`; add your own boxes with `Object.assign(BOXES['x.png'], {...})` |
| `focus(png, boxKey, zoom)` + `pan('#<winId>s', t, d, from, to)` | camera on a screenshot, clamped to the frame |
| `pulse(el, t)`, `draw('#pathId', t)` | ring pop; draw an SVG underline (`stroke-dasharray` = length) |
| `finish(baseEnd)` | builds subtitles from narration, exposes `seek()` — call last |

Layout rules: 1920×1080; captions own the bottom ~140 px; detail cards right of a zoomed node; labels that belong to the map must be `.linklabel` (they move with the camera). Code font 30 px → 18 px per char, 48 px per line (26 px font: 15.6 / 41.6) — use that to place underlines, then **verify with a full-resolution crop**.

### 4. Check stills before spending TTS
`VIDEO=<name> node render.mjs 3 12 25 …` → `<name>-still-<s>.png`. Tile them (`ffmpeg … xstack`) and look. Fix overlaps, tags off-frame, rings on the wrong row, underlines striking text. Look at risky frames at full size, not only the contact sheet.

### 5. Voice → render → mix
- `VIDEO=<name> node tts.mjs models` (check the model exists), `… tts.mjs audition` (6 voices; Sulafat = warm, Charon = classic explainer), then `… tts.mjs <Voice>`.
- It measures each line, stretches scenes so each one waits for its line (+0.6 s breath), renders frame-exact, mixes voice + SFX + music → `<name>.mp4`.
- Visual-only edits: `REUSE=1 VIDEO=<name> node tts.mjs <Voice>` (no API calls). Changed a line? delete just its `<name>-line-<i>.wav`, then `REUSE=1`.

### 6. Verify the final file (not the HTML)
- Pull frames from the MP4 at several line starts: the screen must match what is being said.
- Every line tail is silent: `ffmpeg -i <name>-line-<i>.wav -af "atrim=start=<dur-0.15>,volumedetect" -f null -` → max ≲ −40 dB.
- Delete any saved login session/state files the capture created.

### 7. Chapters
Make one video per chapter, then `node join.mjs out.mp4 "Orders=orders.mp4" "Payments=payments.mp4"` (0.8 s crossfade + chapter markers). Re-joining never re-runs TTS.

## Gotchas (all hit for real)
- **TTS reads style prompts aloud.** "Say calmly: …" gets spoken; Gemini 3.x TTS rejects `systemInstruction`. Send plain text; pick tone by voice.
- **3.x TTS returns a full WAV**, 2.5 returns raw PCM. Decoding a WAV as raw PCM = a loud burst after every sentence. `tts.mjs` detects `RIFF`; keep that.
- **Even stretching delays reveals.** The warp keeps reveals at their pace from the scene start and turns spare time into an end-of-scene hold; the last 1 s before a scene change stays pinned to it. Don't "fix" it to linear.
- **CSS class collisions**: `.big` is the 128 px Poppins title style — a card with class `big` turns into a headline. Use another name.
- **Screenshot boxes drift** when data changes between captures: re-measure, don't reuse hand-placed coordinates.
- **Never put real credentials, internal URLs or private data in shared files.** Redact signed-in user names in screenshots. Use test data.
- **Don't let the video overclaim.** "The one place our code changes X" is only true if you searched *every* writer (grep all `UPDATE/INSERT` on the table). Search first, narrate second.

## Files
- `scripts/engine.js`, `scripts/engine.css` — timeline engine + styles (map, cards, rings, code, black box, subtitles)
- `scripts/render.mjs` — frame-exact render / stills · `scripts/tts.mjs` — Gemini narration, retiming, mix · `scripts/capture.mjs` + `capture.config.example.mjs` — screenshots + boxes · `scripts/join.mjs` — chapters
- `assets/` — 3 CC0 SFX (Kenney.nl): soft impact (hook), click (button rings), bong (end card). Music is not bundled: bring a track you have the rights to, or set `"music": null`.
- `examples/orders.html` + `orders.json` — neutral sample covering every element
- `scripts/words.mjs` — word-level timings for styled videos (after `VOICE_ONLY=1 … tts.mjs`; `tts.mjs` and `render.mjs` pass `TIMING`/`WORDS` to the page)
- `styles/` — 13 alternative styles: `README.md` (table + narration-first build steps), `<id>.md` specs, `examples/<id>.html` samples, `cues.js` runtime, `preview.mjs` sample renderer
