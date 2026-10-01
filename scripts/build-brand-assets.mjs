// Generates favicon + Open Graph image from the official logo and real cup cut-outs.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const logo = path.join(root, 'public/brand/logo.png')

// favicon: the fox from the logo on a teal rounded square
{
  const meta = await sharp(logo).metadata()
  const fox = await sharp(logo)
    .extract({ left: Math.round(meta.width * 0.36), top: 0, width: Math.round(meta.width * 0.3), height: Math.round(meta.height * 0.47) })
    .resize({ width: 380, height: 380, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="120" fill="#2fd0c4"/><circle cx="256" cy="262" r="196" fill="#ffffff"/></svg>`)
  await sharp(bg).composite([{ input: fox, left: 66, top: 70 }]).png().toFile(path.join(root, 'app/icon.png'))
  await sharp(path.join(root, 'app/icon.png')).resize(180).png().toFile(path.join(root, 'app/apple-icon.png'))
}

// OG image 1200×630
{
  const W = 1200, H = 630
  const cups = ['matcha-zaklyate-lesa', 'frappe-klubnika-marakuyya', 'milk-tea-dynnyy-banan', 'matcha-rozovaya-pantera']
  const comps = []
  const L = await sharp(logo).resize({ height: 330 }).toBuffer()
  const lm = await sharp(L).metadata()
  comps.push({ input: L, left: 70, top: Math.round((H - lm.height) / 2) - 20 })
  const sizes = [300, 250, 230, 280]
  let x = 560
  for (let i = 0; i < cups.length; i++) {
    const c = await sharp(path.join(root, `public/media/menu/${cups[i]}.webp`)).resize({ height: sizes[i] }).png().toBuffer()
    const cm = await sharp(c).metadata()
    comps.push({ input: c, left: x, top: H - sizes[i] - 40 - (i % 2) * 22 })
    x += cm.width - 6
  }
  const txt = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><text x="74" y="${H - 52}" font-family="Arial Black, Arial" font-weight="900" font-size="34" fill="#1b0a3a">Воронеж · 5 точек · меню с КБЖУ</text></svg>`,
  )
  comps.push({ input: txt, left: 0, top: 0 })
  await sharp({ create: { width: W, height: H, channels: 3, background: '#2fd0c4' } }).composite(comps).png().toFile(path.join(root, 'app/opengraph-image.png'))
}
console.log('brand assets ok')
