import fs from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright-core'
const require = createRequire(import.meta.url)
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const base = process.argv[2] ?? 'http://localhost:3100'
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
let total = 0
for (const [vw, vh, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', locale: 'ru-RU' })
  const page = await ctx.newPage()
  for (const r of ['/', '/menu', '/locations', '/menu?loc=maximir&item=matcha-fistashechka']) {
    await page.goto(base + r, { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    await page.evaluate(axeSrc)
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const out = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })
      return out.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' :: ' + (n.any[0]?.message ?? n.all[0]?.message ?? '').slice(0, 110)) }))
    })
    console.log(`--- ${vw} ${r}: ${res.length} violation types`)
    for (const v of res) { total += v.n; console.log(` ${v.impact} ${v.id} ×${v.n} — ${v.help}\n    ${v.sample.join('\n    ')}`) }
  }
  await ctx.close()
}
console.log('TOTAL nodes', total)
await browser.close()
