# TapiTi — MASTER PROMPT FOR CLAUDE CODE / SONNET 5.5

Ты работаешь над реальным коммерческим сайтом сети **TapiTi | Bubble Tea • Coffee | Воронеж**.

Твоя задача — спроектировать и реализовать не «красивый лендинг с эффектами», а полноценный брендовый сайт сети из пяти точек. Сайт должен одновременно:

- передавать настоящий характер TapiTi;
- позволять быстро и приятно изучить меню;
- показывать КБЖУ для позиций там, где оно указано в официальных материалах;
- помогать выбрать удобную точку в Воронеже;
- использовать реальные фото и видео бренда;
- иметь сильную motion/design-engineering составляющую;
- выглядеть как работа профессиональной студии, а не как generic AI website;
- быть быстрым, адаптивным, доступным и поддерживаемым.

## 0. РЕЖИМ РАБОТЫ: СНАЧАЛА ИССЛЕДОВАНИЕ

**Не начинай реализацию до завершения research phase.**

Сначала:

1. Прочитай этот файл и все остальные 3 файла из пакета.
2. Изучи структуру текущего репозитория.
3. Найди Telegram export: `reference/telegram_export/`.
4. Найди VK materials: `reference/vk/`.
5. Найди brand assets: `reference/brand/`.
6. Получи и изучи два обязательных VK-источника:
   - `https://vk.ru/@tapiti_vrn-menu`
   - `https://vk.ru/@tapiti_vrn-kbzhu`
7. Изучи публичные источники TapiTi, указанные в `01_RESEARCH_AND_SOURCE_OF_TRUTH.md`.
8. Проверь, нет ли delivery/order канала, который можно подтвердить.
9. Создай исследовательский отчет.
10. Сформируй design direction.
11. Сформируй IA + content model.
12. Только после этого начинай код.

Создай в проекте папку `research/` и как минимум:

```text
research/
  source-audit.md
  telegram-inventory.md
  media-catalog.md
  menu-catalog.md
  kbzhu-catalog.md
  brand-direction.md
  motion-direction.md
  site-plan.md
```

Не плодись дубликатами: если соответствующие файлы уже есть — обнови их.

---

# 1. SOURCE OF TRUTH — ПОРЯДОК ПРИОРИТЕТОВ

При конфликте данных используй такой приоритет:

1. **официальное меню TapiTi в VK**;
2. **официальный пост/статья TapiTi с КБЖУ в VK**;
3. **материалы из Telegram export TapiTi**;
4. **официальное сообщество VK TapiTi**;
5. **официальный Taplink**;
6. **официальные страницы ТРЦ / картографические карточки**;
7. сторонние каталоги — только для проверки, никогда не для выдумывания контента.

Если данные не подтверждены, не выдумывай их.

Особенно запрещено придумывать:

- цены;
- КБЖУ;
- ингредиенты;
- объемы;
- наличие позиции в конкретной точке;
- доставку;
- адрес или этаж;
- обещания вроде «доставка за 30 минут»;
- отзывы;
- акции;
- nutritional claims.

---

# 2. TELEGRAM EXPORT — ПРОЙТИСЬ ПО ВСЕМУ АРХИВУ

Telegram export — главный источник атмосферы и реального visual language бренда.

Не ограничивайся последними постами. Если в архиве сотни сообщений — анализируй весь архив системно.

Извлеки:

### Контент

- названия напитков;
- категории;
- описания;
- цены, если опубликованы;
- сезонные позиции;
- новинки;
- промо;
- названия ингредиентов;
- повторяющиеся темы;
- CTA;
- характерные фразы;
- эмодзи и стиль tone of voice.

### Визуал

- логотип;
- лисёнка Тапи;
- стаканы и фирменную упаковку;
- интерьер / формат точек;
- продукты крупным планом;
- фрукты;
- тапиоку;
- джус-боллы;
- матча;
- кофе;
- чай;
- лимонады;
- азиатские сладости;
- людей / команду;
- outdoor / location visuals;
- все повторяющиеся графические мотивы.

