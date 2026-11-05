# Style: LIVE DIFF: code that edits itself

Reference clip: `examples/live-diff.html` (9.8 s, the shared 'pure function' beat). Preview: `node <skill>/styles/preview.mjs live-diff`.

**Pitch:** A Motion Canvas / Shiki Magic Move-inspired style where the code *is* the diagram. Tokens slide, morph and dim as the narration speaks, on warm paper.

**Refs:** https://motioncanvas.io/docs/code · https://github.com/shikijs/shiki-magic-move

**Why it suits us:** Developers trust code more than boxes. This shows the *actual* function and lets diffing do the explaining: removing the DB import *is* the "no database" claim. Ownership and file paths fit naturally as a tab bar.
**Weak at:** Cross-system flows (UI → tables), so pair it with Swimlane Sheet. It also needs short, real snippets of 25 lines or fewer.

**Visual spec**
- Background is warm paper `#F3EFE6`, with the code sheet on `#FFFDF8`, 24 px radius, and a soft 0 30 60 shadow at `rgba(60,40,10,.12)`.
- Light syntax theme:
  - keywords `#8A3FFC`
  - functions `#0F62FE`
  - strings `#198038`
  - params `#B2560E`
  - comments `#8D8A80`
- Dim state is the base colour at 25% opacity. Accent ink for annotations is `#E5484D`.
- Fonts: mono **JetBrains Mono** (ligatures on, 30–34 px), display **Fraunces** (soft serif, for 2–3 word margin notes), body **Inter**.
- No arrows inside code. Flow is shown by *selection*: everything dims except the active range. Margin notes in Fraunces italic hang off a thin leader line.
- File tab and owner chip sit at the top: `config/build.ts · owner: @platform`.

**Motion grammar**
- Token-level magic move: matching tokens glide to their new positions (0.6 s, `power2.inOut`), removed tokens fade and shrink in width, inserted tokens fade and expand.
- Selection: the non-selected range dims to 25% over 0.3 s. It is the only emphasis tool besides margin notes.
- Typing is used only for brand-new lines, at about 40 chars/s.
- Transitions: the code sheet scrolls or swaps files with a horizontal slide of the tab bar.
- Avoid: cursor blinking, typing out existing code, more than one selection at a time, and zooming past 1.3×.

**Storyboard**
1. **Now 0.00 → change 1.04:** the old `build.ts` is visible, with a messy `buildConfig(id)` that calls `db.query` and `history.last()`. The margin note "the biggest change" writes on at 0.56.
2. **Build 1.84 → function 3.84:** at 1.84 the code magic-moves into the new version. The `db` and `history` lines collapse out, and the signature becomes `buildConfig(snapshot: Snapshot): Config`. At 3.52 the selection lands on the signature, and the note "pure" appears.
3. **snapshot 4.80 → in 5.68:** the selection narrows to the `snapshot: Snapshot` parameter and the note "in" appears.
4. **config 6.24 → out 7.04:** the selection moves to the `return { … }` line and the note "out" appears.
5. **No database 7.44 / No history 8.40:** the selection widens to the imports. Ghost lines `import { db }` and `import { history }` fade in at 25% with red strikethrough, then fade away, leaving only `import type { Snapshot, Config }`.

**Build notes**
- *Seekable magic move:* don't use the library's runtime animation. Use `codeToKeyedTokens` (Shiki) at build time to get stable token keys for both versions. Render each token as an absolutely positioned span, then GSAP-tween x/y/opacity per key on the master timeline (a FLIP computed offline).
- *Width collapse for removed tokens:* animate `max-width` and `opacity` on inline-block tokens, so the following tokens reflow smoothly. Alternatively, precompute their target x and tween them explicitly, which is more deterministic.
- *Font metrics:* wait for `document.fonts.ready` before measuring. Measure with ligatures on, or the token positions drift.

## Lessons from the sample build

- Most convincing for developers. Token positions precomputed with an LCS match on a monospace grid; no Shiki/Magic Move runtime.
- The 0.6 s morph frame gets busy when removed tokens squash while matched tokens cross lines — stagger removals before the move, or slow the move to ~0.9 s.
- Hand-rolled tokenizer/colouring was enough; keep snippets ≤ 25 lines.
