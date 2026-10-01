# TapiTi — TECHNICAL SYSTEM / SKILLS / CONTENT MODEL / QA

## 1. Recommended project stack

Если текущий repo уже использует совместимый стек — не переписывай его без причины.

Для greenfield:

- Next.js App Router;
- TypeScript;
- Tailwind CSS 4;
- CSS variables;
- GSAP + ScrollTrigger для сложных scroll scenes;
- Motion/Framer Motion — точечно;
- `next/image`;
- `next/font`;
- semantic HTML.

Не подключай две-три motion-библиотеки ради простых fade/slide.

---

# 2. Folder architecture

Пример:

```text
app/
  page.tsx
  menu/page.tsx
  locations/page.tsx

components/
  brand/
  layout/
  hero/
  menu/
  locations/
  social/
  motion/

content/
  brand.ts
  locations.ts
  menu.ts
  kbzhu.ts
  social.ts

lib/
  menu/
  media/
  maps/
  analytics/

public/
  media/
    brand/
    menu/
    hero/
    locations/
    social/
    video/
```

Не смешивай content data с presentation components.

---

# 3. Content model

```ts
export type LocationId =
  | 'ozerki'
  | 'chizhova'
  | 'maximir'
  | 'dolphin'
  | 'arena'

export type Location = {
  id: LocationId
  name: string
  venue: string
  address: string
  floor?: string
  landmark?: string
  hours: string
  yandexUrl?: string
  twoGisUrl?: string
  image?: string
}

export type Kbzhu = {
  kcal?: number | string
  protein?: number | string
  fat?: number | string
  carbs?: number | string
  serving?: string
  basis?: string
  note?: string
}

export type MenuItem = {
  id: string
  name: string
  category: string
  description?: string
  price?: number | null
  volume?: string | null
  image?: string | null
  locationIds: LocationId[]
  featured?: boolean
  seasonal?: boolean
  kbzhu?: Kbzhu
  source: {
    menu?: string
    kbzhu?: string
    telegram?: string
  }
}

export type OrderingConfig = {
  mode: 'none' | 'pickup' | 'delivery' | 'external'
  url?: string
  label?: string
}
```

---

# 4. Menu data pipeline

### Step 1

Parse raw source into a normalized intermediate representation.

### Step 2

Normalize names only for matching, but preserve raw names.

### Step 3

Attach locations.

### Step 4

Attach KBZHU.

### Step 5

Attach best media candidates.

### Step 6

Validate:

- no duplicated IDs;
- no orphan KBZHU entries where mapping should be obvious;
- no impossible prices;
- no item without source provenance;
- no item presented at location where source says it is absent.

---

# 5. Source provenance

Every content item should know where it came from.

Example:

```ts
source: {
  menu: 'https://vk.ru/@tapiti_vrn-menu',
  kbzhu: 'https://vk.ru/@tapiti_vrn-kbzhu',
  telegram: 'telegram:post:12345'
}
```

This makes later updates safe.

---

# 6. Menu availability logic

```ts
const itemsForLocation = menu.filter(item =>
  item.locationIds.includes(selectedLocation)
)
```

Never silently show unavailable products as if they existed everywhere.

If a common item exists in 4/5 points, the UI may show:

```text
Доступно в 4 точках
```

only if this fact is computed from verified data.

---

# 7. Ordering logic

Default:

```ts
const ordering = {
  mode: 'none'
}
```

No cart.
No fake checkout.
No fake delivery ETA.
No fake order status.

When an official order channel is verified:

```ts
{
  mode: 'external',
  url: 'https://verified-source.example'
}
```

The UI can then show:

```text
Заказать
```

or the source-specific label.

---

# 8. Skills — current recommended set

## Required / highly useful

### Anthropic frontend-design

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

Purpose:

- intentional aesthetic direction;
- typography;
- color;
- spatial composition;
- motion;
- avoidance of generic AI aesthetics.

Source: https://www.skills.sh/anthropics/skills/frontend-design

### Emil design engineering

```bash
npx skills add https://github.com/emilkowalski/skills --skill emil-design-eng
```

Purpose:

