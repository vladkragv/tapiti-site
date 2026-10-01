// Extracts cup photos from the official menu images and removes the flat gradient background.
// usage: node scripts/extract-cups.mjs --debug <outDir>   (draw boxes)
//        node scripts/extract-cups.mjs --out <outDir>     (write cutouts)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { SOURCES, LAYOUTS } from './data/cup-layouts.mjs'

const root = path.resolve(import.meta.dirname, '..')
const mode = process.argv[2]
const outDir = process.argv[3]
fs.mkdirSync(outDir, { recursive: true })
const only = process.argv[4]

const boxes = []
for (const L of LAYOUTS) {
  if (only && L.src !== only) continue
  L.names.forEach((row, r) => row.forEach((name, c) => {
    const [x0, x1] = L.xs[c]
    boxes.push({ ...L, name, x: x0, y: L.y0 + r * L.pitch, w: x1 - x0, h: L.h })
  }))
}

if (mode === '--debug') {
  const bySrc = {}
  for (const b of boxes) (bySrc[b.src] ??= []).push(b)
  for (const [src, bs] of Object.entries(bySrc)) {
    const meta = await sharp(path.join(root, SOURCES[src])).metadata()
    const svg = `<svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">${bs.map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="none" stroke="#0f0" stroke-width="3"/><text x="${b.x}" y="${b.y + 18}" font-size="18" fill="#ff0" font-family="Arial">${b.name}</text>`).join('')}</svg>`
    const composed = await sharp(path.join(root, SOURCES[src])).composite([{ input: Buffer.from(svg) }]).png().toBuffer()
    await sharp(composed).resize({ width: 1400 }).jpeg({ quality: 80 }).toFile(path.join(outDir, `debug_${src}.jpg`))
  }
  console.log('debug written', boxes.length)
  process.exit(0)
}

// ───────── cutout
const globalBg = new Map()
async function getGlobalBg(file) {
  if (globalBg.has(file)) return globalBg.get(file)
  const m = await sharp(file).metadata()
  const strip = await sharp(file).extract({ left: 6, top: 0, width: 6, height: m.height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const arr = []
  for (let y = 0; y < m.height; y++) { const i = (y * 6 + 3) * 4; arr.push([strip.data[i], strip.data[i + 1], strip.data[i + 2]]) }
  globalBg.set(file, arr)
  return arr
}
async function cutout(file, b) {
  const meta = await sharp(file).metadata()
  const gbg = await getGlobalBg(file)
  const PADL = 12
  const left = Math.max(0, b.x - PADL), top = Math.max(0, b.y)
  const lpad = b.x - left
  const width = Math.min(b.w + lpad, meta.width - left), height = Math.min(b.h, meta.height - top)
  const full = await sharp(file).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const FW = full.info.width, H = full.info.height, W = FW - lpad
  // background depends (almost) only on y: estimate from the clean margin just left of the box
  const bg = new Array(H)
  for (let y = 0; y < H; y++) {
    const px = []
    for (let x = Math.max(0, lpad - 9); x < Math.max(1, lpad - 3); x++) { const i = (y * FW + x) * 4; px.push([full.data[i], full.data[i + 1], full.data[i + 2]]) }
    if (!px.length) { const i = (y * FW) * 4; px.push([full.data[i], full.data[i + 1], full.data[i + 2]]) }
    bg[y] = [0, 1, 2].map((ch) => px.map((p) => p[ch]).sort((a, c) => a - c)[px.length >> 1])
    const g = gbg[top + y]
    if (g && Math.max(Math.abs(bg[y][0] - g[0]), Math.abs(bg[y][1] - g[1]), Math.abs(bg[y][2] - g[2])) > 28) bg[y] = g
  }
  const data = Buffer.alloc(W * H * 4)
  for (let y = 0; y < H; y++) full.data.copy(data, y * W * 4, (y * FW + lpad) * 4, (y * FW + FW) * 4)
  const mask = new Uint8Array(W * H)
  const TH = 38
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4
    const dd = Math.max(Math.abs(data[i] - bg[y][0]), Math.abs(data[i + 1] - bg[y][1]), Math.abs(data[i + 2] - bg[y][2]))
    mask[y * W + x] = dd > TH ? 1 : 0
  }
  // keep the largest connected component
  const comp = new Int32Array(W * H)
  let best = 0, bestId = 0, id = 0
  const stack = []
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || comp[s]) continue
    id++; let count = 0
    stack.push(s); comp[s] = id
    while (stack.length) {
      const p = stack.pop(); count++
      const x = p % W, y = (p / W) | 0
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const q = ny * W + nx
        if (mask[q] && !comp[q]) { comp[q] = id; stack.push(q) }
      }
    }
    if (count > best) { best = count; bestId = id }
  }
  const sil = new Uint8Array(W * H)
  for (let p = 0; p < W * H; p++) if (comp[p] === bestId) sil[p] = 1
  // row-span fill (cups are convex): fill between leftmost and rightmost silhouette pixel on each row
  for (let y = 0; y < H; y++) { let a = -1, z = -1; for (let x = 0; x < W; x++) if (sil[y * W + x]) { if (a < 0) a = x; z = x } if (a >= 0 && z - a > 6) for (let x = a; x <= z; x++) sil[y * W + x] = 1 }
  // robust trapezoid envelope: cups are conical, so fit the left/right edge lines from the extents (iteratively dropping holes)
  {
    const L = new Array(H).fill(-1), R = new Array(H).fill(-1)
    let y0 = -1, y1 = -1
    for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) if (sil[y * W + x]) { if (L[y] < 0) L[y] = x; R[y] = x } if (L[y] >= 0) { if (y0 < 0) y0 = y; y1 = y } }
    if (y0 >= 0 && y1 - y0 > 30) {
      const span = y1 - y0
      const rows = []
      for (let y = Math.round(y0 + span * 0.18); y <= Math.round(y1 - span * 0.04); y++) if (L[y] >= 0) rows.push(y)
      const fit = (pts, side) => {
        let use = pts
        let a = 0, bb = 0
        for (let it = 0; it < 6; it++) {
          const n = use.length; if (n < 4) break
          const sx = use.reduce((s, p) => s + p[0], 0), sy = use.reduce((s, p) => s + p[1], 0)
          const sxx = use.reduce((s, p) => s + p[0] * p[0], 0), sxy = use.reduce((s, p) => s + p[0] * p[1], 0)
          a = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1); bb = (sy - a * sx) / n
          use = pts.filter((p) => (side === 'R' ? p[1] >= a * p[0] + bb - 2 : p[1] <= a * p[0] + bb + 2))
        }
        return [a, bb]
      }
      const [la, lb] = fit(rows.map((y) => [y, L[y]]), 'L')
      const [ra, rb] = fit(rows.map((y) => [y, R[y]]), 'R')
      for (const y of rows) {
        const lx = Math.max(0, Math.round(Math.min(L[y], la * y + lb))), rx = Math.min(W - 1, Math.round(Math.max(R[y], ra * y + rb)))
        for (let x = lx; x <= rx; x++) sil[y * W + x] = 1
      }
    }
  }
  // dilate by 2 then fill holes (flood fill from border over non-silhouette)
  const dil = new Uint8Array(sil)
  for (let pass = 0; pass < 2; pass++) {
    const prev = new Uint8Array(dil)
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x
      if (!prev[p] && (prev[p - 1] || prev[p + 1] || prev[p - W] || prev[p + W])) dil[p] = 1
    }
  }
  const outside = new Uint8Array(W * H)
  const st = []
  for (let x = 0; x < W; x++) { for (const y of [0, H - 1]) { const p = y * W + x; if (!dil[p] && !outside[p]) { outside[p] = 1; st.push(p) } } }
  for (let y = 0; y < H; y++) { for (const x of [0, W - 1]) { const p = y * W + x; if (!dil[p] && !outside[p]) { outside[p] = 1; st.push(p) } } }
  while (st.length) {
    const p = st.pop(); const x = p % W, y = (p / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const q = ny * W + nx
      if (!dil[q] && !outside[q]) { outside[q] = 1; st.push(q) }
    }
  }
  // erode back by 1 (so the dilation doesn't keep a bg fringe) – use filled = !outside, then erode 2
  let filled = new Uint8Array(W * H)
  for (let p = 0; p < W * H; p++) filled[p] = outside[p] ? 0 : 1
  for (let pass = 0; pass < 4; pass++) {
    const prev = new Uint8Array(filled)
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x
      if (prev[p] && !(prev[p - 1] && prev[p + 1] && prev[p - W] && prev[p + W])) filled[p] = 0
    }
  }
  // bbox
  let minX = W, minY = H, maxX = 0, maxY = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (filled[y * W + x]) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
  if (maxX <= minX || maxY <= minY) return null
  // feathered alpha: blur the binary mask slightly
  const alphaBuf = Buffer.alloc(W * H)
  for (let p = 0; p < W * H; p++) alphaBuf[p] = filled[p] ? 255 : 0
  const blurred = await sharp(alphaBuf, { raw: { width: W, height: H, channels: 1 } }).blur(0.9).raw().toBuffer({ resolveWithObject: true })
  const ac = blurred.info.channels
  const rgba = Buffer.alloc(W * H * 4)
  for (let p = 0; p < W * H; p++) { rgba[p * 4] = data[p * 4]; rgba[p * 4 + 1] = data[p * 4 + 1]; rgba[p * 4 + 2] = data[p * 4 + 2]; rgba[p * 4 + 3] = blurred.data[p * ac] }
  const pad = 3
  const ext = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad), width: Math.min(W, maxX + pad + 1) - Math.max(0, minX - pad), height: Math.min(H, maxY + pad + 1) - Math.max(0, minY - pad) }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract(ext)
}

const results = []
const norm = (s) => s.replace(/ё/g, 'е').toLowerCase().replace(/[^а-яa-z0-9]/g, '')
let menuItems = []
if (mode === '--final') menuItems = JSON.parse(fs.readFileSync(path.join(root, 'content/data/menu.json'), 'utf8')).items
const seen = new Set()
const cupsMeta = {}
for (const b of boxes) {
  const img = await cutout(path.join(root, SOURCES[b.src]), b)
  if (!img) { console.log('FAIL', b.name); continue }
  if (mode === '--final') {
    const item = menuItems.find((i) => i.category === b.cat && norm(i.name) === norm(b.name))
    if (!item) { console.log('NO MENU ITEM for', b.cat, b.name); continue }
    if (seen.has(item.id)) { console.log('DUP', item.id); continue }
    seen.add(item.id)
    const png = await img.png().toBuffer()
    const meta = await sharp(png).metadata()
    const outInfo = await sharp(png).resize({ height: Math.round(meta.height * 2), kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).webp({ quality: 88, alphaQuality: 92 }).toFile(path.join(outDir, `${item.id}.webp`))
    // dominant hue from opaque, reasonably saturated pixels
    const raw = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    let sx = 0, sy = 0, wsum = 0
    for (let i = 0; i < raw.data.length; i += 4) {
      if (raw.data[i + 3] < 200) continue
      const r = raw.data[i] / 255, g = raw.data[i + 1] / 255, bb = raw.data[i + 2] / 255
      const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), d = mx - mn
      if (d < 0.18 || mx < 0.25) continue
      let h = d === 0 ? 0 : mx === r ? ((g - bb) / d) % 6 : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4
      h = (h * 60 + 360) % 360
      const wgt = d * mx
      sx += Math.cos((h * Math.PI) / 180) * wgt; sy += Math.sin((h * Math.PI) / 180) * wgt; wsum += wgt
    }
    const hue = wsum ? Math.round(((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360) : 280
    cupsMeta[item.id] = { w: Math.round(outInfo.width), h: Math.round(outInfo.height), hue }
    results.push(item.id)
    continue
  }
  const fn = `${b.cat}__${b.name.replace(/\s+/g, '_')}.png`
  await img.png().toFile(path.join(outDir, fn))
  results.push(fn)
}
console.log('cutouts', results.length)
if (mode === '--final') {
  fs.mkdirSync(path.join(root, 'content/data'), { recursive: true })
  fs.writeFileSync(path.join(root, 'content/data/cups.json'), JSON.stringify(cupsMeta))
  const missing = menuItems.filter((i) => !seen.has(i.id)).map((i) => i.id)
  console.log('menu items without cup image:', missing.length, missing.join(', '))
}




