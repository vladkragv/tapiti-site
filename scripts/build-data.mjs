// Builds normalized datasets from hand-transcribed menu + parsed KBZHU.
// Outputs: content/data/menu.json, content/data/kbzhu.json, research/menu-catalog.md, research/kbzhu-catalog.md, research/unmatched-kbzhu.md
import fs from 'node:fs'
import path from 'node:path'
import { CATEGORIES, ITEMS, CLASSIC, TOPPINGS, LOCATION_LETTERS, tierPrice } from './data/menu-source.mjs'

const root = path.resolve(import.meta.dirname, '..')
const out = (p, c) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), c) }
const deYo = (s) => (s == null ? s : s.replace(/ё/g, 'е').replace(/Ё/g, 'Е'))

const MENU_URL = 'https://vk.ru/@tapiti_vrn-menu'
const KBZHU_URL = 'https://vk.ru/@tapiti_vrn-kbzhu'

// ── transliteration for ids
const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }
const slug = (s) => deYo(s).toLowerCase().replace(/[а-я]/g, (c) => TR[c] ?? c).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const norm = (s) => deYo(s).toLowerCase().replace(/[^а-яa-z0-9]/g, '')

// ── KBZHU parse
const raw = JSON.parse(fs.readFileSync(path.join(root, 'research/data/kbzhu.raw.json'), 'utf8'))
const SECTIONS = new Set(['Модификаторы', 'Кофейные', 'Молочный чай', 'Матча', 'Милкшейки', 'Фруктовый Чай', 'Классические', 'Авторский Чай', 'Лимонады', 'Фраппе', 'Добавки'])
let section = null, group = null
const groups = new Map() // key = section|group
const flat = []
for (const r of raw) {
  if (r.type === 'header') {
    if (r.text === 'Таблица калорийности') continue
    if (SECTIONS.has(r.text) && !(r.text === 'Матча' && section === 'Матча' && false)) { section = r.text; group = null; continue }
    group = r.text
    continue
  }
  if (r.type !== 'row') continue
  let name = r.name, temp = 'cold', size = null
  let m = name.match(/^(Тепл\.\s*)?(.*?)\s*\((М|M|L)\)\s*$/)
  let base = name
  if (m) { temp = m[1] ? 'hot' : 'cold'; base = m[2].trim(); size = m[3] === 'L' ? 'L' : 'M' }
  const vol = name.match(/\b(\d{3})\s*мл\b/)
  if (vol) { size = vol[1] + ' мл'; base = name.replace(/\s*\d{3}\s*мл\s*/, '').trim() }
  const g = group ?? base
  const key = `${section}|${g}`
  if (!groups.has(key)) groups.set(key, { section, group: g, variants: [] })
  const v = { rawName: name, base, size, temp, protein: r.protein, fat: r.fat, carbs: r.carbs, kcal: r.kcal }
  groups.get(key).variants.push(v)
  flat.push({ section, group: g, ...v })
}

// obvious typo synonyms in the KBZHU article (documented in research/kbzhu-catalog.md)
const KBZHU_SYNONYMS = {
  [norm('Маракукуйя')]: norm('Маракуйя'),
  [norm('Меланоно')]: norm('Мелонано'),
  [norm('Любовь Это')]: norm('Любовь-это'),
  [norm('Банана-Папа')]: norm('Банана папа'),
  [norm('Какао Банель')]: norm('Какао банэль'),
}

// ── menu build
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
const kbzhuIndex = new Map()
for (const g of groups.values()) kbzhuIndex.set(KBZHU_SYNONYMS[norm(g.group)] ?? norm(g.group), g)

// category section hints: only match a KBZHU group in a section plausible for the category (avoid cross-category name collisions)
const SECTION_FOR = {
  coffee: ['Кофейные'], 'milk-tea': ['Молочный чай'], 'fruit-tea': ['Фруктовый Чай'], 'milk-cocktail': ['Милкшейки'],
  matcha: ['Матча'], frappe: ['Фраппе'], lemonade: ['Лимонады'], 'hot-tea': ['Авторский Чай'],
}
const kbzhuBySection = new Map()
for (const g of groups.values()) kbzhuBySection.set(`${g.section}|${KBZHU_SYNONYMS[norm(g.group)] ?? norm(g.group)}`, g)

