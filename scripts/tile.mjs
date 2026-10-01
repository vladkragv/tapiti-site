// Cuts an image into overlapping tiles for careful reading (research helper)
// usage: node tile.mjs <image> <outDir> <cols> <rows> [overlapPx=60] [scale=1]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [, , img, outDir, cols, rows, ov = '60', scale = '1'] = process.argv
fs.mkdirSync(outDir, { recursive: true })
const meta = await sharp(img).metadata()
const C = +cols, R = +rows, O = +ov, sc = +scale
const tw = Math.ceil(meta.width / C), th = Math.ceil(meta.height / R)
const base = path.basename(img, path.extname(img))
for (let r = 0; r < R; r++) {
  for (let c = 0; c < C; c++) {
    const left = Math.max(0, c * tw - O), top = Math.max(0, r * th - O)
    const width = Math.min(meta.width - left, tw + 2 * O), height = Math.min(meta.height - top, th + 2 * O)
    let p = sharp(img).extract({ left, top, width, height })
    if (sc !== 1) p = p.resize(Math.round(width * sc))
    await p.jpeg({ quality: 88 }).toFile(path.join(outDir, `${base}_r${r}c${c}.jpg`))
  }
}
console.log(base, meta.width, meta.height, 'tiles', C * R)
