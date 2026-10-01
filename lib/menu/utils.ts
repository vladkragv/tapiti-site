import type { KbzhuVariant, LocationId, MenuItem } from '@/content/types'

export const normText = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

export const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

/** 4.2 → «4,2» — one decimal as in the source table (values are never rounded further) */
export const num1 = (n: number | null) => (n == null ? '—' : n.toFixed(1).replace('.', ','))

export function priceFor(item: MenuItem, loc: LocationId | null) {
  if (loc && item.offers[loc]) return item.offers[loc]!
  // no location context: show the lowest known price
  const all = Object.values(item.offers)
  return all.sort((a, b) => a!.M - b!.M)[0]!
}

export const priceRange = (item: MenuItem) => {
  const ms = Object.values(item.offers).map((o) => o!.M)
  return { min: Math.min(...ms), max: Math.max(...ms) }
}

/** variant for size/temp, else null */
export function kbzhuFor(item: { kbzhu: KbzhuVariant[] | null }, size: 'M' | 'L', temp: 'cold' | 'hot') {
  return item.kbzhu?.find((v) => v.size === size && v.temp === temp) ?? null
}

/** headline kcal for a card: M, cold (or the only variant available) */
export function cardKcal(item: { kbzhu: KbzhuVariant[] | null }) {
  const v = kbzhuFor(item, 'M', 'cold') ?? kbzhuFor(item, 'M', 'hot') ?? item.kbzhu?.[0] ?? null
  return v && v.kcal != null ? { kcal: v.kcal, size: v.size } : null
}

export function matchesQuery(item: MenuItem, q: string) {
  if (!q) return true
  const hay = normText(`${item.name} ${item.description}`)
  return normText(q)
    .split(' ')
    .every((t) => hay.includes(t))
}

export const pluralPoints = (n: number) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} точке`
  return `${n} точках`
}

export const pluralPositions = (n: number) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} позиция`
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} позиции`
  return `${n} позиций`
}

export function baseOf(description: string): string | null {
  const m = description.match(/на основе (кокосового|бананового) молока|на (кокосовом|банановом) молоке|кокосовое молоко/i)
  if (!m) return null
  const w = (m[1] ?? m[2] ?? 'кокосового').toLowerCase()
  if (w.startsWith('банан')) return 'банановом молоке'
  return 'кокосовом молоке'
}
