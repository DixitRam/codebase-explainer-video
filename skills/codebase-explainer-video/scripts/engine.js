// Shared timeline engine for every part (house style = ByteMonk look; see engine.css). Every animation is a paused-able WAAPI animation,
// so render.mjs can seek to any frame. Times are in the part's base timeline (seconds);
// warp() stretches them to fit the narration (anchors injected by render.mjs).
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const CAM_EASE = 'cubic-bezier(.65,0,.35,1)';

const WARP = window.WARP ?? null;
function warp(t) {
  if (!WARP) return t;
  let i = 0;
  while (i < WARP.length - 2 && t > WARP[i + 1][0]) i++;
  const [[o0, n0], [o1, n1]] = [WARP[i], WARP[i + 1]];
  // Scenes only ever get longer. Reveals keep their pace from the scene start; the extra
  // time becomes a hold at the end. Anything in the last TAIL seconds (exits, camera moves)
  // stays pinned to the next scene instead.
  const TAIL = 1.0;
  return o1 - t < TAIL ? n1 - (o1 - t) : n0 + (t - o0);
}

function at(sel, t, dur, frames, easing = EASE) {
  const els = typeof sel === 'string' ? $$(sel) : [sel];
  for (const el of els) el.animate(frames, { delay: warp(t) * 1000, duration: dur * 1000, fill: 'forwards', easing });
}
const fadeIn = (sel, t, d = 0.5, dy = 20) => at(sel, t, d, [{ opacity: 0, transform: `translateY(${dy}px)` }, { opacity: 1, transform: 'none' }]);
const fadeOut = (sel, t, d = 0.4) => at(sel, t, d, [{ opacity: 1 }, { opacity: 0 }]);
const slideIn = (sel, t) => at(sel, t, 0.6, [{ opacity: 0, transform: 'translateX(-80px)' }, { opacity: 1, transform: 'none' }]);
const fade = (sel, t, from, to, d = 0.5) => at(sel, t, d, [{ opacity: from }, { opacity: to }]);
const pulse = (sel, t) => {
  at(sel, t, 0.3, [{ opacity: 0, transform: 'scale(1.4)' }, { opacity: 1, transform: 'scale(1)' }]);
  at(sel, t + 0.5, 0.6, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }]);
};
const draw = (sel, t, d = 0.7) => at(sel, t, d, [{ strokeDashoffset: $(sel).getAttribute('stroke-dasharray') }, { strokeDashoffset: 0 }]);
const pan = (sel, t, d, from, to) => at(sel, t, d, [{ transform: from }, { transform: to }], CAM_EASE);

// ---------- master diagram ----------
// The page defines window.DIAGRAM = { nodes, links, labels, groups } before loading engine.js:
//   nodes:  { id: [x, y, 'Title', 'subtitle', hue?, icon?] }  (centres on the 1920×1080 canvas; card 240×120, 240×156 with icon)
//           hue = a palette name ('violet', 'cyan', 'gold', …) or any CSS colour; give every actor its own.
//           icon = one of ICONS below (db, server, user, users, file, cpu, lock, globe, zap, clock, gear, phone, cloud, box, queue, code, bell, map)
//   links:  { 'a-b': ['a', 'b'] }   (lit copy is a gradient from a's hue to b's hue)
//   labels: [[x, y, 'SECTION LABEL'], ...]
//   groups: [[x, y, w, h, 'CHIP LABEL', hue?], ...]  (top-left corner + size; drawn behind nodes)
const NODES = window.DIAGRAM?.nodes ?? {};
const LINKS = window.DIAGRAM?.links ?? {};
const LABELS = window.DIAGRAM?.labels ?? [];
const GROUPS = window.DIAGRAM?.groups ?? [];
const HALF_W = 120;
const halfH = (id) => (NODES[id][5] ? 78 : 60);
const hueOf = (h) => (!h ? null : /^[a-z]+$/.test(h) ? `var(--${h})` : h);
// Line icons (Lucide-style, 24×24 viewBox), drawn in the node's hue.
const ICONS = {
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.5-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2.4.7 4 2.5 4 5.2"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5z"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  queue: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21h4"/>',
  map: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
};