### Для каждого значимого media asset определи

- тип;
- дата;
- источник;
- продукт/категория;
- пригодность для hero;
- пригодность для mobile;
- пригодность для card;
- цветовую палитру;
- dominant composition;
- наличие человека / руки / стакана / mascot;
- можно ли сделать loop из видео;
- нужен ли crop / object-position.

Используй `ffmpeg` для видео, если он есть.

Для видео выделяй несколько кадров и ищи естественные loop-сегменты.

Не публикуй тяжелые оригиналы без необходимости: подготовь web-friendly версии.

---

# 3. VK MENU + KBZHU — ОБЯЗАТЕЛЬНО ДО КОДА

Два источника критичны для проекта:

```text
MENU:
https://vk.ru/@tapiti_vrn-menu

KBZHU:
https://vk.ru/@tapiti_vrn-kbzhu
```

Твоя задача — превратить их в структурированный dataset.

## 3.1 MENU

VK-статья с меню разделяет ассортимент по точкам. Сохрани это разделение.

Для каждой точки сформируй полный список:

```ts
{
  locationId,
  category,
  itemId,
  name,
  description,
  price,
  volume,
  availability,
  sourceUrl,
  sourceLocation,
  imageCandidates,
}
```

Нельзя превращать пять меню в одно неразличимое меню.

UX должен позволять:

- выбрать точку;
- видеть меню именно этой точки;
- увидеть common items во всей сети;
- понимать, если позиция отсутствует в выбранной точке;
- быстро искать позицию;
- фильтровать по категории;
- открыть подробности.

## 3.2 KBZHU

Из VK-источника с КБЖУ извлеки **все доступные значения**, а не только несколько примеров.

Минимальная структура:

```ts
{
  itemId,
  canonicalName,
  kcal,
  protein,
  fat,
  carbs,
  serving,
  basis,
  notes,
  sourceUrl,
}
```

Не меняй значения. Не округляй без необходимости.

Если источник прямо говорит, что значение рассчитано на порцию / объем / конкретный вариант — сохрани basis.

Если КБЖУ относится к конкретному объему или рецепту, не показывай его так, будто это значение для всех вариаций.

Если для topping/add-on КБЖУ не рассчитано отдельно — не вычисляй его сам.

### Отображение КБЖУ в UI

КБЖУ должно быть частью product details, но не превращать карточки в таблицу диетического приложения.

Возможный паттерн:

```text
Калории  287 ккал
Б         4.2 г
Ж         7.1 г
У        46.8 г
```

Визуально это может быть компактный row / pill group / раскрывающийся блок.

На mobile блок должен оставаться читаемым.

---

# 4. DELIVERY — НИКАКИХ ВЫДУМАННЫХ ONLINE ORDERS

Перед реализацией отдельно проверь:

- официальный Taplink;
- VK;
- Telegram;
- Яндекс Еда / иные food-delivery площадки, если TapiTi присутствует;
- 2ГИС / карты;
- официальные ссылки из социальных профилей.

На момент подготовки этой документации публичные источники подтверждают самовывоз/напитки с собой, но **не дают надежного подтверждения собственной доставки TapiTi**. Официальный Taplink описывает точки, ассортимент, оплату и контакты, но не заявляет доставку; в открытых карточках TapiTi также не было надежного подтверждения delivery. Поэтому **по умолчанию проектируй сайт как menu + locations без корзины и checkout**.

Если во время research будет найден подтвержденный актуальный канал заказа с доставкой, переключи модель:

```ts
ordering.mode = 'delivery'
```

и добавь только реальную ссылку/интеграцию.

Если найден только онлайн-предзаказ без доставки — это другой режим и должен быть явно обозначен.

Никогда не рисуй фейковую кнопку «Заказать» ради UX.

---

# 5. БРЕНД — ЧТО НУЖНО ПЕРЕДАТЬ

TapiTi — сеть напиточных точек Воронежа с общим брендовым миром.

Из публичных материалов уже подтверждаются:

