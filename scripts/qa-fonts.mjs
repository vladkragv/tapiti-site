import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(process.argv[2] ?? 'http://localhost:3101/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const r = await page.evaluate(async () => {
  await document.fonts.ready
  const faces = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status} ${f.unicodeRange.slice(0, 40)}`)
  const el = document.querySelector('.asm__title')
  return { faces, ff: getComputedStyle(el).fontFamily, fw: getComputedStyle(el).fontWeight, root: getComputedStyle(document.documentElement).getPropertyValue('--font-unbounded') }
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