- UI craft;
- animation quality;
- microinteraction quality;
- polish.

Source: https://www.skills.sh/emilkowalski/skills/emil-design-eng

### web-animation-design

```bash
npx skills add https://github.com/vercel-labs/open-agents --skill web-animation-design
```

Purpose:

- easing;
- durations;
- transform/opacity performance;
- reduced motion;
- animation review.

Source:
https://github.com/vercel-labs/open-agents/tree/main/.agents/skills/web-animation-design

### web-design-guidelines

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```

Purpose:

- accessibility;
- UX review;
- interface consistency;
- current Vercel web-interface guidance.

Source:
https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

## Optional final pass

### Impeccable

```bash
npx skills add https://github.com/pbakaus/impeccable --skill impeccable
```

Useful commands:

```text
/impeccable audit
/impeccable critique
/impeccable polish
/impeccable animate
```

Use it only for refinement; it must preserve TapiTi design direction.

---

# 9. Reusable UI sources

Можно исследовать:

- Aceternity UI
- React Bits
- Magic UI

Но использовать только конкретные primitives when useful.

Never assemble the whole site from one component library.

---

# 10. Browser / visual QA checklist

Проверки:

### Layout

- no horizontal overflow;
- no unexpected clipped content;
- no broken sticky sections;
- no overlapping fixed elements;
- safe-area handling on mobile.

### Navigation

- all links work;
- mobile menu closes correctly;
- escape closes dialogs;
- keyboard can reach all important controls.

### Menu

- location selector works;
- categories work;
- search works;
- item detail opens;
- KBZHU appears when present;
- no fake KBZHU values;
- unavailable items are handled correctly.

### Locations

- all five points shown;
- address data correct;
- map links open;
- floor/landmark correct;
- Dolphin address not invented.

### Motion

- no stutter on desktop;
- no broken ScrollTrigger refresh;
- resize does not destroy scene;
- reduced motion disables non-essential animation;
- touch devices do not trigger hover bugs.

### Media

- images loaded;
- videos have posters;
- no autoplay audio;
- no giant source files shipped unnecessarily.

### Runtime

- no console errors;
- no hydration mismatch;
- no broken dynamic imports;
- no failed image requests;
- no missing fonts.

---

# 11. Responsive matrix

Test:

```text
1440×900
1280×800
1024×768
768×1024
430×932
390×844
375×812
```

Mobile must be intentionally redesigned.

---

# 12. Performance targets

Aim for a fast first paint and fluid scroll.

Principles:

- static content can remain server-rendered;
- only interactive sections become client components;
- minimize JS on initial route;
- don't import heavy libraries globally if used in one scene;
- lazy-load media below the fold;
- preload only truly critical hero media;
- prefer CSS for simple transitions;
- use GSAP only where needed.

---

# 13. SEO baseline

Implement:

- title;
- meta description;
- canonical;
- Open Graph;
- favicon;
- sitemap;
- robots;
- JSON-LD when verified.

For multiple locations, ensure location data is consistent.

Don't invent:

- star ratings;
- review counts;
- awards;
- delivery claims.

---

# 14. Accessibility baseline

- semantic landmarks;
- one clear H1 per page;
- logical heading hierarchy;
- visible focus;
- keyboard-accessible menu/dialog;
- 44px minimum touch target where practical;
- sufficient contrast;
- meaningful alt;
- reduced motion;
- no content locked behind hover.

---

# 15. Final audit sequence

После первой complete implementation:

### Audit 1 — correctness

- content;
- menu;
- KBZHU;
- locations;
- links.

### Audit 2 — design

- typography;
- spacing;
- imagery;
- color;
- visual hierarchy.

### Audit 3 — motion

- timing;
- easing;
- scene variety;
- reduced motion.

### Audit 4 — responsive

- mobile;
- tablet;
- desktop.

### Audit 5 — performance

- images;
- video;
- JS;
- layout stability.

### Audit 6 — accessibility

- keyboard;
- focus;
- semantics;
- contrast.

### Audit 7 — final polish

Run Impeccable if available.

Не принимай «build passed» как definition of done.
