# TapiTi — MENU UX + MOTION / ART DIRECTION SYSTEM

## 1. Core design goal

Сайт должен выглядеть как digital-представительство живого bubble tea бренда.

Не как:

- интернет-магазин;
- ресторанный каталог;
- шаблонный café landing;
- showcase animation website без usability.

Visual formula:

**real photography + playful Asian beverage mood + editorial composition + tactile UI + character personality + controlled motion**.

---

# 2. Visual language

После media audit создай 5–8 design tokens, которые реально следуют материалам бренда.

Не ограничивайся логотипными цветами.

Пусть палитра отражает:

- реальные напитки;
- фирменную упаковку;
- интерьер;
- typography;
- фотографии.

Используй CSS variables:

```css
--color-ink
--color-paper
--color-brand-primary
--color-brand-secondary
--color-accent
--color-muted
--color-surface
```

Если реальные материалы показывают другой visual system — меняй гипотезу.

---

# 3. Typography

Нужно выбрать typography intentionally.

Правила:

- один выразительный display face;
- один highly-readable UI/body face;
- минимум начертаний;
- хорошая кириллица;
- не использовать Inter/Roboto просто по привычке.

Типографика должна создавать характер еще до анимации.

---

# 4. Navigation

### Desktop

Header должен быть compact.

Пример:

```text
TapiTi     Меню     Точки     О TapiTi       VK  TG
```

Но итоговая композиция должна зависеть от research.

### Mobile

Не стандартный generic hamburger + centered logo.

Допустимы:

- compact brand mark;
- slide menu;
- bottom action bar для меню/точек, если это улучшает UX.

Главное: navigation не должна конкурировать с content.

---

# 5. HOME PAGE — STORY ARC

## Scene A — Hero

Цель: мгновенная brand recognition.

Используй:

- реальное фото/видео напитка;
- краткий brand statement;
- city signal: Воронеж;
- CTA на menu;
- CTA на locations.

### Motion

- foreground/background depth;
- gentle image drift;
- text entrance;
- floating ingredient/mascot elements при наличии реального asset.

Не использовать 7 независимых floating elements просто «для красоты».

---

## Scene B — Scroll transformation

Переход из hero в следующую section не должен быть просто fade.

Варианты:

- viewport-cropped image expands;
- cup becomes central object;
- background transitions from photo to brand color;
- typography scales into next scene.

Цель — эффект continuity.

---

## Scene C — Product categories

Каждая категория может иметь свой visual motif:

- Bubble Tea → liquid / boba / circular motion;
- Matcha → calm vertical reveal;
- Coffee → darker editorial crop;
- Lemonade → fruit / light / horizontal sweep;
- Frappe → creamy zoom;
- Asian sweets → collage.

Не нужно буквально изображать эти идеи, если media archive подскажет лучшие варианты.

---

# 6. MENU PAGE — PREMIUM PRODUCT CATALOG

## Header

Сделай menu page самодостаточной.

На первом экране должны быть:

- title;
- короткий copy;
- location selector;
- category navigation.

## Category navigation

Sticky только там, где это действительно удобно.

Примеры:

```text
Все
Bubble Tea
Молочные
Фруктовые
Чаи
Матча
Кофе
Лимонады
Фраппе
Сладости
```

Использовать только реально подтвержденные categories.

---

# 7. Product card design

Не делать:

```text
[rounded card]
image
name
price
```

тысячу раз.

Вариант системы:

- large editorial image;
- тонкий metadata row;
- category label;
- title with character typography;
- price anchored in visual composition;
- small KBZHU indicator.

Cards могут быть разных пропорций, но сетка должна сохранять rhythm.

---

# 8. Product detail interaction

При клике:

### Desktop

Large modal / side sheet.

### Mobile

Bottom sheet / full-screen detail.

Содержимое:

```text
[large photo]

Название
Короткое описание

500 мл     290 ₽

КБЖУ
287 ккал · Б 4,2 · Ж 7,1 · У 46,8

[похожие]
```

Если позиции без KBZHU — не рисовать пустой блок.

---

# 9. Location selector

Location selection должна ощущаться как часть бренда.

Не простой `<select>`.

Можно использовать:

- segmented control;
- pill tabs;
- map/list split;
- horizontal card rail.