const used = new Set()
const items = []
const ids = new Set()
for (const it of ITEMS) {
  const name = deYo(it.name)
  let id = `${it.cat}-${slug(name)}`
  if (ids.has(id)) throw new Error('dup id ' + id)
  ids.add(id)
  const offers = {}
  for (const letter of it.locs) {
    const loc = LOCATION_LETTERS[letter]
    const price = it.p?.[letter] ?? tierPrice(it.cat, it.tier, letter)
    if (!price) throw new Error(`no price ${it.name} ${letter}`)
    offers[loc] = { M: price[0], L: price[1] ?? null }
    if (it.dLoc?.[letter]) offers[loc].description = deYo(it.dLoc[letter])
  }
  // KBZHU
  let kb = null
  const secs = SECTION_FOR[it.cat] ?? []
  for (const s of secs) {
    const g = kbzhuBySection.get(`${s}|${norm(name)}`)
    if (g) { kb = g; used.add(g); break }
  }
  const locIds = it.locs.split('').map((l) => LOCATION_LETTERS[l])
  const altMilk = it.tier === 'alt' || !!it.altMilk
  items.push({
    id, name, category: it.cat,
    description: deYo(it.desc), temp: it.temp, altMilkBase: altMilk,
    locationIds: locIds,
    offers,
    kbzhu: kb ? kb.variants.map((v) => ({ size: v.size, temp: v.temp, protein: v.protein, fat: v.fat, carbs: v.carbs, kcal: v.kcal, source: v.rawName })) : null,
    kbzhuGroup: kb ? kb.group : null,
    source: { menu: MENU_URL, ...(kb ? { kbzhu: KBZHU_URL } : {}) },
  })
}

// classic (separate structure; KBZHU matched by name + size)
const classic = CLASSIC.items.map((c) => {
  const key = norm(c.name)
  const rows = flat.filter((f) => f.section === 'Классические' && norm(f.base) === key)
  const rows2 = rows.length ? rows : flat.filter((f) => (f.section === 'Классические' || f.section === 'Авторский Чай') && norm(f.group) === key)
  return {
    id: `classic-${slug(c.name)}`, name: deYo(c.name), sub: c.sub ? deYo(c.sub) : undefined, temp: c.temp,
    prices: c.prices,
    kbzhu: rows2.length ? rows2.map((v) => ({ size: v.size, temp: v.temp, protein: v.protein, fat: v.fat, carbs: v.carbs, kcal: v.kcal, source: v.rawName })) : null,
  }
})
for (const f of flat) if (f.section === 'Классические') used.add(groups.get(`${f.section}|${f.group}`))

// per-location stats
const stats = {}
for (const loc of Object.values(LOCATION_LETTERS)) {
  const here = items.filter((i) => i.locationIds.includes(loc))
  stats[loc] = { total: here.length, byCategory: Object.fromEntries(CATEGORIES.filter((c) => c.id !== 'classic').map((c) => [c.id, here.filter((i) => i.category === c.id).length])) }
}

const menu = {
  source: { menu: MENU_URL, kbzhu: KBZHU_URL, note: 'M = 500 мл, L = 700 мл по легенде меню' },
  categories: CATEGORIES,
  classic: { note: CLASSIC.note, allergy: CLASSIC.allergy, items: classic },
  toppings: Object.fromEntries(Object.entries(TOPPINGS).map(([cat, v]) => [cat, Object.fromEntries(Object.entries(v).flatMap(([letters, note]) => letters.split('').map((l) => [LOCATION_LETTERS[l], note])))])),
  stats,
  items,
}
out('content/data/menu.json', JSON.stringify(menu, null, 1))

// kbzhu full dump (everything incl. non-menu items & additives, verbatim)
const kbzhuOut = { source: KBZHU_URL, published: 'VK, 14 июня (год в источнике не указан)', basis: 'Размер М / L (см. легенду меню: M — 500 мл, L — 700 мл); «Тепл.» — горячий вариант. Значения даны на напиток целиком.', groups: [...groups.values()] }
out('content/data/kbzhu.json', JSON.stringify(kbzhuOut))

