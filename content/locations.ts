import type { Location, LocationId } from './types'

// Sources: official Taplink (map links), Telegram posts (addresses/floors), mall pages (floors/hours).
// Dolphin: address «ул. Остужева, 2В» is given verbatim in the official Telegram post of 21.05.2025
// («Павильон стоит возле аттракционов») and in the client's menu file names.
// Hours: public working schedule is 10:00–22:00 daily (Telegram + Yandex Maps «Открыто до 22:00»).
// Keep hours data-driven so special / holiday schedules can be changed per point.

const daily = [{ label: 'Ежедневно', days: ['all'] as ('all' | number)[], open: '10:00', close: '22:00' }]

export const LOCATIONS: Location[] = [
  {
    id: 'ozerki',
    name: 'Озерки',
    venue: 'ЖК «Озерки»',
    address: 'ул. Адмирала Чурсина, 2/1',
    landmark: 'Вход со стороны «Пятёрочки»',
    hours: daily,
    yandexUrl: 'https://yandex.ru/maps/-/CDGJe0Ln',
    twoGisUrl: 'https://go.2gis.com/kr3cu',
    image: 'loc-ozerki',
    focus: '50% 40%',
    accent: '#7B35E8',
    openedNote: 'Первая точка сети — открылась 14 июля 2024',
  },
  {
    id: 'chizhova',
    name: 'Чижова',
    venue: 'ТРЦ «Галерея Чижова»',
    address: 'ул. Кольцовская, 35',
    floor: '4 этаж, фуд-корт',
    hours: daily,
    yandexUrl: 'https://yandex.ru/maps/org/tapiti/41716136559?si=4tj7k15w1uy5r2zbezcyapdcbm',
    twoGisUrl: 'https://go.2gis.com/l9sdq',
    image: 'loc-chizhova',
    focus: '50% 50%',
    accent: '#2FD0C4',
    openedNote: 'Официальное открытие — 22 декабря 2024',
  },
  {
    id: 'maximir',
    venue: 'ТРЦ «Максимир»',
    name: 'Максимир',
    address: 'Ленинский пр-т, 174П',
    floor: '3 этаж, FoodПАРК (фуд-корт)',
    hours: daily,
    yandexUrl: 'https://yandex.ru/maps/org/tapiti/89683830590?si=4tj7k15w1uy5r2zbezcyapdcbm',
    twoGisUrl: 'https://2gis.ru/voronezh/geo/70000001098326322',
    image: 'loc-maximir',
    focus: '50% 55%',
    accent: '#E5329E',
    openedNote: 'Открылась в феврале 2025',
  },
  {
    id: 'dolphin',
    venue: 'Парк «Дельфин»',
    name: 'Дельфин',
    address: 'ул. Остужева, 2В',
    landmark: 'Павильон возле аттракционов',
    hours: daily,
    yandexUrl: 'https://yandex.ru/maps/-/CHDIfHlu',
    twoGisUrl: 'https://2gis.ru/voronezh/geo/70000001101970714',
    image: 'loc-dolphin',
    imageNote: 'Кадр из ролика TapiTi',
    focus: '50% 30%',
    accent: '#34B35A',
    openedNote: 'Павильон в парке — с 2025 года',
  },
  {
    id: 'arena',
    venue: 'ТРЦ «Арена»',
    name: 'Арена',
    address: 'бульвар Победы, 23Б',
    floor: '3 этаж, зона фуд-корта',
    hours: daily,
    yandexUrl: 'https://yandex.ru/maps/-/CLbIRPp0',
    twoGisUrl: 'https://2gis.ru/voronezh/geo/70000001104552811',
    accent: '#FF8A3D',
    openedNote: 'Новая точка — открылась в сентябре 2025',
  },
]

export const LOCATION_IDS = LOCATIONS.map((l) => l.id) as LocationId[]
export const locationById = (id: string): Location | undefined => LOCATIONS.find((l) => l.id === id)

/** Is the point open right now? Computed for Voronezh time (UTC+3, no DST). */
export function openStatus(loc: Location, now = new Date()): { open: boolean; label: string } {
  const msk = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60000)
  const day = msk.getDay()
  const minutes = msk.getHours() * 60 + msk.getMinutes()
  const toMin = (s: string) => {
    const [h, m] = s.split(':').map(Number)
    return h * 60 + m
  }
  const slot = loc.hours.find((h) => h.days.includes('all') || h.days.includes(day))
  if (!slot) return { open: false, label: 'Сегодня закрыто' }
  const o = toMin(slot.open), c = toMin(slot.close)
  if (minutes >= o && minutes < c) return { open: true, label: `Открыто до ${slot.close}` }
  if (minutes < o) return { open: false, label: `Откроется в ${slot.open}` }
  return { open: false, label: `Закрыто до завтра, ${slot.open}` }
}

export const hoursText = (loc: Location) => loc.hours.map((h) => `${h.label} ${h.open}–${h.close}`).join(', ')
