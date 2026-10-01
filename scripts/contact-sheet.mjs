// Builds labelled contact sheets from a folder of images -> scratch dir (research helper)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [, , dir, outDir, pattern = '^photo_', perSheet = '24', cols = '6', cell = '300'] = process.argv
const files = fs
  .readdirSync(dir)
  .filter((f) => new RegExp(pattern).test(f) && /\.(jpe?g|png|webp)$/i.test(f) && !/_thumb\./.test(f))
  .sort((a, b) => (parseInt(a.match(/(\d+)/)?.[1] ?? 0) - parseInt(b.match(/(\d+)/)?.[1] ?? 0)))
fs.mkdirSync(outDir, { recursive: true })
const per = +perSheet, C = +cols, S = +cell
for (let s = 0; s * per < files.length; s++) {
  const chunk = files.slice(s * per, s * per + per)
  const rows = Math.ceil(chunk.length / C)
  const comps = []
  for (let i = 0; i < chunk.length; i++) {
    const f = chunk[i]
    const fit = process.env.FIT || 'cover'
    const buf = await sharp(path.join(dir, f)).rotate().resize(S, S, { fit, background: { r: 60, g: 190, b: 180, alpha: 1 } }).flatten({ background: '#3cbeb4' }).jpeg({ quality: 70 }).toBuffer()
    const x = (i % C) * S, y = Math.floor(i / C) * S
    comps.push({ input: buf, left: x, top: y })
    const label = f.replace(/^photo_|\.jpg$/g, '').split('@')[0]
    const svg = `<svg width="${S}" height="26" xmlns="http://www.w3.org/2000/svg"><rect width="${S}" height="26" fill="#000" opacity=".65"/><text x="6" y="19" font-size="16" font-family="Arial" fill="#fff">${label}</text></svg>`
    comps.push({ input: Buffer.from(svg), left: x, top: y })
  }
  await sharp({ create: { width: C * S, height: rows * S, channels: 3, background: '#222' } })
    .composite(comps)
    .jpeg({ quality: 72 })
    .toFile(path.join(outDir, `sheet_${String(s + 1).padStart(2, '0')}.jpg`))
}
console.log('files', files.length, 'sheets', Math.ceil(files.length / per))
