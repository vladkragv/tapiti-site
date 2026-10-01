// Brand facts and copy. Everything here is traceable to Telegram / VK / Taplink (see research/source-audit.md).

export const BRAND = {
  name: 'TapiTi',
  full: 'TapiTi | Bubble Tea • Coffee | Воронеж',
  city: 'Воронеж',
  tagline: 'Bubble tea · coffee · lemonade',
  /** Taplink description */
  about:
    'Разнообразные бабл-ти: молочные, фруктовые, кофейные, чайные, матча. Кофе на бразильском зерне. Авторские чаи. Освежающие лимонады. Азиатские сладости.',
  payments: 'Наличные, банковская карта, оплата по QR-коду',
  links: {
    vk: 'https://vk.ru/tapiti_vrn',
    telegram: 'https://t.me/tapiti_vrn',
    tiktok: 'https://www.tiktok.com/@tapiti.bubble.tea',
    taplink: 'https://tapiti.taplink.ws/',
    menuVk: 'https://vk.ru/@tapiti_vrn-menu',
    kbzhuVk: 'https://vk.ru/@tapiti_vrn-kbzhu',
  },
  /** Real lines from the official Telegram channel (id → text) */
  quotes: {
    mix: { text: 'Главный секрет наших напитков — перемешивай их!', tg: 86, date: '26.01.2025' },
    shake: { text: 'Не бойтесь, смело трясите напитки! Они запаяны пленкой, так что ничего не прольётся.', tg: 329, date: '22.03.2026' },
    tapioca: { text: 'Тапиока — нежный деликатес с мармеладной консистенцией.', tg: 24, date: '08.08.2024' },
    arabica: { text: 'Кофе из 100% арабики, в том числе на альтернативном молоке.', tg: 10, date: '04.07.2024' },
  },
  mascot: { name: 'Тапи', description: 'Лисёнок Тапи — персонаж и лицо бренда' },
} as const

export const CATEGORY_COPY: Record<string, { lead: string; verb: string }> = {
  'milk-tea': { lead: 'Чай на молоке со сливочным кремом и шариками тапиоки или джус-боллами.', verb: 'Лопай шарики' },
  'fruit-tea': { lead: 'Зелёный, чёрный чай и каркаде с фруктами и джус-боллами.', verb: 'Лови вкус' },
  'milk-cocktail': { lead: 'Молочно-сливочные напитки: ваниль, таро, дубайский шоколад, гранола.', verb: 'Тяни медленно' },
  matcha: { lead: 'Церемониальная, розовая и голубая матча на молоке со сливками.', verb: 'Выдохни' },
  coffee: { lead: 'Кофейно-молочные напитки с кремом и тапиокой.', verb: 'Проснись' },
  frappe: { lead: 'Ледяная крошка на чае или молоке, с кремом и топпингом.', verb: 'Остынь' },
  lemonade: { lead: 'Газированные лимонады с мятой, ягодами и цитрусами.', verb: 'Освежись' },
  'hot-tea': { lead: 'Зелёный чай с фруктами и мёдом — горячим.', verb: 'Согрейся' },
  classic: { lead: 'Капучино, латте, раф, айс-латте, матча-латте и бамблы.', verb: 'Классика' },
}
