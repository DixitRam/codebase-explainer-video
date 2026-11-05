// Join finished chapter videos with a short crossfade and chapter markers.
//   node join.mjs out.mp4 "Orders=orders.mp4" "Payments=payments.mp4" "Appendix=appendix.mp4"
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [out, ...parts] = process.argv.slice(2);
if (!out || parts.length < 2) throw new Error('usage: node join.mjs out.mp4 "Title=a.mp4" "Title=b.mp4" ...');
const X = 0.8; // crossfade seconds
const items = parts.map((p) => { const i = p.indexOf('='); return { title: p.slice(0, i), file: p.slice(i + 1) }; });
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

// Chapter i starts where the i-th crossfade begins.
let t = 0;
const chapters = items.map((it, i) => {
  const d = dur(it.file);
  const start = t;
  t += d - (i < items.length - 1 ? X : 0);
  return { ...it, start, end: i < items.length - 1 ? t : start + d };
});
writeFileSync('chapters.txt', ';FFMETADATA1\n' + chapters.map((c) =>
  `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(c.start * 1000)}\nEND=${Math.round(c.end * 1000)}\ntitle=${c.title}`).join('\n') + '\n');

const f = [];
let v = '[0:v]', a = '[0:a]';
for (let i = 1; i < items.length; i++) {
  const last = i === items.length - 1;
  f.push(`${v}[${i}:v]xfade=transition=fade:duration=${X}:offset=${chapters[i].start}${last ? ',format=yuv420p' : ''}[v${i}]`);
  f.push(`${a}[${i}:a]acrossfade=d=${X}[a${i}]`);
  v = `[v${i}]`; a = `[a${i}]`;
}
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...items.flatMap((it) => ['-i', it.file]), '-i', 'chapters.txt',
  '-filter_complex', f.join(';'), '-map', v, '-map', a, '-map_metadata', String(items.length),
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log(`→ ${out}  (${chapters.map((c) => `${c.title} @ ${c.start.toFixed(1)}s`).join(', ')})`);
