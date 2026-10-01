// Parses reference/vk/vk_kbzhu.html (VK article "Таблица калорийности") into research/data/kbzhu.raw.json
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const html = fs.readFileSync(path.join(root, 'reference/vk/vk_kbzhu.html'), 'utf8')
const start = html.indexOf('<table')
const body = html.slice(start)
const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) =>
  [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) =>
    c[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim(),
  ),
)

const num = (s) => (s === '' || s == null ? null : Number(String(s).replace(',', '.')))
const out = []
let section = null
let group = null
for (const r of rows) {
  const cells = r.filter((_, i) => true)
  const nonEmpty = cells.filter((c) => c !== '')
  if (nonEmpty.length === 0) continue
  if (nonEmpty.length === 1) {
    // section header (Модификаторы, Кофейные...) or group header (drink name); decided later by neighbours
    out.push({ type: 'header', text: nonEmpty[0] })
    continue
  }
  if (nonEmpty.length >= 5) {
    const [name, p, f, c, k] = nonEmpty
    if (/^Блюдо$/i.test(name)) continue
    out.push({ type: 'row', name, protein: num(p), fat: num(f), carbs: num(c), kcal: num(k) })
  } else {
    out.push({ type: 'other', cells: nonEmpty })
  }
}
fs.writeFileSync(path.join(root, 'research/data/kbzhu.raw.json'), JSON.stringify(out, null, 1))
console.log('rows', rows.length, 'out', out.length, 'data rows', out.filter((o) => o.type === 'row').length)
console.log('headers', out.filter((o) => o.type === 'header').map((o) => o.text).join(' | '))
console.log('other', out.filter((o) => o.type === 'other').slice(0, 10))