// ── reports
const unmatched = [...groups.values()].filter((g) => !used.has(g))
const menuNoKb = items.filter((i) => !i.kbzhu)
let md = `# Каталог меню (сгенерировано \`scripts/build-data.mjs\`)\n\nИсточник: ${MENU_URL} — 7 изображений (Озерки ×2, Максимир, Дельфин ×2, Чижова, Арена), прочитаны вручную; транскрипция: \`scripts/data/menu-source.mjs\`.\n\nM = 500 мл, L = 700 мл (легенда меню). Цены в ₽ (M / L).\n\n## Состав по точкам\n\n| Точка | Позиций (без «Классики») | Классика |\n|---|---:|---|\n`
for (const [loc, s] of Object.entries(stats)) md += `| ${loc} | ${s.total} | 7 позиций |\n`
md += `\nВсего уникальных позиций: **${items.length}** + классика (${classic.length}).\n\n`
for (const c of CATEGORIES.filter((c) => c.id !== 'classic')) {
  md += `## ${c.name}\n\n| Позиция | Точки | Цена M/L (по точкам) | КБЖУ |\n|---|---|---|---|\n`
  for (const i of items.filter((x) => x.category === c.id)) {
    const prices = [...new Set(Object.entries(i.offers).map(([l, o]) => `${o.M}${o.L ? '/' + o.L : ''}`))].map((p) => ({ p, locs: Object.entries(i.offers).filter(([, o]) => `${o.M}${o.L ? '/' + o.L : ''}` === p).map(([l]) => l[0].toUpperCase()) }))
    md += `| ${i.name} | ${i.locationIds.map((l) => l.slice(0, 3)).join(' ')} | ${prices.map((x) => `${x.p} (${x.locs.join('')})`).join('; ')} | ${i.kbzhu ? '✔ ' + i.kbzhu.length + ' вар.' : '—'} |\n`
  }
  md += '\n'
}
out('research/menu-catalog.md', md)

let kd = `# Каталог КБЖУ (сгенерировано)\n\nИсточник: ${KBZHU_URL} (VK-статья «КБЖУ»; таблица «Таблица калорийности», 14 июня).\nСтолбцы источника: Блюдо · Белки, г · Жиры, г · Углеводы, г · Ккал. Размеры: (М) и (L); «Тепл.» — горячий вариант.\nЗначения не изменялись и не округлялись.\n\n- Групп в источнике: **${groups.size}**; строк с данными: **${flat.length}**.\n- Позиций меню, для которых найдено совпадение по названию: **${items.length - menuNoKb.length} из ${items.length}**.\n- Явные опечатки источника, склеенные по синониму (документировано): ${Object.entries(KBZHU_SYNONYMS).filter(([a, b]) => a !== b).map(([a, b]) => `«${a}» → «${b}»`).join(', ')}.\n\n## Позиции меню без КБЖУ в источнике (показывается «КБЖУ не опубликовано»)\n\n${menuNoKb.map((i) => `- ${i.name} (${i.category})`).join('\n')}\n`
out('research/kbzhu-catalog.md', kd)

let un = `# KBZHU-записи без позиции в меню (unmatched)\n\nЭти строки есть в статье КБЖУ, но не совпали по названию ни с одной позицией текущих меню точек. Автоматически не присваиваются; в UI не выводятся как позиции меню.\n\n| Секция | Группа | Вариантов |\n|---|---|---:|\n`
for (const g of unmatched) un += `| ${g.section} | ${g.group} | ${g.variants.length} |\n`
out('research/unmatched-kbzhu.md', un)

console.log('items', items.length, 'classic', classic.length, 'kbzhu groups', groups.size, 'unmatched', unmatched.length, 'menu w/o kbzhu', menuNoKb.length)
console.log(JSON.stringify(stats))
console.log('UNMATCHED:', unmatched.map((g) => `${g.section}/${g.group}`).join(' | '))
console.log('NO KBZHU:', menuNoKb.map((i) => i.name).join(' | '))
