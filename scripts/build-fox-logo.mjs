// Builds the round fox logo (user-provided artwork in reference/brand), favicon and brand glyph paths.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import * as si from 'simple-icons'

const root = path.resolve(import.meta.dirname, '..')
const src = path.join(root, 'reference/brand/fox-logo-source.webp')
const R = 372, cx = 500, cy = 500
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${2 * R}" height="${2 * R}"><circle cx="${R}" cy="${R}" r="${R}" fill="#fff"/></svg>`)
const meta = await sharp(src).metadata()
console.log('src', meta.width, meta.height)
const crop = await sharp(src).extract({ left: cx - R, top: cy - R, width: 2 * R, height: 2 * R }).png().toBuffer()
const maskPng = await sharp(mask, { density: 72 }).resize(2 * R, 2 * R).png().toBuffer()
const masked = await sharp(crop).composite([{ input: maskPng, blend: 'dest-in' }]).png().toBuffer()
const round = await sharp(masked).resize(512).png().toBuffer()
await sharp(round).webp({ quality: 92, alphaQuality: 95 }).toFile(path.join(root, 'public/brand/fox-logo.webp'))
await sharp(round).png().toFile(path.join(root, 'public/brand/fox-logo.png'))
await sharp(round).resize(192).png({ palette: true, compressionLevel: 9 }).toFile(path.join(root, 'app/icon.png'))
await sharp(round).resize(180).png({ palette: true, compressionLevel: 9 }).toFile(path.join(root, 'app/apple-icon.png'))
fs.writeFileSync(
  path.join(root, 'components/ui/brandIcons.ts'),
  `// Brand glyphs from simple-icons (CC0), viewBox 0 0 24 24\nexport const VK_PATH = ${JSON.stringify(si.siVk.path)}\nexport const TG_PATH = ${JSON.stringify(si.siTelegram.path)}\nexport const TIKTOK_PATH = ${JSON.stringify(si.siTiktok.path)}\n`,
)
console.log('fox logo + icons ok')
