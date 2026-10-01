// Browser QA: screenshots at several viewports/scroll positions, horizontal-overflow check, console errors, failed requests.
// usage: node scripts/qa.mjs <baseUrl> <outDir> [--scenes] [--routes] [--mobile]
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'

const [, , base = 'http://localhost:3100', out = 'qa-out', ...flags] = process.argv
fs.mkdirSync(out, { recursive: true })
const exe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })

const issues = []
async function open(vw, vh, { mobile = false, reduced = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    locale: 'ru-RU',
  })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) issues.push(`[${vw}x${vh}] console.${m.type()}: ${m.text().slice(0, 240)}`)
  })
  page.on('pageerror', (e) => issues.push(`[${vw}x${vh}] pageerror: ${e.message.slice(0, 240)}`))
  page.on('requestfailed', (r) => issues.push(`[${vw}x${vh}] requestfailed: ${r.url().slice(0, 160)} ${r.failure()?.errorText}`))
  page.on('response', (r) => {
    if (r.status() >= 400) issues.push(`[${vw}x${vh}] HTTP ${r.status()}: ${r.url().slice(0, 160)}`)
  })
  return { ctx, page }
}

const shot = async (page, name) => page.screenshot({ path: path.join(out, name + '.png') })
const overflow = (page) =>
  page.evaluate(() => {
    const de = document.documentElement
    const bad = []
    if (de.scrollWidth > de.clientWidth + 1) bad.push(`doc ${de.scrollWidth}>${de.clientWidth}`)
    return bad
  })

if (flags.includes('--scenes')) {
  const { ctx, page } = await open(1440, 900)
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  console.log('doc height', total)
  const ys = process.argv.includes('--ys') ? [] : []
  const marks = (process.env.YS ?? '0,900,1700,2600,3600,4600,5600,6800,8000,9400,10800,12200,13600,15000,16500,18000,19500,21000,22500,24000,25500,27000').split(',').map(Number)
  for (const y of marks) {
    if (y > total) break
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(900)
    await shot(page, `d_${String(y).padStart(5, '0')}`)
  }
  console.log('overflow desktop home:', await overflow(page))
  await ctx.close()
}

if (flags.includes('--routes')) {
  for (const [vw, vh] of [[1440, 900], [1280, 800], [1024, 768], [768, 1024]]) {
    const { ctx, page } = await open(vw, vh)
    for (const r of ['/', '/menu', '/locations']) {
      await page.goto(base + r, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      const o = await overflow(page)
      if (o.length) issues.push(`[${vw}] overflow on ${r}: ${o}`)
      await shot(page, `r_${vw}_${r === '/' ? 'home' : r.slice(1)}`)
    }
    await ctx.close()
  }
}

if (flags.includes('--mobile')) {
  for (const [vw, vh] of [[390, 844], [375, 812], [430, 932]]) {
    const { ctx, page } = await open(vw, vh, { mobile: true })
    for (const r of ['/', '/menu', '/locations']) {
      await page.goto(base + r, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      const o = await overflow(page)
      if (o.length) issues.push(`[${vw}] overflow on ${r}: ${o}`)
      await shot(page, `m_${vw}_${r === '/' ? 'home' : r.slice(1)}`)
    }
    await ctx.close()
  }
}

console.log(issues.length ? issues.join('\n') : 'no console/network issues')
await browser.close()
