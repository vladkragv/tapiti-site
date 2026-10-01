// Curated «real life» wall — real Telegram media only (see research/media-catalog.md).
export type WallTile =
  | { kind: 'photo'; key: string; caption: string; ratio?: 'tall' | 'wide' | 'square'; focus?: string }
  | { kind: 'video'; key: 'confetti'; caption: string; tg: string }

export const WALL_TOP: WallTile[] = [
  { kind: 'photo', key: 'guest-neon', caption: 'У вывески', ratio: 'tall' },
  { kind: 'photo', key: 'cups-counter', caption: 'Две фирменные', ratio: 'tall', focus: '50% 60%' },
  { kind: 'video', key: 'confetti', caption: 'Конфетти', tg: 'https://t.me/tapiti_vrn' },
  { kind: 'photo', key: 'lemonades', caption: 'Лимонады', ratio: 'tall' },
  { kind: 'photo', key: 'red-drink-neon', caption: 'Неон-лисёнок', ratio: 'tall', focus: '50% 40%' },
  { kind: 'photo', key: 'strawberry-mochi', caption: 'Клубника и моти', ratio: 'tall' },
  { kind: 'photo', key: 'milktea-hand', caption: 'Молочный чай', ratio: 'tall' },
]

export const WALL_BOTTOM: WallTile[] = [
  { kind: 'photo', key: 'cup-doodle-pair', caption: 'Рисунки гостей на стаканах', ratio: 'tall' },
  { kind: 'photo', key: 'sweets-wall', caption: 'Азиатские сладости', ratio: 'tall' },
  { kind: 'photo', key: 'cup-doodle-lime', caption: 'Стакан-арт', ratio: 'tall' },
  { kind: 'photo', key: 'barista-counter', caption: 'Бариста за стойкой', ratio: 'tall' },
  { kind: 'photo', key: 'cup-doodle-cat', caption: 'Котики', ratio: 'tall' },
  { kind: 'photo', key: 'cups-chocolate', caption: 'Шоколад и манго', ratio: 'tall' },
  { kind: 'photo', key: 'cup-doodle-hand', caption: 'Матча-арт', ratio: 'tall' },
]

export const MASCOT_DECK = ['fox-hug', 'fox-news', 'fox-pick', 'fox-3d'] as const
