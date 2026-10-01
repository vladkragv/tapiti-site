// Surveys video_files: ffprobe metadata + labelled contact sheets built from Telegram thumbs (research helper)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'

const dir = process.argv[2]
const outDir = process.argv[3]
fs.mkdirSync(outDir, { recursive: true })
const vids = fs.readdirSync(dir).filter((f) => !/_thumb\.jpg$/.test(f) && /\.(mp4|mov)$/i.test(f)).sort()
const meta = []
for (const f of vids) {
  let w = 0, h = 0, dur = 0
  try {
    const o = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', path.join(dir, f)]).toString()
    const j = JSON.parse(o)
    w = j.streams[0].width; h = j.streams[0].height; dur = +j.format.duration
  } catch {}
  meta.push({ f, w, h, dur: +dur.toFixed(1), mb: +(fs.statSync(path.join(dir, f)).size / 1048576).toFixed(1) })
}
fs.writeFileSync(path.join(outDir, 'videos.json'), JSON.stringify(meta, null, 1))
const per = 50, C = 10, S = 190
for (let s = 0; s * per < meta.length; s++) {
  const chunk = meta.slice(s * per, s * per + per)
  const rows = Math.ceil(chunk.length / C)
  const comps = []
  for (let i = 0; i < chunk.length; i++) {
    const m = chunk[i]
    const th = path.join(dir, m.f + '_thumb.jpg')
    const x = (i % C) * S, y = Math.floor(i / C) * S
    if (fs.existsSync(th)) {
      comps.push({ input: await sharp(th).rotate().resize(S, S, { fit: 'cover' }).jpeg({ quality: 65 }).toBuffer(), left: x, top: y })
    }
    const idx = s * per + i
    const svg = `<svg width="${S}" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="${S}" height="20" fill="#000" opacity=".7"/><text x="4" y="15" font-size="13" font-family="Arial" fill="#fff">${idx} · ${m.dur}s · ${m.w}x${m.h}</text></svg>`
    comps.push({ input: Buffer.from(svg), left: x, top: y })
  }
  await sharp({ create: { width: C * S, height: rows * S, channels: 3, background: '#222' } }).composite(comps).jpeg({ quality: 70 }).toFile(path.join(outDir, `vsheet_${String(s + 1).padStart(2, '0')}.jpg`))
}
console.log('videos', meta.length, 'total MB', meta.reduce((a, b) => a + b.mb, 0).toFixed(0))
