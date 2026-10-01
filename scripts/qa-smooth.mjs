// Verifies that menu switching is animated (View Transitions / dialog exit / segmented indicator) and that nothing jumps.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
const [, , base = 'http://localhost:3100', out = 'qa-out'] = process.argv
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const log = (ok, n, e = '') => console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${e ? ' — ' + e : ''}`)

for (const [label, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, locale: 'ru-RU' })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await page.goto(base + '/menu', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)

  // instrument: count view transitions
  await page.evaluate(() => {
    window.__vt = 0
    const orig = document.startViewTransition.bind(document)
    document.startViewTransition = (cb) => { window.__vt++; return orig(cb) }
  })
  const tap = async (loc) => (mobile ? loc.tap() : loc.click())

  // 1) location switch
  const before = await page.locator('.mc').count()
  await tap(page.getByRole('radio', { name: /Озерки/ }))
  await page.waitForTimeout(120)
  const midAnims = await page.evaluate(() => document.getAnimations().filter((a) => String(a.effect?.pseudoElement ?? '').includes('view-transition')).length)
  await page.screenshot({ path: path.join(out, `s_${label}_loc_mid.png`) })
  await page.waitForTimeout(700)
  const after = await page.locator('.mc').count()
  log(await page.evaluate(() => window.__vt) >= 1 && midAnims > 0, `${label}: location switch runs a view transition`, `${midAnims} animations at +120ms, cards ${before}→${after}`)

  // 2) category switch
  await tap(page.getByRole('button', { name: /^Матча/ }).first())
  await page.waitForTimeout(120)
  const mid2 = await page.evaluate(() => document.getAnimations().filter((a) => String(a.effect?.pseudoElement ?? '').includes('view-transition')).length)
  await page.waitForTimeout(700)
  log(mid2 > 0, `${label}: category switch animates`, `${mid2} animations`)

  // 3) search (debounced)
  await page.fill('#menu-q', 'клуб')
  await page.waitForTimeout(450)
  const vtCount = await page.evaluate(() => window.__vt)
  log(vtCount >= 3, `${label}: search commits one transition after pause`, `vt=${vtCount}`)
  await page.fill('#menu-q', '')
  await page.waitForTimeout(600)

  // 4) product sheet open/close + segmented slide
  await page.getByRole('button', { name: /^Все/ }).first().click().catch(() => {})
  await page.waitForTimeout(500)
  await tap(page.locator('.mc__btn').first())
  await page.waitForTimeout(650)
  await page.screenshot({ path: path.join(out, `s_${label}_sheet.png`) })
  const L = page.getByRole('radio', { name: /L\s*700/ })
  if (await L.count()) {
    const x0 = await page.locator('.seg__ind').first().evaluate((e) => e.getBoundingClientRect().left)
    await tap(L)
    await page.waitForTimeout(110)
    const xMid = await page.locator('.seg__ind').first().evaluate((e) => e.getBoundingClientRect().left)
    await page.waitForTimeout(450)
    const x1 = await page.locator('.seg__ind').first().evaluate((e) => e.getBoundingClientRect().left)
    log(x0 < xMid && xMid < x1, `${label}: size indicator slides`, `${Math.round(x0)}→${Math.round(xMid)}→${Math.round(x1)}`)
  }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(90)
  const stillShown = await page.evaluate(() => {
    const d = document.querySelector('dialog.isheet')
    return d && getComputedStyle(d).display !== 'none'
  })
  await page.waitForTimeout(600)
  const gone = await page.evaluate(() => getComputedStyle(document.querySelector('dialog.isheet')).display === 'none')
  log(stillShown && gone, `${label}: sheet fades out (visible at +90ms, gone later)`, `${stillShown}/${gone}`)
  log(errs.length === 0, `${label}: no console errors`, errs.join(' | ').slice(0, 200))
  await ctx.close()
}
await browser.close()
