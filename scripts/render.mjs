// Frame-exact render of <VIDEO>.html → <VIDEO>-silent.mp4 (1920×1080, 30 fps).
//   VIDEO=orders node render.mjs            → full silent MP4
//   VIDEO=orders node render.mjs 3 12.5 40  → PNG stills at those seconds (<VIDEO>-still-<s>.png) for layout checks
// Every animation on the page is a WAAPI animation; window.seek(sec) pauses them all at that time.
// Injects <VIDEO>.timing.json (warp), <VIDEO>.json (narration) and shots/boxes.json (UI boxes) if present.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url).pathname;
// Playwright from the project (or anywhere up the tree), else a global install.
let chromium;
try {
  ({ chromium } = createRequire(`${process.cwd()}/package.json`)('playwright'));
} catch {
  ({ chromium } = await import('playwright'));
}

const NAME = process.env.VIDEO;
if (!NAME) throw new Error('set VIDEO=<name> (renders <name>.html)');
const FPS = 30;
const stills = process.argv.slice(2).map(Number);
const read = (f) => (existsSync(`${dir}${f}`) ? JSON.parse(readFileSync(`${dir}${f}`, 'utf8')) : {});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const timing = read(`${NAME}.timing.json`);
// WARP/NARRATION drive engine.js (house style); TIMING/WORDS drive styles/cues.js (narration-first styled videos).
await page.addInitScript(([w, n, b, tm, wd]) => { window.WARP = w; window.NARRATION = n; window.BOXES = b; window.TIMING = tm; window.WORDS = wd; },
  [timing.warp, read(`${NAME}.json`).lines, read('shots/boxes.json'), timing, existsSync(`${dir}${NAME}.words.json`) ? read(`${NAME}.words.json`) : null]);
await page.goto(`file://${dir}${NAME}.html?render`);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');

if (stills.length) {
  for (const s of stills) {
    await page.evaluate((s) => window.seek(s), s);
    await page.screenshot({ path: `${dir}${NAME}-still-${s}.png` });
  }
} else {
  const total = Math.round((await page.evaluate(() => window.DURATION)) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', `${dir}${NAME}-silent.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total; i++) {
    await page.evaluate((s) => window.seek(s), i / FPS);
    ff.stdin.write(await page.screenshot({ type: 'jpeg', quality: 92 }));
    if (i % 300 === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
}
await browser.close();
