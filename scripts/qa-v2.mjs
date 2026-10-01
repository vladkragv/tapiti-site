// v2 checks: menu shell is pinned, switching is light (frame times), category scene snaps one card per wheel flick.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
const [, , base = 'http://localhost:3100', out = 'qa-out'] = process.argv
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const log = (ok, n, e = '') => console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${e ? ' — ' + e : ''}`)

// ───────── menu shell (desktop 1440×900 and 1280×720)
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'ru-RU' })
  const page = await ctx.newPage()
  await page.goto(base + '/menu', { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  const m = await page.evaluate(() => {
    const de = document.documentElement
    const sc = document.querySelector('.mp__scroll')
    const side = document.querySelector('.mp__side')
    return { pageOverflow: de.scrollHeight - de.clientHeight, scrollable: sc.scrollHeight - sc.clientHeight, sideFits: side.scrollHeight <= side.clientHeight + 1, sideOver: side.scrollHeight - side.clientHeight }
  })
  log(m.pageOverflow <= 1, `${w}x${h}: page itself does not scroll (head + sidebar pinned)`, `overflow ${m.pageOverflow}`)
  log(m.scrollable > 400, `${w}x${h}: list scrolls inside its own pane`, `${m.scrollable}px`)
  log(m.sideFits, `${w}x${h}: sidebar fits without scrolling`, `over ${m.sideOver}`)
  const headTop = await page.locator('.mp__head').evaluate((e) => e.getBoundingClientRect().top)
  await page.mouse.move(w * 0.65, h * 0.6)
  await page.mouse.wheel(0, 700)
  await page.waitForTimeout(150)
  const mid = await page.locator('.mp__scroll').evaluate((e) => e.scrollTop)
  await page.waitForTimeout(1200)
  const end = await page.locator('.mp__scroll').evaluate((e) => e.scrollTop)
  const headTop2 = await page.locator('.mp__head').evaluate((e) => e.getBoundingClientRect().top)
  log(end > 300 && mid < end && Math.abs(headTop - headTop2) < 1, `${w}x${h}: smooth inertial scroll, header stays`, `mid ${Math.round(mid)} → end ${Math.round(end)}`)

  // frame times while switching point
  await page.evaluate(() => {
    window.__gaps = []
    let last = performance.now()
    const tick = (n) => { window.__gaps.push(n - last); last = n; if (window.__run) requestAnimationFrame(tick) }
    window.__run = true
    requestAnimationFrame(tick)
  })
  for (const name of ['Озерки', 'Максимир', 'Арена', 'Чижова']) {
    await page.getByRole('radio', { name: new RegExp(name) }).click()
    await page.waitForTimeout(650)
  }
  const gaps = await page.evaluate(() => { window.__run = false; return window.__gaps.slice(2) })
  const worst = Math.max(...gaps)
  const slow = gaps.filter((g) => g > 50).length
  log(worst < 140 && slow <= 3, `${w}x${h}: 4 point switches, no freezes`, `worst frame ${Math.round(worst)}ms, frames>50ms: ${slow}/${gaps.length}`)
  if (w === 1440) await page.screenshot({ path: path.join(out, 'v2_menu_desktop.png') })
  await ctx.close()
}

// ───────── categories scene snaps one card per wheel flick
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })
  const page = await ctx.newPage()
  await page.goto(base + '/', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  const y0 = await page.evaluate(() => {
    const el = document.querySelector('.cats__pin')
    return el.getBoundingClientRect().top + window.scrollY
  })
  await page.evaluate((y) => window.scrollTo(0, y), y0 - 20)
  await page.waitForTimeout(900)
  const xOf = () => page.evaluate(() => { const m = new DOMMatrix(getComputedStyle(document.querySelector('.cats__track')).transform); return m.m41 })
  const x0 = await xOf()
  await page.mouse.move(700, 450)
  const res = []
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 120)
    await page.waitForTimeout(1500)
    res.push(Math.round(await xOf()))
  }
  const step = (res[0] - Math.round(x0)) / 1440
  log(Math.abs(step + 1) < 0.08 && Math.abs((res[1] - res[0]) / 1440 + 1) < 0.08, 'desktop: one wheel flick = exactly one category card', `x: ${Math.round(x0)} → ${res.join(' → ')}`)
  await page.screenshot({ path: path.join(out, 'v2_cats.png') })
  await ctx.close()
}
await browser.close()
