# TapiTi — сайт сети bubble tea в Воронеже

Next.js 16 (App Router) · React 19 · TypeScript · GSAP/ScrollTrigger (только на главной) · чистый CSS на токенах бренда.

Маршруты: `/` · `/menu` (меню по точкам, поиск, категории, КБЖУ) · `/locations` (5 точек, карты, график).
Заказа и доставки на сайте **нет** — они не подтверждены (см. `research/source-audit.md`, `content/ordering.ts`).

## Команды

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck
npm run lint
```

Переменная окружения (прод): `NEXT_PUBLIC_SITE_URL=https://ваш-домен` — canonical, OG, sitemap.

## Данные и пайплайны (исходники — в корне репозитория)

| Команда | Что делает | Вход → выход |
|---|---|---|
| `node scripts/parse-kbzhu.mjs` | таблица КБЖУ VK → raw JSON | `reference/vk/vk_kbzhu.html` → `research/data/kbzhu.raw.json` |
| `npm run data:build` | меню + КБЖУ → датасеты и отчёты | `scripts/data/menu-source.mjs` → `content/data/menu.json`, `kbzhu.json`, `research/*.md` |
| `node scripts/extract-cups.mjs --final public/media/menu` | вырезка стаканов из меню (прозрачный WebP) | `reference/vk/menu-*.jpg` → `public/media/menu`, `content/data/cups.json` |
| `npm run media:build` | фото из Telegram → WebP, логотип | `photos/` → `public/media/photos`, `public/brand`, `content/data/media.json` |
| `node scripts/build-brand-assets.mjs` | favicon, OG | → `app/icon.png`, `app/opengraph-image.png` |
| `scripts/qa*.mjs` | браузерная QA (Playwright + Chrome), axe | см. `research/qa-report.md` |

**Как обновить меню:** правим `scripts/data/menu-source.mjs` (цены/состав — по официальному меню VK), запускаем `npm run data:build`. Часы работы / ссылки на карты — `content/locations.ts`. Если появится официальный канал заказа — `content/ordering.ts`.

## Структура

```
app/            маршруты, layout, sitemap, robots, OG/favicon
components/     home/ (сцены) · menu/ · locations/ · layout/ · motion/ · ui/ · brand/
content/        типы, точки, меню, бренд, соцсети (+ data/*.json — генерируется)
lib/            утилиты меню, медиа
styles/         tokens · base · layout · по сценам
research/       аудит источников, каталоги, brand/motion/site-plan, QA
reference/vk/   сохранённые источники (HTML статей VK, 7 изображений меню)
scripts/        пайплайны и QA
```

Исходные экспорты Telegram (`photos/`, `video_files/`, `round_video_messages/`, `messages.html`, `меню/`) лежат в корне и в репозиторий **не входят** (2 ГБ) — `.gitignore`.
