// Frame-exact render of <VIDEO>.html → <VIDEO>-silent.mp4 (1920×1080, 30 fps).
//   VIDEO=orders node render.mjs            → full silent MP4
//   WORKERS=8 VIDEO=orders node render.mjs  → frames split across N browsers (default: half the CPU threads, max 4; 1 = one page). OUT=path overrides the output.
//   VIDEO=orders node render.mjs 3 12.5 40  → PNG stills at those seconds (<VIDEO>-still-<s>.png) for layout checks
// Every animation on the page is a WAAPI animation; window.seek(sec) pauses them all at that time.
// Injects <VIDEO>.timing.json (warp), <VIDEO>.json (narration) and shots/boxes.json (UI boxes) if present.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { cpus } from 'node:os';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

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

// Opens one browser + page with the video loaded (workers each get their own).
async function open() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const timing = read(`${NAME}.timing.json`);
  // WARP/NARRATION drive engine.js (house style); TIMING/WORDS drive styles/cues.js (narration-first styled videos).
  await page.addInitScript(([w, n, b, tm, wd]) => { window.WARP = w; window.NARRATION = n; window.BOXES = b; window.TIMING = tm; window.WORDS = wd; },
    [timing.warp, read(`${NAME}.json`).lines, read('shots/boxes.json'), timing, existsSync(`${dir}${NAME}.words.json`) ? read(`${NAME}.words.json`) : null]);
  await page.goto(`file://${dir}${NAME}.html?render`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  return { browser, page };
}

// Renders frames [from, to) to one H.264 file.
async function renderRange(page, from, to, file, total) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise((r) => ff.on('close', r));
  for (let i = from; i < to; i++) {
    await page.evaluate((s) => window.seek(s), i / FPS);
    // Wait for ffmpeg to drain, or a slow encoder lets frames pile up in memory.
    if (!ff.stdin.write(await page.screenshot({ type: 'jpeg', quality: 92 }))) await new Promise((r) => ff.stdin.once('drain', r));
    if ((i - from) % 300 === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  if ((await closed) !== 0) throw new Error(`ffmpeg failed on ${file}`);
}

const { browser, page } = await open();
if (stills.length) {
  for (const s of stills) {
    await page.evaluate((s) => window.seek(s), s);
    await page.screenshot({ path: `${dir}${NAME}-still-${s}.png` });
  }
} else {
  const total = Math.round((await page.evaluate(() => window.DURATION)) * FPS);
  const out = process.env.OUT ?? `${dir}${NAME}-silent.mp4`;
  const workers = Math.max(1, Number(process.env.WORKERS ?? Math.min(4, cpus().length >> 1)));
  if (workers === 1) await renderRange(page, 0, total, out, total);
  else {
    const part = (w) => `${out}.part${w}.mp4`;
    const size = Math.ceil(total / workers);
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const own = w ? await open() : { browser: null, page };
      await renderRange(own.page, w * size, Math.min(total, (w + 1) * size), part(w), total);
      await own.browser?.close();
    }));
    const list = `${out}.parts.txt`;
    writeFileSync(list, Array.from({ length: workers }, (_, w) => `file '${part(w)}'`).join('\n'));
    const code = await new Promise((r) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', r));
    if (code !== 0) throw new Error('ffmpeg concat failed');
    for (let w = 0; w < workers; w++) rmSync(part(w));
    rmSync(list);
  }
}
await browser.close();
