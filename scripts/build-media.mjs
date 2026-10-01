// Builds web-ready media from the Telegram export into public/media + content/data/media.json
//   photos → webp (full ≤1280w, small 640w) with dims + average colour
//   logo   → transparent PNG/WebP via flood-fill from the border, + favicon/fox mark
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const SRC = path.join(root, 'photos')
const OUT = path.join(root, 'public/media/photos')
fs.mkdirSync(OUT, { recursive: true })

const find = (n) => {
  const f = fs.readdirSync(SRC).find((x) => x.startsWith(`photo_${n}@`) && !x.includes('_thumb'))
  if (!f) throw new Error('photo ' + n)
  return path.join(SRC, f)
}

// key → { n: telegram photo number, tg: message id, alt, crop?: {left,top,width,height} fractions }
export const PHOTOS = {
  'hero-cheers': { n: 58, tg: 123, alt: 'Два напитка TapiTi в руках на фоне неонового лисёнка' },
  'lemonades': { n: 6, tg: 18, alt: 'Лимонады TapiTi с фруктами и мятой на бирюзовой стене' },
  'milktea-hand': { n: 7, tg: 19, alt: 'Молочный чай с джус-боллами в руке на фоне неонового лисёнка' },
  'cups-counter': { n: 26, tg: 62, alt: 'Два стакана TapiTi на стойке с меню' },
  'cups-chocolate': { n: 49, tg: 107, alt: 'Два напитка с шоколадом и манго на стойке' },
  'strawberry-cup': { n: 55, tg: 115, alt: 'Клубничный напиток на стойке TapiTi' },
  'strawberry-mochi': { n: 60, tg: 125, alt: 'Клубничный молочный чай и моти' },
  'red-drink-neon': { n: 5, tg: 16, alt: 'Фруктовый чай со льдом и неоновый лисёнок' },
  'sweets-wall': { n: 48, tg: 106, alt: 'Витрина азиатских сладостей TapiTi' },
  'guest-neon': { n: 53, tg: 111, alt: 'Гостья с напитком у вывески TapiTi' },
  'barista-counter': { n: 50, tg: 108, alt: 'Бариста за стойкой TapiTi' },
  'menu-screens': { n: 64, tg: 138, alt: 'Экраны с меню над стойкой TapiTi' },
  'cup-doodle-lime': { n: 71, tg: 154, alt: 'Стакан с нарисованным рисунком от гостя' },
  'cup-doodle-pair': { n: 72, tg: 155, alt: 'Два стакана с рисунками от гостей' },
  'cup-doodle-blue': { n: 73, tg: 156, alt: 'Рисунки на стаканах' },
  'cup-doodle-cat': { n: 74, tg: 157, alt: 'Стаканы с рисунками котиков' },
  'cup-doodle-hand': { n: 75, tg: 158, alt: 'Стакан с голубой матчей и рисунком' },
  'loc-ozerki': { n: 3, tg: 13, alt: 'Вход в TapiTi в ЖК «Озерки» с шарами' },
  'loc-chizhova': { n: 24, tg: 60, alt: 'Стойка TapiTi в ТРЦ «Галерея Чижова»' },
  'loc-maximir': { n: 63, tg: 137, alt: 'Стойка TapiTi в ТРЦ «Максимир» с неоновой вывеской' },
  'loc-maximir-2': { n: 47, tg: 105, alt: 'Неоновая вывеска TapiTi на деревянной стойке' },
  'fox-3d': { n: 12, tg: 32, alt: 'Лисёнок Тапи — 3D-персонаж бренда' },
  'fox-news': { n: 18, tg: 41, alt: 'Лисёнок Тапи с бабл-ти на голове' },
  'fox-hug': { n: 22, tg: 52, alt: 'Лисёнок Тапи обнимает стакан' },
  'fox-pick': { n: 57, tg: 120, alt: 'Лисёнок Тапи со стаканом бабл-ти' },
  'fox-quality': { n: 11, tg: 31, alt: 'Качество во всём: стакан TapiTi и пузыри' },
  'merch': { n: 17, tg: 38, alt: 'Подарки TapiTi: сумка, чемоданчик и стакан' },
}

