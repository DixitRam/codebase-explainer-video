// Preview a style example: node preview.mjs <style-id> [stills...]
//   no stills -> <style-id>.mp4 (30 fps, with beat.wav) in the cwd; stills -> <style-id>-<t>.png
// Examples read ../lab.js (styles/lab.js) and need network for GSAP/fonts. Playwright resolves from the cwd's project.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
let chromium;
try { ({ chromium } = createRequire(`${process.cwd()}/package.json`)('playwright')); } catch { ({ chromium } = await import('playwright')); }
const dir = new URL('.', import.meta.url).pathname;
const [name, ...st] = process.argv.slice(2);
if (!name) throw new Error('usage: node preview.mjs <style-id> [stills...]');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`file://${dir}examples/${name}.html`); await p.evaluate(() => document.fonts.ready); await p.waitForLoadState('networkidle');
await p.waitForFunction(() => window.__seek);
if (st.length) { for (const t of st) { await p.evaluate((t) => { window.__seek(+t); }, t); await p.screenshot({ path: `${name}-${t}.png` }); } }
else {
  const total = Math.round((await p.evaluate(() => window.__DUR)) * 30);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-i', `${dir}beat.wav`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', `${name}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total; i++) { await p.evaluate((t) => { window.__seek(t); }, i / 30); ff.stdin.write(await p.screenshot({ type: 'jpeg', quality: 90 })); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await b.close();
