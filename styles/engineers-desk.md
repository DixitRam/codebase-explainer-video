# Style: Engineer's Desk (mixed media)

Spec only (no short sample): this style was proven on a full 2:48 architecture-handover video. Build it narration-first with `cues.js` like the other styles.

**Pitch:** A top-down wooden desk during a handover. Every material means one thing, so the film is mixed media without being random.

**Why it suits explainers:** Architecture handovers and proposals — the contrast "today's code (paper, tape, red pen)" vs "the proposal (index cards, print pages)" carries the argument.
**Weak at:** Very long code; UI screenshots (would need a "photo taped down" treatment).

**Material = meaning (keep it strict)**
- Walnut desk ground (SVG feTurbulence grain + vignette) — the one constant "camera"; scenes slide in from the right as new sheets.
- Tractor-feed printout (green-bar, sprocket holes, IBM Plex Mono) = today's real code, quoted with `file:line`.
- Dark terminal (`#0E1110`, phosphor `#C8F7C5`, amber/red/green) = proof: `ls -l` sizes, CI output, test runs.
- Index cards (white, blue rules, red header line, Inter) + purple `PROPOSED` stamp = proposed code/calls.
- Magazine/riso paper (`#F3EEE4` + noise, Fraunces) = headlines and the thesis; two-ink overprint headlines (multiply, 2–4 px misregistration) ONLY on paper, never on the dark desk (it turns muddy).
- Sticky notes (yellow/pink/mint/orange, Caveat) = owners and rules. Red marker (Permanent Marker) + masking tape = problems and patches.
- Blueprint sheet (`#1D4E89` + white grid) = architecture diagram.
- A real product photo as a halftone duotone polaroid (grayscale + multiply, ink colour with `lighten`, dot overlay).
- Chapter ink pairs change across the film: pink/teal → red/black → yellow/federal blue → green/orange → purple/sunflower; all overprint on the closing line.

**Motion grammar:** Drop (y −40 → 0, scale 1.06 → 1), slap (scale 1.35 → 1) for stickies and stamps, slide-in for cards, SVG self-draw for marker strokes and arrows, steps() typing for code, tape wipes (scaleX). Each reveal starts ~0.2 s before its word. Desk pan between scenes (in 0.45 s power3.out, out 0.38 s power3.in). No bounce.

## Lessons from the build
- One author building all scenes kept it consistent (14 parallel builders on an earlier cut produced mismatched eases and bugs).
- Amber/sunflower ink on cream fails contrast for numerals — darken to ~`#B87400`.
- Keep the caption band clear: every prop above y = 896.