// Link runs centre-to-centre but starts/ends where that line crosses each node's card edge.
function linkGeom(a, b) {
  const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
  const dx = x2 - x1, dy = y2 - y1;
  const ka = Math.min(HALF_W / Math.abs(dx || 1e-9), halfH(a) / Math.abs(dy || 1e-9));
  const kb = Math.min(HALF_W / Math.abs(dx || 1e-9), halfH(b) / Math.abs(dy || 1e-9));
  const sx = x1 + dx * ka, sy = y1 + dy * ka, ex = x2 - dx * kb, ey = y2 - dy * kb;
  return { sx, sy, ex, ey, len: Math.hypot(ex - sx, ey - sy), deg: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function buildDiagram() {
  const stage = document.createElement('div');
  stage.id = 'stage';
  stage.className = 'abs';
  let html = GROUPS.map(([x, y, w, h, chip, hue], i) => `<div id="g-${i}" class="abs group hide" style="left:${x}px; top:${y}px; width:${w}px; height:${h}px;${hue ? ` --h:${hueOf(hue)}` : ''}"><span class="chip">${chip}</span></div>`).join('');
  html += LABELS.map(([x, y, text], i) => `<div class="abs branch hide diagram-label" id="lbl-${i}" style="left:${x}px; top:${y}px">${text}</div>`).join('');
  for (const [id, [a, b]] of Object.entries(LINKS)) {
    const g = linkGeom(a, b);
    const ha = hueOf(NODES[a][4]), hb = hueOf(NODES[b][4]);
    const vars = `${ha ? `--a:${ha};` : ''}${hb ? `--b:${hb};` : ''}`;
    for (const on of ['', ' on']) {
      html += `<div id="l-${id}${on ? '-on' : ''}" class="abs link${on}" data-rot="rotate(${g.deg}deg)"
        style="left:${g.sx}px; top:${g.sy}px; width:${g.len}px; ${vars} transform: rotate(${g.deg}deg) scaleX(0)"></div>`;
    }
  }
  for (const [id, [x, y, name, sub, hue, icon]] of Object.entries(NODES)) {
    const h = hueOf(hue);
    html += `<div id="n-${id}" class="abs node hide${icon ? ' icon' : ''}" style="left:${x}px; top:${y}px;${h ? ` --h:${h}` : ''}">
      <div class="glow"></div>
      ${icon ? `<svg viewBox="0 0 24 24">${ICONS[icon] ?? ''}</svg>` : ''}<b>${name}</b>${sub ? `<i>${sub}</i>` : ''}</div>`;
  }
  html += `<div id="stepbox" class="abs stepbox hide"></div>`;
  stage.innerHTML = html;
  document.body.prepend(stage);
  // Link labels are in diagram coordinates, so they must move with the camera.
  $$('.linklabel').forEach((el) => stage.append(el));
}

// Build the whole map in, staggered, starting at t.
function diagramIn(t) {
  GROUPS.forEach((_, i) => fadeIn(`#g-${i}`, t - 0.1, 0.5, 0));
  Object.keys(NODES).forEach((id, i) => at(`#n-${id}`, t + i * 0.25, 0.5, [{ opacity: 0, transform: 'translateY(14px) scale(.92)' }, { opacity: 1, transform: 'none' }]));
  Object.keys(LINKS).forEach((id, i) => linkIn(`l-${id}`, t + 0.3 + i * 0.25));
  $$('.diagram-label').forEach((el) => fadeIn(el, t + 0.2));
}
function linkIn(elId, t, d = 0.4, easing = EASE) {
  const rot = $(`#${elId}`).dataset.rot;
  at(`#${elId}`, t, d, [{ opacity: 1, transform: `${rot} scaleX(0)` }, { opacity: 1, transform: `${rot} scaleX(1)` }], easing);
}
// Glow in the node's own hue.
const light = (id, t) => fade(`#n-${id} .glow`, t, 0, 1, 0.4);
const unlight = (id, t) => fade(`#n-${id} .glow`, t, 1, 0, 0.4);
// ByteMonk keeps context visible: dim lightly, not to near-black.
const dim = (ids, t, to = 0.35) => ids.forEach((id) => fade(`#n-${id}`, t, 1, to));
const undim = (ids, t, from = 0.35) => ids.forEach((id) => fade(`#n-${id}`, t, from, 1, 0.3));
// Packet: a white-hot dot travels the link and the lit line draws in behind it (same start, same pace).
function flow(id, t, d = 1.1) {
  const [a, b] = LINKS[id];
  const g = linkGeom(a, b);
  linkIn(`l-${id}-on`, t, d, 'ease-in-out');
  const dot = document.createElement('div');   // one dot per flow, so each keeps its own hue
  dot.className = 'abs dot hide';
  dot.style.setProperty('--c', hueOf(NODES[b][4]) ?? 'var(--teal)');
  $('#stage').append(dot);
  at(dot, t, d, [{ opacity: 1, left: `${g.sx}px`, top: `${g.sy}px` }, { opacity: 1, left: `${g.ex}px`, top: `${g.ey}px` }], 'ease-in-out');
  fadeOut(dot, t + d, 0.2);
}
// Several small dots in the destination hue riding a link at once (a stream of requests / particles).
function stream(id, t, d = 2.4, n = 4) {
  const [a, b] = LINKS[id];
  const g = linkGeom(a, b), stage = $('#stage'), per = 0.9;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'abs dot sm hide';
    el.style.setProperty('--c', hueOf(NODES[b][4]) ?? 'var(--teal)');
    stage.append(el);
    const t0 = t + (i * (d - per)) / Math.max(1, n - 1);
    const p = (k) => ({ left: `${g.sx + (g.ex - g.sx) * k}px`, top: `${g.sy + (g.ey - g.sy) * k}px` });
    at(el, t0, per, [{ opacity: 0, ...p(0) }, { opacity: 1, ...p(0.15), offset: 0.15 }, { opacity: 1, ...p(0.85), offset: 0.85 }, { opacity: 0, ...p(1) }], 'linear');
  }
}
// Dashed "current step" box that hops through nodes: step(['a','b','c'], t0, gap).
function step(ids, t0, gap = 1.2) {
  ids.forEach((id, i) => {
    const [x, y] = NODES[id];
    const from = i ? NODES[ids[i - 1]] : NODES[id];
    at('#stepbox', t0 + i * gap, i ? 0.45 : 0.3, [{ opacity: i ? 1 : 0, left: `${from[0]}px`, top: `${from[1]}px` }, { opacity: 1, left: `${x}px`, top: `${y}px` }], CAM_EASE);
  });
}
// Camera: put diagram point (x, y) at screen (px, py) with scale s.
const camAt = (x, y, s, px = 960, py = 540) => `translate(${px - x * s}px, ${py - y * s}px) scale(${s})`;
const camNode = (id, s, px, py) => camAt(NODES[id][0], NODES[id][1], s, px, py);
const CAM_HOME = 'translate(0px, 0px) scale(1)';
let camState = CAM_HOME;
function cam(t, d, to) { pan('#stage', t, d, camState, to); camState = to; }

// ---------- emphasis & transitions ----------
// Soft glowing pill behind a code token: <span class="hl" id="x">token</span>, then hl('#x', t, 'var(--teal)').
const hl = (sel, t, c = 'var(--teal)', d = 0.35) => at(sel, t, d, [
  { backgroundColor: 'transparent', boxShadow: '0 0 0 transparent' },
  { backgroundColor: `color-mix(in srgb, ${c} 22%, transparent)`, boxShadow: `0 0 18px color-mix(in srgb, ${c} 45%, transparent)` }]);
// Scene entrances/exits seen in ByteMonk: blur rise, whip pan, 3D tilt settle, slow push-in.
const blurIn = (sel, t, d = 0.6) => at(sel, t, d, [{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(40px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }]);
const blurOut = (sel, t, d = 0.4) => at(sel, t, d, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)' }]);
const whip = (sel, t, dir = 1, d = 0.45) => at(sel, t, d, [{ opacity: 0, filter: 'blur(16px)', transform: `translateX(${30 * dir}%)` }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }], 'cubic-bezier(.2,.9,.2,1)');
const tiltIn = (sel, t, d = 0.9) => at(sel, t, d, [{ opacity: 0, transform: 'perspective(1200px) rotateX(16deg) rotateY(-10deg) scale(.92)' }, { opacity: 1, transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)' }]);
const push = (sel, t, d = 6, to = 1.04) => at(sel, t, d, [{ transform: 'scale(1)' }, { transform: `scale(${to})` }], 'linear');
// Red rounded bar drawn across a line of text (strike-through).
function strike(sel, t, d = 0.35) {
  const el = $(sel), bar = document.createElement('div');
  bar.className = 'abs';
  bar.style.cssText = 'left:-4px; right:-4px; top:50%; height:6px; margin-top:-3px; border-radius:3px; background:var(--red); transform-origin:0 50%; transform:scaleX(0)';
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.append(bar);
  at(bar, t, d, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]);
}

// ---------- screencast windows (boxes from shots/boxes.json, PNG px; shot layer is 1600/1920 scale) ----------
const SHOT_K = 1600 / 1920;
const BOXES = window.BOXES ?? {};
function box(png, key) {
  const b = BOXES[png]?.[key];
  if (!b) throw new Error(`no box ${png} › ${key}`);
  return { x: b.x * SHOT_K, y: b.y * SHOT_K, w: b.w * SHOT_K, h: b.h * SHOT_K };
}
// Window with a zoomable layer; hides the signed-in user's name in the sidebar footer.
function shotWin(id, png) {
  const w = document.createElement('div');
  w.id = id;
  w.className = 'abs win hide';
  w.innerHTML = `<div id="${id}s" class="abs shot"><img src="shots/${png}">
    <div class="abs redact" style="left:0; top:822px; width:255px; height:78px"></div></div>`;
  document.body.append(w);
  return w;
}
// Ring (+ optional tag) around a box, inside the zoom layer so it moves with the camera.
function ring(winId, png, key, { cls = '', pad = 8, tag, tagCls = '', tagAt = 'right' } = {}) {
  const b = box(png, key);
  const r = document.createElement('div');
  r.className = `abs ring hide ${cls}`;
  r.style.cssText = `left:${b.x - pad}px; top:${b.y - pad}px; width:${b.w + 2 * pad}px; height:${b.h + 2 * pad}px`;
  $(`#${winId}s`).append(r);
  let t = null;
  if (tag) {
    t = document.createElement('div');
    t.className = `abs tag hide ${tagCls}`;
    const pos = tagAt === 'top' ? `right:${1600 - (b.x + b.w + pad)}px; top:${b.y - pad - 30}px` : `left:${b.x + b.w + pad + 10}px; top:${b.y + b.h / 2 - 12}px`;
    t.style.cssText = `${pos}; font-size:13px; padding:3px 8px`;
    t.textContent = tag;
    $(`#${winId}s`).append(t);
  }
  return { r, t };
}
// Zoom transform that centres a box at scale z, clamped so the screenshot always fills the frame.
function focus(png, key, z) {
  const b = box(png, key);
  const clamp = (v, lo) => Math.min(0, Math.max(lo, v));
  const tx = clamp(800 - (b.x + b.w / 2) * z, 1600 - 1600 * z);
  const ty = clamp(450 - (b.y + b.h / 2) * z, 900 - 900 * z);
  return `translate(${tx}px, ${ty}px) scale(${z})`;
}

// ---------- finish: subtitles from narration, then expose seek() ----------
function finish(baseEnd) {
  const lines = window.NARRATION ?? [];
  lines.forEach(([t, text], i) => {
    const el = document.createElement('div');
    el.className = 'abs cap hide';
    el.innerHTML = `<span>${text}</span>`;
    document.body.append(el);
    fadeIn(el, t, 0.3, 10);
    if (lines[i + 1]) fadeOut(el, lines[i + 1][0] - 0.35, 0.25);
  });
  window.DURATION = warp(baseEnd);
  const anims = document.getAnimations();
  window.seek = (sec) => anims.forEach((a) => { a.pause(); a.currentTime = sec * 1000; });
  if (location.search.includes('render')) window.seek(0);
}