const manifest = {}
for (const [key, p] of Object.entries(PHOTOS)) {
  const file = find(p.n)
  let img = sharp(file).rotate()
  const meta = await img.metadata()
  const stats = await sharp(file).resize(16, 16, { fit: 'cover' }).stats()
  const [r, g, b] = stats.channels.map((c) => Math.round(c.mean))
  const full = await img.resize({ width: Math.min(1280, meta.width), withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true })
  fs.writeFileSync(path.join(OUT, `${key}.webp`), full.data)
  const sm = await sharp(file).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true })
  fs.writeFileSync(path.join(OUT, `${key}-sm.webp`), sm.data)
  manifest[key] = { src: `/media/photos/${key}.webp`, sm: `/media/photos/${key}-sm.webp`, w: full.info.width, h: full.info.height, smW: sm.info.width, smH: sm.info.height, color: `rgb(${r},${g},${b})`, alt: p.alt, telegram: `https://t.me/tapiti_vrn/${p.tg}` }
}

// ── Dolphin kiosk still (frame from a Telegram reel, see research/media-catalog.md)
{
  const f = path.join(root, 'public/media/video/dolphin-kiosk-raw.jpg')
  if (fs.existsSync(f)) {
    const out = await sharp(f).resize({ width: 1000 }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true })
    fs.writeFileSync(path.join(OUT, 'loc-dolphin.webp'), out.data)
    const sm = await sharp(f).resize({ width: 560 }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true })
    fs.writeFileSync(path.join(OUT, 'loc-dolphin-sm.webp'), sm.data)
    const st = await sharp(f).resize(16, 16, { fit: 'cover' }).stats()
    manifest['loc-dolphin'] = { src: '/media/photos/loc-dolphin.webp', sm: '/media/photos/loc-dolphin-sm.webp', w: out.info.width, h: out.info.height, smW: sm.info.width, smH: sm.info.height, color: `rgb(${st.channels.map((c) => Math.round(c.mean)).slice(0, 3).join(',')})`, alt: 'Павильон TapiTi в парке «Дельфин» среди сосен', telegram: 'https://t.me/tapiti_vrn' }
  }
}

// ── Logo: flood-fill background removal from the border
{
  const file = find(1)
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height
  const seen = new Uint8Array(W * H)
  const stack = []
  const push = (x, y) => { const p = y * W + x; if (!seen[p]) { seen[p] = 1; stack.push(p) } }
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1) }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y) }
  const diff = (a, b) => Math.max(Math.abs(data[a * 4] - data[b * 4]), Math.abs(data[a * 4 + 1] - data[b * 4 + 1]), Math.abs(data[a * 4 + 2] - data[b * 4 + 2]))
  const bgMask = new Uint8Array(W * H)
  for (const s of stack) bgMask[s] = 1
  while (stack.length) {
    const p = stack.pop(); const x = p % W, y = (p / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const q = ny * W + nx
      if (seen[q]) continue
      // grow only through very light, low-saturation pixels (the lilac/white backdrop); teal/violet outline stops the fill
      const i = q * 4
      const mx = Math.max(data[i], data[i + 1], data[i + 2]), mn = Math.min(data[i], data[i + 1], data[i + 2])
      if (mn > 205 && mx - mn < 60 && diff(p, q) < 14) { seen[q] = 1; bgMask[q] = 1; stack.push(q) }
    }
  }
  const out = Buffer.alloc(W * H * 4)
  for (let p = 0; p < W * H; p++) {
    out[p * 4] = data[p * 4]; out[p * 4 + 1] = data[p * 4 + 1]; out[p * 4 + 2] = data[p * 4 + 2]
    out[p * 4 + 3] = bgMask[p] ? 0 : 255
  }
  let img = sharp(out, { raw: { width: W, height: H, channels: 4 } })
  const trimmed = await img.png().toBuffer()
  const t = await sharp(trimmed).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true })
  fs.mkdirSync(path.join(root, 'public/brand'), { recursive: true })
  await sharp(t.data).resize({ width: 900 }).webp({ quality: 92, alphaQuality: 95 }).toFile(path.join(root, 'public/brand/logo.webp'))
  await sharp(t.data).resize({ width: 900 }).png().toFile(path.join(root, 'public/brand/logo.png'))
  manifest.__logo = { w: t.info.width, h: t.info.height }
  console.log('logo', t.info.width, t.info.height)
}

fs.mkdirSync(path.join(root, 'content/data'), { recursive: true })
fs.writeFileSync(path.join(root, 'content/data/media.json'), JSON.stringify(manifest, null, 1))
console.log('photos', Object.keys(manifest).length - 1)
