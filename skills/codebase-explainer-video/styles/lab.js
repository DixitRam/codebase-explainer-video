// Shared clip harness: word timings, GSAP timeline, seek hook, skinnable captions.
// A clip defines its own look; it calls LAB.cue(word#) for times and LAB.captions(opts) for the band.
window.LAB = (function () {
  const DUR = 9.8;
  const W = [["Now",0,0.4],["the",0.4,0.56],["biggest",0.56,1.04],["change.",1.04,1.84],["Build",1.84,2.4],["config",2.4,2.88],["is",3.04,3.28],["a",3.28,3.52],["pure",3.52,3.84],["function.",3.84,4.64],["A",4.64,4.8],["snapshot",4.8,5.44],["goes",5.44,5.68],["in",5.68,6.08],["a",6.08,6.24],["config",6.24,6.56],["comes",6.72,7.04],["out.",7.04,7.44],["No",7.44,7.68],["database.",7.68,8.4],["No",8.4,8.56],["history.",8.56,9.2]];
  const tl = gsap.timeline({ paused: true });
  const LEAD = 0.2;
  // cue("pure") or cue(8) -> start time minus lead; nth occurrence via cue("config", 2)
  function cue(key, nth = 1) {
    if (typeof key === "number") return Math.max(0, W[key][1] - LEAD);
    const norm = (s) => s.replace(/[.,]/g, "");
    for (const exact of [true, false]) {  // exact case first, so cue("A") != cue("a")
      let n = 0;
      for (const w of W) if ((exact ? norm(w[0]) === key : norm(w[0]).toLowerCase() === key.toLowerCase()) && ++n === nth) return Math.max(0, w[1] - LEAD);
    }
    throw new Error("no word " + key);
  }
  // captions: groups of words, current word highlighted. opts: {groups:[[from,to],...], el}
  function captions(el, groups = [[0, 3], [4, 9], [10, 13], [14, 17], [18, 21]]) {
    groups.forEach(([a, b]) => {
      const g = document.createElement("div");
      g.className = "cap-group";
      W.slice(a, b + 1).forEach((w, i) => {
        const s = document.createElement("span");
        s.className = "cap-word"; s.textContent = w[0];
        g.appendChild(s); g.appendChild(document.createTextNode(" "));
        tl.fromTo(s, { "--on": 0 }, { "--on": 1, duration: 0.08, ease: "none" }, w[1]);
      });
      el.appendChild(g);
      const start = W[a][1], end = b + 1 < W.length ? W[b + 1][1] : DUR;
      tl.fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, start);
      if (end < DUR) tl.to(g, { autoAlpha: 0, duration: 0.1 }, end - 0.05);
    });
  }
  function done() {
    tl.to({}, { duration: 0 }, DUR);
    window.__DUR = DUR;
    window.__seek = (t) => { tl.seek(t, false); };
    tl.seek(0, false);
  }
  return { tl, cue, captions, done, DUR, W };
})();
