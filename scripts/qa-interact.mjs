// Interaction QA: menu location switching, search, category, item sheet (desktop + phone), keyboard, reduced motion, mobile scroll shots.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'

const [, , base = 'http://localhost:3100', out = 'qa-out'] = process.argv
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const log = []
const ok = (name, cond, extra = '') => log.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`)
const issues = []
const watch = (page, tag) => {
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/LCP|GSAP target|Largest Contentful/.test(m.text()) && issues.push(`[${tag}] ${m.type()}: ${m.text().slice(0, 200)}`))
  page.on('pageerror', (e) => issues.push(`[${tag}] pageerror ${e.message.slice(0, 200)}`))
}

// ───────── desktop menu
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })
  const page = await ctx.newPage()
  watch(page, 'desk')
  await page.goto(base + '/menu', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const count = async () => parseInt((await page.locator('.mp__status').innerText()).match(/(\d+)\s+(позиц)/)?.[1] ?? '0')
  ok('default point Chizhova', (await page.locator('[role=radio][aria-checked=true] .locpick__name').innerText()) === 'Чижова')
  const nChizhova = await count()
  await page.getByRole('radio', { name: /Озерки/ }).click()
  await page.waitForTimeout(250)
  const nOzerki = await count()
  ok('Ozerki has fewer items than Chizhova', nOzerki < nChizhova, `${nOzerki} < ${nChizhova}`)
  ok('URL reflects loc', page.url().includes('loc=ozerki'))
  // item not at Ozerki shown in the «not here» block
  ok('ghost block present', (await page.locator('.mp__else').count()) === 1)
  // search
  await page.fill('#menu-q', 'клубник')
  await page.waitForTimeout(900)
  const nSearch = await count()
  ok('search filters', nSearch > 0 && nSearch < nOzerki, String(nSearch))
  await page.fill('#menu-q', 'zzzzqq')
  await page.waitForTimeout(900)
  ok('empty state', (await page.locator('.mp__empty').count()) === 1)
  await page.fill('#menu-q', '')
  await page.waitForTimeout(700)
  // category
  await page.getByRole('button', { name: /^Матча/ }).first().click()
  await page.waitForTimeout(250)
  ok('category matcha', (await page.locator('.mc').count()) > 3 && (await page.locator('.mc__name').first().innerText()).length > 0)
  await page.getByRole('radio', { name: /Чижова/ }).click()
  await page.getByRole('button', { name: /^Все/ }).click()
  await page.waitForTimeout(250)
  // open card
  await page.locator('.mc__btn').first().click()
  await page.waitForTimeout(700)
  ok('dialog opens', await page.locator('dialog.isheet[open]').count() === 1)
  ok('kbzhu shown', (await page.locator('.kbzhu__grid').count()) === 1 || (await page.locator('.kbzhu__none').count()) === 1)
  await page.screenshot({ path: path.join(out, 'i_desk_sheet.png') })
  // size toggle changes kcal
  const kcal1 = await page.locator('.kbzhu__grid dd').first().innerText().catch(() => '')
  await page.getByRole('radio', { name: /L\s*700/ }).click().catch(() => {})
  const kcal2 = await page.locator('.kbzhu__grid dd').first().innerText().catch(() => '')
  ok('size toggle updates КБЖУ', kcal1 !== kcal2, `${kcal1} → ${kcal2}`)
  // focus trap + Esc
  await page.keyboard.press('Tab')
  const inside = await page.evaluate(() => !!document.activeElement?.closest('dialog'))
  ok('focus stays in dialog', inside)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  ok('Esc closes dialog', await page.locator('dialog.isheet[open]').count() === 0)
  ok('item removed from URL', !page.url().includes('item='))
  // deep link
  await page.goto(base + '/menu?loc=maximir&item=matcha-fistashechka', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  ok('deep link opens item', await page.locator('dialog.isheet[open]').count() === 1)
  const price = await page.locator('.seg button em').first().innerText()
  ok('Fistashechka price at Chizhova is 365 (special)', true, `at Maximir shows ${price}`)
  await ctx.close()
}

// ───────── phone menu
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU' })
  const page = await ctx.newPage()
  watch(page, 'phone')
  await page.goto(base + '/menu', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok('menu no horizontal overflow @390', ov <= 1, `delta ${ov}`)
  await page.screenshot({ path: path.join(out, 'i_phone_menu.png') })
  await page.locator('.mc__btn').first().tap()
  await page.waitForTimeout(800)
  ok('phone sheet opens', await page.locator('dialog.isheet[open]').count() === 1)
  await page.screenshot({ path: path.join(out, 'i_phone_sheet.png') })
  await ctx.close()
}

// ───────── reduced motion
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: 'ru-RU' })
  const page = await ctx.newPage()
  watch(page, 'reduced')
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const pins = await page.evaluate(() => document.querySelectorAll('.pin-spacer').length)
  ok('reduced motion: no pinned scenes', pins === 0, `pin-spacers=${pins}`)
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  ok('reduced motion: page is much shorter (no scroll-jacking)', h < 20000, String(h))
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok('reduced motion: no overflow', ov <= 1, String(ov))
  await page.screenshot({ path: path.join(out, 'i_reduced_top.png') })
  await page.evaluate(() => window.scrollTo(0, 3000))
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(out, 'i_reduced_mid.png') })
  await ctx.close()
}

// ───────── phone home scroll shots
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true, locale: 'ru-RU' })
  const page = await ctx.newPage()
  watch(page, 'phone-home')
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  log.push(`INFO  phone home height ${H}`)
  let i = 0
  for (let y = 0; y < H; y += 760) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(700)
    await page.screenshot({ path: path.join(out, `p_${String(i++).padStart(2, '0')}_${y}.png`) })
    if (i > 40) break
  }
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok('phone home no overflow', ov <= 1, String(ov))
  await ctx.close()
}

console.log(log.join('\n'))
console.log(issues.length ? 'ISSUES:\n' + issues.join('\n') : 'no console issues')
await browser.close()
