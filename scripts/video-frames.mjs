// Extract N evenly-spaced frames from selected videos (by survey index) into a contact sheet (research helper)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'

const [, , surveyJson, videoDir, outFile, ...idxs] = process.argv
const meta = JSON.parse(fs.readFileSync(surveyJson, 'utf8'))
const N = 5, H = 420
const tmp = path.join(path.dirname(outFile), 'tmp_frames')
fs.mkdirSync(tmp, { recursive: true })
const rowsImgs = []
for (const idx of idxs) {
  const m = meta[+idx]
  const cells = []
  for (let k = 0; k < N; k++) {
    const t = Math.max(0, (m.dur * (k + 0.5)) / N)
    const fp = path.join(tmp, `${idx}_${k}.jpg`)
    try { execFileSync('ffmpeg', ['-y', '-v', 'quiet', '-ss', String(t), '-i', path.join(videoDir, m.f), '-frames:v', '1', '-vf', `scale=-2:${H},format=yuvj420p`, '-strict', 'unofficial', fp], { stdio: 'ignore' }) } catch {}
    cells.push(fp)
  }
  rowsImgs.push({ idx, m, cells })
}
const W = Math.round(H * 0.58)
const comps = []
rowsImgs.forEach((r, ri) => {
  r.cells.forEach((c, ci) => { if (fs.existsSync(c) && fs.statSync(c).size > 0) comps.push({ input: c, left: ci * W, top: ri * (H + 22) + 22 }) })
  const svg = `<svg width="${W * N}" height="22" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="22" fill="#111"/><text x="6" y="16" font-size="14" font-family="Arial" fill="#fff">#${r.idx} ${r.m.f} · ${r.m.dur}s · ${r.m.w}x${r.m.h} · ${r.m.mb}MB</text></svg>`
  comps.push({ input: Buffer.from(svg), left: 0, top: ri * (H + 22) })
})
await sharp({ create: { width: W * N, height: rowsImgs.length * (H + 22), channels: 3, background: '#222' } }).composite(comps).jpeg({ quality: 78 }).toFile(outFile)
console.log('ok', rowsImgs.length)

