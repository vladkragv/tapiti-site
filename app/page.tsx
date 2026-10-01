import { Assemble } from '@/components/home/Assemble'
import { Categories, type CatPanel } from '@/components/home/Categories'
import { Hero } from '@/components/home/Hero'
import { Mascot } from '@/components/home/Mascot'
import { BigFive, HomePlaces } from '@/components/home/Places'
import { Story } from '@/components/home/Story'
import { Teaser, type TeaserItem } from '@/components/home/Teaser'
import { Wall } from '@/components/home/Wall'
import { MotionBoot } from '@/components/motion/MotionBoot'
import { CATEGORY_COPY } from '@/content/brand'
import { CUPS, MENU, itemById } from '@/content/menu'
import { cardKcal, priceRange } from '@/lib/menu/utils'
import type { CategoryId } from '@/content/types'

const STYLE: Record<CategoryId, { motif: CatPanel['motif']; bg: string; fg: string; accent: string; cups: string[] }> = {
  'milk-tea': { motif: 'bubble', bg: '#e6d4ff', fg: '#1b0a3a', accent: '#7b35e8', cups: ['milk-tea-yagodnaya-zhvachka', 'milk-tea-tapi-blyu', 'milk-tea-lav-malina'] },
  'fruit-tea': { motif: 'fruit', bg: '#ff8272', fg: '#2a0a12', accent: '#d12790', cups: ['fruit-tea-siyanie', 'fruit-tea-ekzotik-frukt', 'fruit-tea-lesnye-yagody'] },
  matcha: { motif: 'calm', bg: '#c3e981', fg: '#14290a', accent: '#2a7a1f', cups: ['matcha-smurfito', 'matcha-fistashechka', 'matcha-flamingo'] },
  coffee: { motif: 'dark', bg: '#2b1a16', fg: '#ffe9d2', accent: '#ffb36b', cups: ['coffee-kofeynyy-tapi', 'coffee-dubayskiy-sheyk', 'coffee-karibskaya-chernika'] },
  'milk-cocktail': { motif: 'cream', bg: '#ffe8cb', fg: '#3a1a0a', accent: '#d12790', cups: ['milk-cocktail-dubayskaya-malina', 'milk-cocktail-klubnyashka', 'milk-cocktail-baunti'] },
  frappe: { motif: 'ice', bg: '#bfe9ff', fg: '#0b2a4a', accent: '#2f6bff', cups: ['frappe-krem-kiss', 'frappe-greypi-blyu', 'frappe-fistashka-ays'] },
  lemonade: { motif: 'light', bg: '#e8f45c', fg: '#1b2a05', accent: '#5a8a00', cups: ['lemonade-laguna', 'lemonade-kryzhivik', 'lemonade-tropik-lav'] },
  'hot-tea': { motif: 'warm', bg: '#ffb56e', fg: '#2e1404', accent: '#c4411e', cups: ['hot-tea-limon-malina', 'hot-tea-mango-marakuyya', 'hot-tea-smorodina-myata'] },
  classic: { motif: 'classic', bg: '#2e1766', fg: '#ffffff', accent: '#2fd0c4', cups: [] },
}
const ORDER: CategoryId[] = ['milk-tea', 'fruit-tea', 'matcha', 'coffee', 'milk-cocktail', 'frappe', 'lemonade', 'hot-tea', 'classic']

const TEASER_IDS = [
  'matcha-zaklyate-lesa',
  'fruit-tea-tropi-trio',
  'milk-tea-vzryv-karameli',
  'lemonade-tri-lya-lya',
  'milk-cocktail-klubnyashka',
  'fruit-tea-vinolaym',
  'coffee-dubayskiy-sheyk',
]

export default function HomePage() {
  const panels: CatPanel[] = ORDER.map((id) => {
    const cat = MENU.categories.find((c) => c.id === id)!
    const s = STYLE[id]
    const count = id === 'classic' ? MENU.classic.items.length : MENU.items.filter((i) => i.category === id).length
    return {
      id,
      name: cat.name,
      lead: CATEGORY_COPY[id].lead,
      verb: CATEGORY_COPY[id].verb,
      count,
      motif: s.motif,
      bg: s.bg,
      fg: s.fg,
      accent: s.accent,
      cups: s.cups,
      words: id === 'classic' ? ['Капучино', 'Латте', 'Раф', 'Айс-латте', 'Матча-латте', 'Бамбл'] : undefined,
    }
  })

  const teaser: TeaserItem[] = TEASER_IDS.map((id) => {
    const it = itemById(id)!
    const k = cardKcal(it)
    return {
      id,
      name: it.name,
      category: MENU.categories.find((c) => c.id === it.category)!.short,
      from: priceRange(it).min,
      kcal: k?.kcal ?? null,
      size: k?.size ?? null,
      hue: CUPS[id]?.hue ?? 280,
    }
  })

  const drinks = MENU.items.length + MENU.classic.items.length

  return (
    <>
      <Hero drinks={drinks} />
      <Assemble />
      <Story />
      <Categories panels={panels} />
      <Teaser items={teaser} />
      <BigFive />
      <HomePlaces />
      <Wall />
      <Mascot />
      <MotionBoot />
    </>
  )
}