- Bubble Tea;
- лимонады;
- кофе;
- авторские чаи;
- фраппе;
- матча;
- азиатские сладости;
- широкий выбор напитков;
- натуральные ингредиенты / свежие фрукты как важная часть коммуникации;
- азиатские мотивы;
- уютная атмосфера;
- лисёнок Тапи.

Бренд не нужно превращать в:

- шаблонный «kawaii bubble tea»;
- японский ресторан;
- аниме-сайт;
- красно-черный китайский шаблон;
- неоновый cyberpunk;
- generic pastel café;
- набор rounded cards + gradient background.

Базовая design hypothesis:

> **Playful Asian beverage editorial**

Но после Telegram/VK audit ты обязан самостоятельно уточнить, насколько эта гипотеза совпадает с реальными материалами бренда.

---

# 6. САЙТ — АРХИТЕКТУРА

Минимальный production scope:

```text
/
/menu
/locations
```

Дополнительные маршруты нужны только если реально улучшают продукт.

## Главная

### Scene 01 — Hero

Нужно сразу понять:

- TapiTi;
- bubble tea / drinks;
- Воронеж;
- сеть, а не одна точка;
- бренд веселый, живой, визуальный.

Используй реальный media.

Hero должен работать даже без видео.

### Scene 02 — Signature visual story

Сильная editorial/composition scene: напиток + texture + короткий copy + movement.

### Scene 03 — «Что у нас есть»

Не просто список. Покажи категории через визуальные переходы:

- Bubble Tea;
- Tea / Matcha;
- Coffee;
- Lemonades;
- Frappe;
- Asian sweets;
- другие категории из официального меню.

### Scene 04 — Menu teaser

Показать несколько реальных позиций.

CTA → `/menu`.

### Scene 05 — TapiTi locations

Показать 5 точек как сеть.

Карточка каждой точки:

- название;
- venue;
- адрес;
- этаж/ориентир;
- часы;
- карта/route;
- ссылка на соответствующее меню;
- фото точки, если есть.

### Scene 06 — Social / real life

Использовать реальный Telegram/VK media wall. Не fake stock gallery.

### Scene 07 — Brand / mascot

Лисёнок Тапи — не случайная иконка. Используй его как брендовый эмоциональный anchor, если реальные assets это позволяют.

### Footer

- соцсети;
- все 5 точек;
- часы;
- ссылка на меню;
- контакты;
- юридическая информация, если она предоставлена.

---

# 7. MENU — ЭТО НЕ «ТАБЛИЦА ЦЕН»

Страница `/menu` — один из центральных продуктов сайта.

Нужны:

### Верхняя панель

- location selector;
- search;
- категории;
- при необходимости фильтры.

### Item cards

Карточка должна содержать:

- реальное изображение;
- название;
- краткое описание;
- цену;
- объем, если подтвержден;
- визуальные tags, если подтверждены;
- доступность в выбранной точке.

### Product detail

По клику открыть modal / drawer / route-state.

Показывать:

- крупное фото;
- название;
- описание;
- объем;
- цену;
- КБЖУ;
- состав только при наличии в источнике;
- dietary / allergen notes только при наличии официального источника;
- похожие позиции.

### ВАЖНО

Это **read-only menu**, пока delivery/order не подтвержден.

Не создавать корзину, fake checkout, fake customization, если это не соответствует реальной модели бизнеса.

---

# 8. FIVE LOCATIONS — КЛЮЧЕВОЕ UX

Подтвержденные точки:

1. **ЖК «Озерки»** — ул. Адмирала Чурсина, 2/1, вход со стороны «Пятёрочки».
2. **ТРЦ «Галерея Чижова»** — ул. Кольцовская, 35, 4 этаж, фуд-корт.
3. **ТРЦ «Максимир»** — Ленинский пр-т, 174П, 3 этаж, FoodПАРК.
4. **Парк «Дельфин»** — точка в парке. Точный адрес не выдумывать; использовать подтвержденные данные.
5. **ТРЦ «Арена»** — бульвар Победы, 23Б, 3 этаж, зона фуд-корта.

