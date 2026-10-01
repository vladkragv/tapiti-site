import { chromium } from 'playwright-core'
const [, , url = 'http://localhost:3100/', w = '390'] = process.argv
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const ctx = await browser.newContext({ viewport: { width: +w, height: 844 }, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const H = await page.evaluate(() => document.documentElement.scrollHeight)
const found = new Map()
for (let y = 0; y < H; y += 600) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => {
    const vw = 390
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (cs.position === 'fixed' || el.closest('.hdr, .mbar')) continue
      const b = el.getBoundingClientRect()
      if (b.width && (b.right > vw + 2 || b.left < -2)) {
        let p = el.parentElement, clipped = false
        while (p && p !== document.body) { const o = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) { clipped = true; break } p = p.parentElement }
        if (!clipped) out.push(`${el.tagName.toLowerCase()}.${(el.className?.toString() ?? '').slice(0, 50)} L${Math.round(b.left)} R${Math.round(b.right)}`)
      }
    }
    return out.slice(0, 6)
  })
  for (const s of r) found.set(s, y)
}
console.log([...found].map(([k, v]) => `${v}: ${k}`).join('\n') || 'none')
console.log('scrollW', await page.evaluate(() => document.documentElement.scrollWidth))
await browser.close()
