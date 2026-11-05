// Word-level timings for a narration-first (styled) video.
//   VOICE_ONLY=1 VIDEO=<name> node tts.mjs <Voice>   → <name>-line-<i>.wav + <name>.timing.json
//   VIDEO=<name> node words.mjs                       → <name>.words.json  [{ line, i, text, start, end }] (seconds on the final video)
// Transcribes each line wav with `npx hyperframes transcribe` (timings only); the TEXT comes from <name>.json,
// so misheard words ("STK" for SDK) never reach the captions.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url).pathname;
const NAME = process.env.VIDEO;
if (!NAME) throw new Error('set VIDEO=<name>');
const { lines } = JSON.parse(readFileSync(`${dir}${NAME}.json`, 'utf8'));
const { starts } = JSON.parse(readFileSync(`${dir}${NAME}.timing.json`, 'utf8'));
if (!starts) throw new Error('timing.json has no starts — rerun tts.mjs (VOICE_ONLY=1)');

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const out = [];
for (const [li, [, text]] of lines.entries()) {
  const tmp = `${dir}.words-tmp`; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);
  copyFileSync(`${dir}${NAME}-line-${li}.wav`, `${tmp}/line.wav`);
  execFileSync('npx', ['-y', 'hyperframes', 'transcribe', 'line.wav', '--json'], { cwd: tmp, stdio: ['ignore', 'ignore', 'inherit'] });
  const heard = JSON.parse(readFileSync(`${tmp}/transcript.json`, 'utf8'));
  rmSync(tmp, { recursive: true, force: true });
  const said = text.split(/\s+|—/).filter((w) => norm(w));
  // Walk script words against heard words. Handles 1:1, one heard word covering several script words
  // ("BuildConfig" → Build + config, time split by length), and several heard words forming one ("hand tuned").
  const words = []; let h = 0, rest = null, restStart = 0;
  for (const t of said) {
    const nt = norm(t);
    if (h >= heard.length) { const l = words.at(-1); words.push({ text: t, start: l.end, end: l.end }); continue; }
    const cur = rest ?? norm(heard[h].text), s0 = rest ? restStart : heard[h].start, e0 = heard[h].end;
    if (cur === nt) { words.push({ text: t, start: s0, end: e0 }); h++; rest = null; }
    else if (cur.startsWith(nt)) { const mid = s0 + (e0 - s0) * (nt.length / cur.length); words.push({ text: t, start: s0, end: mid }); rest = cur.slice(nt.length); restStart = mid; }
    else if (nt.startsWith(cur)) { let acc = cur, k = h; while (acc.length < nt.length && k + 1 < heard.length) acc += norm(heard[++k].text);
      words.push({ text: t, start: s0, end: heard[k].end }); h = k + 1; rest = null; }
    else { let k = h; while (k < heard.length && norm(heard[k].text) !== nt) k++;
      if (k < heard.length) { words.push({ text: t, start: heard[k].start, end: heard[k].end }); h = k + 1; rest = null; }
      else { words.push({ text: t, start: s0, end: e0 }); console.warn(`line ${li}: "${t}" not heard — check its cue`); } }
  }
  words.forEach((w, i) => out.push({ line: li, i, text: w.text, start: +(starts[li] + w.start).toFixed(3), end: +(starts[li] + w.end).toFixed(3) }));
}
writeFileSync(`${dir}${NAME}.words.json`, JSON.stringify(out));
console.log(`→ ${NAME}.words.json (${out.length} words, ${lines.length} lines)`);