Рабочий публичный график — ежедневно 10:00–22:00; хранить его только в data model, чтобы можно было менять по точкам.

---

# 9. MOTION — МНОГО, НО НЕ ОДИНАКОВО

Пользователь прямо ожидает сильные анимации при скроллинге.

Но правило:

> **Каждая крупная scene должна иметь собственную motion idea.**

Нельзя повторять одну и ту же `fade + translateY` анимацию 12 раз.

Пример motion language:

### Hero

Глубокий parallax + media crop drift + subtle floating object.

### Product story

Image mask reveal / clip-path / scale-to-focus.

### Category scene

Horizontal movement / layered cards / pinned section.

### Menu teaser

Asymmetric card choreography + image zoom.

### Locations

Map / cards transition, где выбранная точка visually becomes active.

### Social wall

Film-strip / staggered masonry reveal.

### Mascot

Небольшое character motion / path movement, если реальный asset это позволяет.

### Footer

Минимальная, почти статическая motion scene.

---

# 10. MOTION QUALITY RULES

Используй разные easing и durations по назначению.

Общие ориентиры:

- micro interaction: 100–180ms;
- стандартный UI: 150–300ms;
- крупные marketing scenes: могут быть длиннее, но не должны ощущаться вязкими.

По умолчанию:

- enter/exit → ease-out;
- movement/morph → ease-in-out;
- hover/color → ease;
- постоянное движение → linear только там, где оно физически логично.

Избегай:

- постоянного bounce;
- огромных blur;
- animation of layout properties без необходимости;
- сложных JS re-renders every frame.

Основное правило производительности:

> преимущественно `transform` + `opacity`.

---

# 11. RESPONSIVE MOTION

Desktop и mobile — это разные композиции.

На mobile:

- меньше параллакса;
- меньше pinning;
- не перекрывай content;
- не делай горизонтальные scroll scenes, которые мешают пальцу;
- при необходимости упрощай scene вместо тупого уменьшения.

Обязательно:

```css
@media (prefers-reduced-motion: reduce) {
  /* eliminate non-essential motion */
}
```

---

# 12. ТЕХНОЛОГИЧЕСКАЯ СТРАТЕГИЯ

Если репозиторий уже использует подходящий стек — сохрани его.

Если проект создается с нуля, базовый вариант:

- Next.js App Router;
- TypeScript;
- Tailwind CSS 4;
- CSS variables for tokens;
- GSAP + ScrollTrigger для сложных scroll scenes;
- Motion/Framer Motion только там, где это действительно удобнее;
- `next/image`;
- `next/font`;
- semantic HTML.

Не подключай несколько animation frameworks только ради моды.

Выбери единый основной подход для сложных scenes.

---

# 13. SKILLS — ИСПОЛЬЗОВАТЬ УМНО

Перед реализацией проверь и при необходимости установи актуальные skills:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/emilkowalski/skills --skill emil-design-eng
npx skills add https://github.com/vercel-labs/open-agents --skill web-animation-design
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```

Для финального quality pass, при наличии среды:

```bash
npx skills add https://github.com/pbakaus/impeccable --skill impeccable
```

Используй skills как design/QA guidance, а не как шаблон сайта.

Можно точечно смотреть:

- Aceternity UI;
- React Bits;
- Magic UI;
- другие актуальные UI sources.

Разрешено перенимать:

- механику взаимодействия;
- motion principle;
- техническую реализацию;
- информационную архитектуру.

Запрещено копировать:

- целиком page;
- фирменный стиль;
- чужой mascot;
- чужие тексты;
- уникальную композицию один в один.

---

# 14. CONTENT / DATA MODEL

Данные должны быть отделены от UI.

Минимальные сущности:

```ts
export type LocationId =
  | 'ozerki'
  | 'chizhova'
  | 'maximir'
  | 'dolphin'
  | 'arena'

