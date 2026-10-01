import { chromium } from 'playwright-core'
const [, , url = 'http://localhost:3100/', w = '390'] = process.argv
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const ctx = await browser.newContext({ viewport: { width: +w, height: 844 }, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(500)
const r = await page.evaluate(() => {
  const vw = 390
  return [...document.querySelectorAll('footer *, footer')].map((el) => ({ t: el.tagName + '.' + (el.className?.toString() ?? ''), r: Math.round(el.getBoundingClientRect().right), w: Math.round(el.getBoundingClientRect().width) })).filter((x) => x.r > vw + 2).slice(0, 12)
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
