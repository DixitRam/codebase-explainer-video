// Gemini TTS narration + SFX + music → final <VIDEO>.mp4. Script and cues live in <VIDEO>.json.
//   VIDEO=orders node tts.mjs models            → list TTS models this key can use
//   VIDEO=orders node tts.mjs audition          → first line in several voices (audition-<voice>.wav); VOICES=a,b to pick
//   VIDEO=orders node tts.mjs [voice]           → narration → retimed render → final <VIDEO>.mp4
//   REUSE=1 ...                                 → keep existing <VIDEO>-line-<i>.wav (no API calls; visual-only edits)
//   TTS_MODEL=...                               → model (default gemini-3.8-flash-tts; fall back to gemini-2.5-pro-preview-tts)
// Key: GEMINI_API_KEY env, else GEMINI_API_KEY=… in .env.local / .env of the cwd or any parent folder.
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

function findKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  for (let d = process.cwd(); ; d = dirname(d)) {
    for (const f of ['.env.local', '.env']) {
      const p = join(d, f);
      const m = existsSync(p) && readFileSync(p, 'utf8').match(/^GEMINI_API_KEY=["']?([^"'\n]+)/m);
      if (m) return m[1].trim();
    }
    if (dirname(d) === d) return null;
  }
}
const KEY = findKey();
if (!KEY) throw new Error('GEMINI_API_KEY not found (env, .env.local or .env)');
const dir = new URL('.', import.meta.url).pathname;
const NAME = process.env.VIDEO;
if (!NAME) throw new Error('set VIDEO=<name> (reads <name>.json)');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = process.env.TTS_MODEL ?? 'gemini-3.8-flash-tts';
const { lines: LINES, sfx: SFX = [], music: MUSIC = null, baseEnd: BASE_END } = JSON.parse(readFileSync(`${dir}${NAME}.json`, 'utf8'));

async function api(path, body) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(`${API}/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
        body: body && JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      return r.json();
    } catch (e) {
      // Connect timeouts happen; HTTP errors are not worth retrying.
      if (attempt >= 3 || /^\d{3} /.test(e.message)) throw e;
      console.log(`retry ${attempt}: ${e.cause?.code ?? e.message}`);
    }
  }
}

const duration = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

async function say(text, voice, out) {
  // Plain text only: TTS models read a style prefix ("Say calmly: …") out loud, and 3.x rejects
  // systemInstruction. The voice choice is the tone control.
  const res = await api(`models/${MODEL}:generateContent`, {
    contents: [{ parts: [{ text }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  });
  const part = res.candidates[0].content.parts.find((p) => p.inlineData);
  const raw = `${out}.raw`;
  const bytes = Buffer.from(part.inlineData.data, 'base64');
  writeFileSync(raw, bytes);
  // 2.5 models return headerless 16-bit 24 kHz PCM; 3.x returns a full WAV (RIFF header + trailing
  // metadata chunk). Decoding a WAV as raw PCM turns that chunk into a loud burst after every line.
  const isWav = bytes.subarray(0, 4).toString('latin1') === 'RIFF';
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...(isWav ? [] : ['-f', 's16le', '-ar', '24000', '-ac', '1']), '-i', raw, out]);
  return duration(out);
}

// Same map as warp() in engine.js: reveals keep their pace from the scene start, extra time becomes
// a hold at the end, and the last TAIL seconds (exits, camera moves) stay pinned to the next scene.
function warpAt(warp, t) {
  let i = 0;
  while (i < warp.length - 2 && t > warp[i + 1][0]) i++;
  const [[o0, n0], [o1, n1]] = [warp[i], warp[i + 1]];
  const TAIL = 1.0;
  return o1 - t < TAIL ? n1 - (o1 - t) : n0 + (t - o0);
}

const [cmd] = process.argv.slice(2);

if (cmd === 'models') {
  const { models } = await api('models?pageSize=1000');
  console.log(models.filter((m) => /tts/i.test(m.name)).map((m) => m.name).join('\n'));
} else if (cmd === 'audition') {
  for (const v of (process.env.VOICES ?? 'Sulafat,Charon,Iapetus,Achird,Sadaltager,Schedar').split(',')) {
    console.log(v, (await say(LINES[0][1], v, `${dir}audition-${v}.wav`)).toFixed(2) + 's');
  }
} else {
  const voice = cmd ?? 'Sulafat';
  const GAP = 0.6; // breath between one line ending and the next scene starting
  const durs = [];
  for (const [i, [, text]] of LINES.entries()) {
    const wav = `${dir}${NAME}-line-${i}.wav`;
    durs.push(process.env.REUSE && existsSync(wav) ? duration(wav) : await say(text, voice, wav));
  }
  // Each scene starts at its planned time, or later if the previous line is still talking.
  const starts = [];
  for (const [i, [t]] of LINES.entries()) {
    const shift = i ? starts[i - 1] - LINES[i - 1][0] : 0;
    starts.push(i ? Math.max(t + shift, starts[i - 1] + durs[i - 1] + GAP) : t);
    console.log(`line ${i}: ${durs[i].toFixed(2)}s at ${starts[i].toFixed(2)}s (planned ${t}s)`);
  }
  const end = Math.max(BASE_END + starts.at(-1) - LINES.at(-1)[0], starts.at(-1) + durs.at(-1) + 1.5);
  // Anchor 0.3s before each cue so the scene's own transition lands just ahead of its line.
  const anchors = LINES.map(([t], i) => [t - 0.3, starts[i] - 0.3]).filter(([o]) => o > 0);
  const warp = [[0, 0], ...anchors, [BASE_END, end]];
  writeFileSync(`${dir}${NAME}.timing.json`, JSON.stringify({ warp, starts, durs, end }));
  // Narration-first (styled videos): stop here, run words.mjs, author the page on real word times, then rerun with REUSE=1.
  if (process.env.VOICE_ONLY) { console.log(`voice only → ${NAME}.timing.json (end ${end.toFixed(2)}s)`); process.exit(0); }
  execFileSync('node', [`${dir}render.mjs`], { stdio: 'inherit', env: { ...process.env, VIDEO: NAME } });

  // Inputs: 0 = video, then voice lines, then SFX, then music.
  const voiceIn = LINES.map((_, i) => ['-i', `${dir}${NAME}-line-${i}.wav`]);
  const sfxIn = SFX.map(([, f]) => ['-i', `${dir}assets/${f}`]);
  const musicIn = MUSIC ? [['-i', `${dir}assets/${MUSIC[0]}`]] : [];
  const f = [];
  starts.forEach((t, i) => f.push(`[${i + 1}]adelay=${Math.round(t * 1000)}:all=1[v${i}]`));
  SFX.forEach(([t, , vol], j) => f.push(`[${LINES.length + 1 + j}]volume=${vol},adelay=${Math.round(warpAt(warp, t) * 1000)}:all=1[s${j}]`));
  const tracks = [...starts.map((_, i) => `[v${i}]`), ...SFX.map((_, j) => `[s${j}]`)];
  if (MUSIC) {
    f.push(`[${LINES.length + 1 + SFX.length}]atrim=0:${end},volume=${MUSIC[1]},afade=t=in:d=1.5,afade=t=out:st=${end - 2.5}:d=2.5[m]`);
    tracks.push('[m]');
  }
  f.push(`${tracks.join('')}amix=inputs=${tracks.length}:normalize=0,alimiter=limit=0.9[a]`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${dir}${NAME}-silent.mp4`, ...voiceIn.flat(), ...sfxIn.flat(), ...musicIn.flat(),
    '-filter_complex', f.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(end),
    `${dir}${NAME}.mp4`]);
  console.log(`→ ${NAME}.mp4`);
}
