import type { OrderingConfig } from './types'

/**
 * Ordering model.
 *
 * Research result (2026-10-01): official channels — Taplink, VK community, Telegram, Yandex Maps card of the
 * mall points — do NOT confirm TapiTi delivery or an online ordering service. Yandex Maps lists «Самовывоз»
 * (pickup at the counter) only. No cart, no checkout, no fake «Заказать» button.
 *
 * If an official order channel appears, switch to:
 *   { mode: 'external', url: 'https://…verified…', label: 'Заказать' }
 * and the header/menu will render a real link — nothing else in the UI has to change.
 */
export const ordering: OrderingConfig = { mode: 'none' }
