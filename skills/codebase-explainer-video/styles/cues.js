// Runtime for styled (non-house) full videos. Load after GSAP, before your page script.
// render.mjs injects window.TIMING ({ starts, durs, end }) and window.WORDS (from words.mjs).
//   const { tl, cue, line, captions, done } = CUES;
//   tl.fromTo('#box', {opacity:0}, {opacity:1, duration:.4}, cue(2, 'snapshot'));  // line 2, word "snapshot"
//   captions(document.querySelector('#cap')); done();
// cue(line, word, nth=1) → word start minus 0.2 s lead, so a move settles ON the word. line(i) → line start.
window.CUES = (function () {
  const T = window.TIMING || {}, WD = window.WORDS || [];
  const LEAD = 0.2;
  const tl = gsap.timeline({ paused: true });
  const norm = (s) => s.replace(/[.,!?;:"'“”]/g, '');
  function cue(li, key, nth = 1) {
    const ws = WD.filter((w) => w.line === li);
    if (typeof key === 'number') return Math.max(0, ws[key].start - LEAD);
    for (const exact of [true, false]) {
      let n = 0;
      for (const w of ws) if ((exact ? norm(w.text) === key : norm(w.text).toLowerCase() === key.toLowerCase()) && ++n === nth) return Math.max(0, w.start - LEAD);
    }
    throw new Error(`no word "${key}" #${nth} in line ${li}`);
  }
  const line = (i) => T.starts[i];
  // Word-highlight captions: one group per ~7 words, never crossing a line. Style .cap-group / .cap-word (CSS var --on 0→1).
  function captions(el, per = 7) {
    const lines = [...new Set(WD.map((w) => w.line))];
    for (const li of lines) {
      const ws = WD.filter((w) => w.line === li);
      for (let a = 0; a < ws.length; a += per) {
        const grp = ws.slice(a, a + per), g = document.createElement('div');
        g.className = 'cap-group';
        grp.forEach((w) => { const s = document.createElement('span'); s.className = 'cap-word'; s.textContent = w.text; g.append(s, ' ');
          tl.fromTo(s, { '--on': 0 }, { '--on': 1, duration: 0.08, ease: 'none' }, w.start); });
        el.appendChild(g);
        const next = ws[a + per] ?? WD.find((w) => w.line > li);
        tl.fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, grp[0].start);
        tl.to(g, { autoAlpha: 0, duration: 0.1 }, Math.min(next ? next.start - 0.05 : grp.at(-1).end + 0.4, (T.end ?? 1e9) - 0.1));
      }
    }
  }
  function done() {
    const end = T.end ?? tl.duration();
    tl.to({}, { duration: 0 }, end);
    window.DURATION = end;                       // render.mjs reads these
    window.seek = (t) => { tl.seek(t, false); }; // returns nothing: a returned timeline hangs Playwright
    if (location.search.includes('render')) window.seek(0);
  }
  return { tl, cue, line, captions, done, LEAD };
})();