Но usability важнее visual trick.

Выбранная точка должна сразу влиять на menu availability.

---

# 10. Locations scene

Страница `/locations`:

### Desktop

Сильная split-layout:

```text
[visual / map] [location cards]
```

или

```text
[large location]
[other 4 as rail]
```

### Mobile

Сначала список точек, затем map/route CTA.

Не заставляй пользователя читать карту ради понимания адреса.

---

# 11. Motion system — принцип

**Разные scenes = разные motion behaviors.**

Минимальный набор из 7 разных типов:

### 01 Hero depth

Parallax layers.

### 02 Image mask reveal

Real product image раскрывается маской.

### 03 Typography scale transition

Большое слово/название плавно трансформируется в следующую scene.

### 04 Horizontal category movement

Pinned section с движением по X только там, где оно не мешает mobile.

### 05 Product card choreography

Несколько cards входят с разными delays, но в одной rhythm system.

### 06 Location interaction

Selected location меняет масштаб / position / highlight.

### 07 Social gallery

Asymmetric staggered reveal.

Дополнительно:

### 08 Mascot path motion

Только если real mascot asset позволяет.

---

# 12. Motion timing

Базовые токены:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

Ориентиры:

```text
100–160ms   micro
160–260ms   UI
260–500ms   large component
500ms+      marketing / scroll scene only when justified
```

Не превращай весь сайт в slow motion.

---

# 13. ScrollTrigger / GSAP guidance

Используй GSAP ScrollTrigger только там, где нужен:

- pin;
- scrub;
- timeline across section;
- transform choreography.

Не использовать GSAP для каждого opacity animation.

Простой UI — CSS.

Complex scroll scene — GSAP.

---

# 14. Parallax rules

Parallax должен иметь depth logic.

Не делай:

```text
все элементы translateY(-30px)
```

Лучше:

- background slow;
- product medium;
- foreground fast;
- text almost static.

Ограничивай movement на mobile.

---

# 15. Hover / microinteractions

Desktop:

- image crop shift;
- subtle scale;
- text offset;
- border or background response;
- product detail hint.

Touch devices:

не полагаться на hover.

Buttons должны иметь press feedback:

```css
transform: scale(.97)
```

в пределах разумного.

---

# 16. Avoid animation spam

Нельзя одновременно:

- moving background;
- floating bubbles;
- cursor follower;
- text distortion;
- 3D tilt;
- marquee;
- blur;
- scroll reveal.

Только потому, что это возможно.

Каждый эффект должен отвечать на вопрос:

> Что пользователь должен почувствовать / понять благодаря этому?

---

# 17. Reduced motion

Для `prefers-reduced-motion: reduce`:

- remove parallax;
- remove scrub;
- remove path movement;
- remove non-essential scale/rotation;
- preserve content;
- preserve essential state changes.

Motion должен деградировать gracefully.

---

# 18. Media art direction

Используй:

```css
object-fit: cover;
object-position: ...;
```

Но object-position должен быть указан based on focal point.

Например:

```text
hero drink → 50% 62%
mascot → 50% 35%
product cup → 52% 48%
```

Не использовать blind center crop для всего.

---

# 19. Social / UGC section

Собери из Telegram/VK archive best-of media.

Не показывай случайные 40 thumbnails.

Сделай curated selection:

- products;
- people;
- atmosphere;
- points;
- playful content.

Клик должен позволять посмотреть asset крупнее.

---

# 20. Design anti-patterns

Запрещены без особой причины:

- giant rounded cards everywhere;
- default glassmorphism;
- purple gradient background everywhere;
- Inter everywhere;
- excessive shadows;
- excessive pills;
- 3D tilt on every card;
- animated grain everywhere;
- cursor follower on mobile;
- one animation copied across every section.

---

# 21. Final visual benchmark

Перед final QA задай себе:

### Brand

«Можно ли увидеть screenshot без logo и понять, что это TapiTi?»

### Menu

«Можно ли за 10–15 секунд понять, что здесь есть и сколько это стоит?»

### Locations

«Можно ли быстро найти удобную точку?»

### Motion

«Каждая animation помогает content или только показывает техническую возможность?»

### Mobile

«Это полноценный мобильный продукт или просто desktop, сжатый до 390px?»

Если ответ плохой — переделывать.
