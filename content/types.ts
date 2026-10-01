export type LocationId = 'ozerki' | 'chizhova' | 'maximir' | 'dolphin' | 'arena'

export type Location = {
  id: LocationId
  /** short name used in selectors */
  name: string
  /** venue / complex */
  venue: string
  address: string
  floor?: string
  landmark?: string
  /** data-driven schedule: hours[day 0=Sun..6=Sat] -> [open, close] in minutes from midnight (Voronezh, UTC+3) */
  hours: { label: string; days: ('all' | number)[]; open: string; close: string }[]
  yandexUrl: string
  twoGisUrl: string
  /** key into content/data/media.json; undefined → typographic tile (no photo exists) */
  image?: string
  imageNote?: string
  /** object-position for the cover crop */
  focus?: string
  /** colour used for the location accent */
  accent: string
  openedNote?: string
}

export type CategoryId =
  | 'milk-tea'
  | 'fruit-tea'
  | 'milk-cocktail'
  | 'matcha'
  | 'coffee'
  | 'frappe'
  | 'lemonade'
  | 'hot-tea'
  | 'classic'

export type Category = { id: CategoryId; name: string; short: string; motif: string }

export type KbzhuVariant = {
  size: 'M' | 'L' | `${number} мл` | null
  temp: 'cold' | 'hot'
  protein: number | null
  fat: number | null
  carbs: number | null
  kcal: number | null
  /** verbatim row name from the source table */
  source: string
}

export type Offer = { M: number; L: number | null; description?: string }

export type MenuItem = {
  id: string
  name: string
  category: Exclude<CategoryId, 'classic'>
  description: string
  temp: 'both' | 'cold' | 'hot'
  altMilkBase: boolean
  locationIds: LocationId[]
  offers: Partial<Record<LocationId, Offer>>
  kbzhu: KbzhuVariant[] | null
  kbzhuGroup: string | null
  source: { menu: string; kbzhu?: string }
}

export type ClassicItem = {
  id: string
  name: string
  sub?: string
  temp: 'both' | 'cold' | 'hot'
  prices: Record<string, number>
  kbzhu: KbzhuVariant[] | null
}

export type MenuData = {
  source: { menu: string; kbzhu: string; note: string }
  categories: Category[]
  classic: { note: string; allergy: string; items: ClassicItem[] }
  toppings: Partial<Record<'frappe' | 'lemonade', Partial<Record<LocationId, string>>>>
  stats: Record<LocationId, { total: number; byCategory: Record<string, number> }>
  items: MenuItem[]
}

export type OrderingConfig = {
  mode: 'none' | 'pickup' | 'delivery' | 'external'
  url?: string
  label?: string
}

export type CupMeta = { w: number; h: number; tone: string; hue: number }
