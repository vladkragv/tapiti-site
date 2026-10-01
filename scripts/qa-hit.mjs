// Which element is on top of the phone bottom bar / header links at various scroll depths?
import { chromium } from 'playwright-core'
const base = process.argv[2] ?? 'http://localhost:3100'
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto(base + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const H = await page.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < H; y += 1000) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(350)
  const r = await page.evaluate(() => {
    const b = document.querySelector('.mbar__btn')?.getBoundingClientRect()
    if (!b) return 'no bar'
    const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    const h = document.querySelector('.hdr__logo')?.getBoundingClientRect()
    const top2 = h && document.elementFromPoint(h.left + h.width / 2, h.top + h.height / 2)
    return `bar→${top?.closest('a,button,section,div')?.className?.toString().slice(0, 30)} | logo→${top2?.className?.toString().slice(0, 30)}`
  })
  if (!/bar→mbar/.test(r)) console.log(y, r)
}
console.log('done', H)
await browser.close()
