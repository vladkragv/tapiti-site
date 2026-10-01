import menuJson from './data/menu.json'
import cupsJson from './data/cups.json'
import type { CupMeta, LocationId, MenuData, MenuItem } from './types'

export const MENU = menuJson as unknown as MenuData
export const CUPS = cupsJson as unknown as Record<string, Omit<CupMeta, 'tone'>>

export const cupSrc = (id: string) => `/media/menu/${id}.webp`
export const cupTone = (id: string, l = 91, s = 78) => `hsl(${CUPS[id]?.hue ?? 280} ${s}% ${l}%)`
export const cupInk = (id: string) => `hsl(${CUPS[id]?.hue ?? 280} 62% 22%)`

export const itemById = (id: string): MenuItem | undefined => MENU.items.find((i) => i.id === id)
export const itemsForLocation = (loc: LocationId) => MENU.items.filter((i) => i.locationIds.includes(loc))
