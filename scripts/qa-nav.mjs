// Client-side navigation QA: home (with pinned scenes) -> /menu -> /locations -> back, at several scroll depths, desktop + phone.
import { chromium } from 'playwright-core'
const base = process.argv[2] ?? 'http://localhost:3100'
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
let fails = 0
for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  for (const y of [0, 1800, 5200, 12000, 19000, 24000]) {
    for (const target of ['Меню', 'Точки']) {
      const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile })
      const page = await ctx.newPage()
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
      page.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 160)))
      await page.goto(base + '/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      await page.waitForTimeout(700)
      const link = mobile ? page.locator('.mbar').getByRole('link', { name: target }) : page.locator('.hdr__nav').getByRole('link', { name: target })
      page.setDefaultTimeout(6000)
      try { const bb = await link.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) } catch (e) { console.log('FAIL(click) ' + name + ' y=' + y + ' → ' + target + ': ' + String(e.message).split('\n').slice(0, 1).join('') + ' ' + (String(e.message).match(/<section[^>]*>|<div[^>]*>/)?.[0] ?? '')); fails++; await ctx.close(); continue }
      await page.waitForTimeout(1800)
      const broken = await page.evaluate(() => /couldn.t load|Application error|Reload/i.test(document.body.innerText) && !document.querySelector('main h1'))
      const h1 = await page.locator('main h1').first().innerText().catch(() => '')
      const ok = !broken && !!h1 && errs.length === 0
      if (!ok) fails++
      console.log(`${ok ? 'PASS' : 'FAIL'} ${name} y=${y} → ${target}: h1="${h1}" ${errs.join(' | ')}`)
      await ctx.close()
    }
  }
}
console.log(fails ? `FAILS: ${fails}` : 'all navigations OK')
await browser.close()