export type MenuItem = {
  id: string
  canonicalName: string
  category: string
  description?: string
  price?: number | null
  volume?: string | null
  image?: string | null
  locationIds: LocationId[]
  availabilityNote?: string
  featured?: boolean
  seasonal?: boolean
  kbzhu?: {
    kcal?: number | string
    protein?: number | string
    fat?: number | string
    carbs?: number | string
    serving?: string
    basis?: string
  }
  source?: {
    menuUrl?: string
    kbzhuUrl?: string
    telegramPost?: string
  }
}
```

Отдельно:

```ts
export type OrderingConfig = {
  mode: 'none' | 'pickup' | 'delivery' | 'external'
  url?: string
  label?: string
}
```

По умолчанию `mode: 'none'` до подтверждения актуального online ordering.

---

# 15. IMAGE / VIDEO RULES

Используй в первую очередь реальные source media.

Приоритет:

1. реальные фото и видео TapiTi;
2. официальные brand assets;
3. аккуратные neutral UI textures;
4. генерация изображений — только если без нее реально невозможно закрыть композиционную дыру и это не маскирует отсутствие реального контента.

Не делай сайт из AI-generated fake food, если реальное media доступно.

Для каждого ключевого media подумай:

- desktop crop;
- tablet crop;
- mobile crop;
- focal point;
- preload / lazy-load.

---

# 16. PERFORMANCE

Цель — ощущение дорогого сайта, а не дорогого jank.

Обязательно:

- responsive images;
- WebP/AVIF там, где уместно;
- poster frames для video;
- lazy-load below-the-fold;
- `muted`, `playsInline`, `loop` для decorative video;
- не грузить одновременно десятки тяжелых videos;
- не держать бесконечные `requestAnimationFrame` loops без необходимости;
- не анимировать layout properties без крайней причины;
- не добавлять dependency только ради одной мелочи.

---

# 17. ACCESSIBILITY

Обязательно:

- keyboard navigation;
- visible focus;
- semantic buttons/links;
- dialog focus trap;
- `aria` только по необходимости;
- meaningful alt text;
- decorative images marked appropriately;
- reduced motion;
- достаточный contrast;
- минимум 44px target для важных touch targets.

---

# 18. SEO

Добавь:

- title;
- description;
- OG image;
- favicon;
- canonical;
- sitemap/robots при необходимости;
- JSON-LD для реальных verified business/location data, если schema подходит.

Не вставляй ложные rating/review counts.

---

# 19. VISUAL QA — ОБЯЗАТЕЛЬНО

После реализации не останавливайся на `npm run build`.

Проверь минимум:

- 1440×900;
- 1280×800;
- 1024×768;
- 768×1024;
- 390×844;
- 375×812.

Проверь:

- no horizontal overflow;
- hero crop;
- sticky elements;
- menu filter behavior;
- menu detail modal/drawer;
- five locations;
- map links;
- mobile header;
- menu page;
- all images;
- all videos;
- no console errors;
- no broken network requests;
- reduced motion;
- keyboard navigation.

Если доступен browser tooling — используй его.

Сделай минимум два visual refinement pass после первого рабочего варианта.

---

# 20. DEFINITION OF DONE

Считай проект готовым только когда:

- сайт визуально узнаваем как TapiTi;
- ощущается именно сеть из 5 точек;
- меню действительно удобно читать;
- меню разделено по точкам;
- КБЖУ встроено корректно;
- нет придуманных данных;
- delivery не заявлен без подтверждения;
- используется реальный source media;
- animation system разнообразная, а не повторяющаяся;
- motion не мешает UX;
- mobile выглядит спроектированным отдельно;
- build проходит;
- lint/typecheck проходят;
- нет runtime/console errors;
- выполнен финальный accessibility + design audit.

### Самое важное

**Не пытайся просто написать много красивого кода.**

Сначала пойми, почему TapiTi выглядит и ощущается именно так.

Потом преврати это в систему:

**brand → content → menu → locations → motion → UI → implementation → QA.**

Только так сайт будет выглядеть как настоящий брендовый digital product, а не как AI-generated template.
