<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="docs/banner-light.png">
    <img alt="codebase-explainer-video" src="docs/banner-light.png" width="600">
  </picture>
</p>

<p align="center">
  <strong>Narrated explainer videos of how your code really works.</strong><br />
  Ask Claude Code about a flow. It reads the code, writes the script,<br />
  animates the system, adds a voice and renders an MP4.
</p>

<p align="center">
  <a href=".claude-plugin/plugin.json"><img src="https://img.shields.io/badge/version-0.1.0-ff8a1f?style=flat-square" alt="Version 0.1.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT license"></a>
  <a href="https://code.claude.com/docs/en/plugins"><img src="https://img.shields.io/badge/Claude%20Code-plugin-D97757?style=flat-square" alt="Claude Code plugin"></a>
  <img src="https://img.shields.io/badge/rendered%20with-Playwright%20%2B%20ffmpeg-2EAD33?style=flat-square" alt="Rendered with Playwright and ffmpeg">
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#styles">Styles</a> ·
  <a href="#rendering">Rendering</a>
</p>

<p align="center">
  <a href="docs/demo.mp4"><img src="docs/hero.gif" alt="A system map where a cart and stock flow into an order, then a card showing what the order contains" width="100%"></a>
</p>

<p align="center"><a href="docs/demo.mp4">Watch the 47-second sample with sound</a>, built from the bundled <code>examples/orders</code> page.</p>

## Why

New teammates ask how a flow works. The answer is spread across a button, an endpoint, a few tables and code nobody remembers owning, and a recorded walkthrough goes stale or gets the details wrong.

This skill makes the video from the code:

- **Facts first.** Research comes before the script, with `file:line` for each claim. Anything inferred gets left out or said as "probably".
- **Which button, which endpoint, which table.** Real UI screenshots with ring callouts, transaction cards listing every write in order, and code cards with the important token marked.
- **Who owns what.** Your code gets an orange `ours` badge. Vendor code is a grey black box showing only what goes in and out.
- **Screen matches voice.** Scenes stretch to fit each spoken line, and subtitles are exactly what's said.
- **No video framework.** Plain HTML and the Web Animations API, rendered frame by frame, so every file is yours to read and edit.

## Install

At the Claude Code prompt:

```
/plugin install codebase-explainer-video --marketplace DixitRam/codebase-explainer-video
```

Or use it as a plain skill:

```sh
git clone https://github.com/DixitRam/codebase-explainer-video
ln -s "$PWD/codebase-explainer-video/skills/codebase-explainer-video" ~/.claude/skills/codebase-explainer-video
```

Then ask:

> Make a codebase explainer video of how checkout works, for new developers.

### What it needs

- Node 18+ and `ffmpeg` / `ffprobe`. The alternative styles also use `npx hyperframes transcribe` for word timings, which needs Node 22+.
- Playwright, in the repo you run it from: `npm i -D playwright && npx playwright install chromium`
- `GEMINI_API_KEY` for the narration, in your environment or a **gitignored** `.env` / `.env.local`. Gemini bills this to your key.
- Network access while rendering: fonts load from Google Fonts, and the alternative styles load GSAP from jsDelivr.

## How it works

1. **Research.** Agents trace the flow through the code: endpoints, each database write in order, exact error messages, and what the UI lists and filters. A read-only capture script takes real screenshots. Claude asks you what code can't answer, like why a button exists.
2. **Script.** A `<name>.json` of cue times and spoken lines, about one idea per line.
3. **Build.** A `<name>.html` page: a system map, screenshots, cards and code on one timeline, using the helpers in `engine.js`.

   ```js
   diagramIn(5.0);                                   // build the map
   flow('cart-order', 7.0);                          // a packet draws its own line
   cam(10.8, 1.0, camNode('order', 1.5, 520, 540));  // zoom in
   hl('#guard', 23.0, 'var(--gold)');                // glow on a code token
   ```

4. **Check stills.** Key frames are rendered and reviewed before any voice is paid for.
5. **Voice, render, mix.** Gemini TTS reads each line, scenes retime to the real audio, and the frames, voice and sound effects become `<name>.mp4`.
6. **Verify.** Frames from the final file are compared with what's being said, and audio tails are checked for noise.

Long topics can be split into chapters: `node join.mjs out.mp4 "Orders=orders.mp4" "Payments=payments.mp4"` adds crossfades and chapter markers.

## Styles

The default is a dark system-map look. There are 13 alternatives, picked per video:

<p align="center"><img src="docs/styles.jpg" alt="Twelve style samples showing the same code concept: Bento Keynote, Code Report, Comic Panel, Engineering Whiteboard, Front Page Graphic, Live Diff, Patent Drawing, Phosphor Terminal, Proof, Sticker Brutal, Swimlane Sheet and Zürich Schematic" width="100%"></p>

The thirteenth, Engineer's Desk, is a spec without a sample. Each style has its palette, fonts, motion rules and storyboard in [`styles/`](skills/codebase-explainer-video/styles/README.md), along with what each one is good and bad at. Alternative styles are built narration-first, so every reveal lands on its spoken word.

## Rendering

Frames are split across several browsers, encoded separately, and joined without re-encoding. The default is half your CPU threads, up to 4. Set `WORKERS=8` to go higher, or `WORKERS=1` for one page.

On one 12-thread laptop, a 6:21 video (11,431 frames at 1080p) went from about 13 minutes with one page to 5m 42s with 4 workers. Your numbers will vary with your machine and scenes.

## Project layout

```
.claude-plugin/                       plugin and marketplace manifests
skills/codebase-explainer-video/
  SKILL.md                            the workflow Claude follows
  scripts/                            engine, render, voice, capture, chapters
  examples/orders.*                   neutral sample covering every element
  styles/                             13 style specs, 12 samples, runtime
  assets/                             sound effects
docs/                                 images and the sample video for this page
```

## Before you share a video

Videos built from a real app can show real data. The capture rules are read-only and the page redacts one sidebar area by default, but that area is a starting point: adjust it for your app, use test data, and look at every screenshot yourself.

## Credits

Sound effects are CC0 by [Kenney](https://kenney.nl). Style names and specs credit their inspirations, including ByteMonk, ByteByteGo, Fireship, 3Blue1Brown, MinutePhysics, The New York Times, The Pudding, Apple and Linear. This project is not affiliated with any of them, ships none of their material, and is a community project not affiliated with Anthropic or Google.

## License

[MIT](LICENSE)
