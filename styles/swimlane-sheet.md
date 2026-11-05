# Style: SWIMLANE SHEET: pastel numbered flow

Reference clip: `examples/swimlane-sheet.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs swimlane-sheet`.

**Pitch:** A ByteByteGo-style bright explainer sheet, crossed with Josh Comeau's server/client timeline lanes. White paper, pastel rounded boxes, numbered step badges, lanes per system layer.

**Refs:** https://www.joshwcomeau.com/react/server-components/ · https://blog.bytebytego.com/p/diagram-as-code/comments · https://samwho.dev/load-balancing/

**Why it suits us:** "UI → endpoint → tables → owner" is literally a sequence across layers, and numbered badges (①②③) let narration say "step 3" with no ambiguity. It is light mode, so it is the strongest contrast to the house style, and it screenshots well into docs and Slack.
**Weak at:** Drama and title moments, and it can look like a static slide. Motion has to carry the energy.

**Visual spec**
- Paper is `#FAFAF7`, with lane separators `#E7E5DF` dashed and lane labels in the left gutter.
- Pastel fills, each with a darker stroke of the same hue:
  - UI `#DCEBFF` / `#2F6FEB`
  - API `#E6F6EA` / `#1F9D55`
  - DB `#FFF1D6` / `#C77700`
  - Code `#F1E8FF` / `#7C3AED`
  - Forbidden `#FFE3E3` / `#D92D20`
- Ink is `#1F2328`.
- Fonts: display **Plus Jakarta Sans 800**, body **Plus Jakarta Sans**, mono **IBM Plex Mono**.
- Boxes are 16 px radius with 2 px stroke and a flat 0 4 0 shadow in the stroke colour at 15% (this reads as "drawn", not "glassy"). Each box has a simple line icon (inline SVG, one stroke weight).
- Code appears as a small white "snippet chip" docked inside a box: 3 lines max, with the key token tinted in the box colour.
- Flow uses orthogonal elbow connectors (2.5 px, rounded joins). Packets are small rounded *envelopes* or *pills* labelled with the payload name ("snapshot"), à la samwho's request pills, never glowing dots. Step badges are filled circles with white numerals.

**Motion grammar**
- Entrances: boxes pop with scale 0.9 → 1 plus a 6 px rise on `power3.out`, 0.35 s, staggered left to right.
- Connectors draw on in the direction of flow. The pill travels the path at constant speed, about 600 px/s.
- Emphasis: the box stroke thickens 2 → 4 px and the badge bounces.
- Transitions: the camera pans along the lanes, and it is one continuous sheet, not cuts.
- Avoid: gradients, glows, 3D, and more than 6 boxes on screen.

**Storyboard**
1. **Now 0.00 → change 1.04:** the sheet is visible with faded existing lanes (UI, API, DB). A purple "Code" lane slides in with a "Biggest change" tag at 1.04.
2. **Build 1.84 → function 3.84:** the purple box `buildConfig()` pops at 1.84 with badge ① and a snippet chip. At 3.52 a "pure" pill-tag attaches to its corner, and at 3.84 the box outline changes from solid to a double-line "sealed" border.
3. **snapshot 4.80 → in 5.68:** a blue "snapshot" pill rides the elbow connector into the box. Badge ② appears.
4. **config 6.24 → out 7.04:** a green "config" pill exits on the right. Badge ③ appears.
5. **No database 7.44 / No history 8.40:** the dashed connector to the DB lane tries to draw, stops halfway and turns red with a "✕" chip at 7.68. A "history" clock icon greys out and slides away at 8.56.

**Build notes**
- *Elbow routing:* hand-author the waypoints per connector in a JSON layout. Draw the paths with SVG `path`, use `getTotalLength()` for the draw-on, and use `getPointAtLength` to drive the pill so it stays seekable.
- *Camera pan across a 3840-wide sheet:* translate one root `<g>` and keep the caption band out of the transform.
- *Crisp pastel shadows at 1080p:* use solid offset shadows (`box-shadow: 0 4px 0`) rather than blur, which also renders faster per frame.

## Lessons from the sample build

- Strong, clean result. Right half stays empty until ~6 s — fill it earlier in a full video (put the output node on the sheet from the start, dimmed).
- A half-drawn dashed DB connector is too short to read as 'no database'; the ✕ chip carried it. Make the refused path long and obvious.
- No camera pan was needed for a single beat; use the pan for multi-step flows.
