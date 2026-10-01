# TapiTi — RESEARCH, SOURCES OF TRUTH, MENU / KBZHU / LOCATIONS / DELIVERY

## 1. Официальные источники, которые должен знать агент

### Основные

- VK community: https://vk.ru/tapiti_vrn
- Telegram: https://t.me/tapiti_vrn
- Taplink: https://tapiti.taplink.ws/

### Критически важные статьи VK

- **Menu by location:** https://vk.ru/@tapiti_vrn-menu
- **KBZHU:** https://vk.ru/@tapiti_vrn-kbzhu

Эти две статьи являются обязательными content sources для `/menu`.

### Публичные map / venue sources

Используй карты и страницы ТРЦ только для проверки локаций, этажей, hours и route links. Не используй сторонние каталоги как источник меню.

---

## 2. Важное ограничение текущего research

Внешний веб-доступ к самим VK article URLs может быть ограничен robots / login / dynamic rendering. **Нельзя считать это поводом для выдумывания данных.**

Если Claude Code может открыть URL через доступный browser/web tooling — вытащи данные напрямую.

Если direct fetch не работает:

1. проверь `reference/vk/` на локальные HTML/PDF/screenshots;
2. попробуй browser automation, если она доступна;
3. только после этого попроси владельца проекта положить экспорт статей в `reference/vk/`.

В любом случае implementation должен завершаться только после создания локальных:

```text
research/menu-catalog.md
research/kbzhu-catalog.md
```

и после проверки, что данные реально соответствуют источнику.

---

# 3. Brand facts already confirmed from public sources

TapiTi публично описывает себя как сеть напиточных точек в Воронеже. В официальном Taplink перечислены:

- молочные, фруктовые, кофейные и чайные Bubble Tea;
- матча;
- кофе на бразильском зерне;
- авторские чаи;
- лимонады;
- азиатские сладости;
- джус-боллы / tapioca;
- пять локаций в Воронеже.

Источник: https://tapiti.taplink.ws/

В Taplink также перечислены ссылки на Яндекс Карты и 2ГИС для пяти точек.

---

# 4. Five locations

## OZERKI

**ЖК «Озерки»**

ул. Адмирала Чурсина, 2/1

Ориентир: вход со стороны «Пятёрочки».

## CHIZHOVA

**ТРЦ «Галерея Чижова»**

ул. Кольцовская, 35

4 этаж, зона фуд-корта.

## MAXIMIR

**ТРЦ «Максимир»**

Ленинский проспект, 174П

3 этаж, FoodПАРК / фуд-корт.

Официальная страница ТРЦ подтверждает TapiTi на 3 этаже и график 10:00–22:00.

## DOLPHIN

**Парк «Дельфин»**

Использовать именно подтвержденное описание точки из клиентских материалов.

Не подставлять случайный точный номер дома из стороннего каталога.

## ARENA

**ТРЦ «Арена»**

бульвар Победы, 23Б

3 этаж, зона фуд-корта.

---

# 5. Hours

Рабочая публичная версия:

**ежедневно 10:00–22:00**.

Но в коде это должно быть data-driven:

```ts
hoursByLocation[locationId]
```

Это позволяет отдельно менять праздничные часы и special schedule.

---

# 6. DELIVERY CHECK — РЕЗУЛЬТАТ

На момент подготовки документации надежного подтверждения собственной доставки TapiTi найдено не было.

Что подтверждено:

- официальный Taplink содержит точки, social links, payment information и FAQ;
- карты подтверждают takeaway / pickup-type behavior;
- публичные карточки TapiTi не дают надежного доказательства собственного delivery checkout.

Поэтому baseline:

```ts
ordering.mode = 'none'
```

и меню работает как **просмотр + изучение + поиск точки**, без корзины.

### Обязательная перепроверка перед релизом

Claude должен еще раз проверить на дату релиза:

- VK;
- Telegram;
- official links;
- Яндекс Еда;
- другие явно связанные с TapiTi delivery services.

Если появится официальный ordering channel:

```ts
ordering.mode = 'external'
ordering.url = 'REAL_CONFIRMED_URL'
```

и CTA должен вести на реальный сервис.

Если delivery нет — **не делать fake ordering experience**.

---

# 7. SOURCE PRIORITY FOR MENU

### Tier 1 — highest priority

1. VK Menu article
2. VK KBZHU article

### Tier 2

3. Telegram export
4. VK community

### Tier 3

5. Taplink
6. official mall pages
7. Yandex / 2GIS maps

### Tier 4

8. RestaurantGuru / random directories / reviews sites — only as clues.

Сторонний источник не может создавать новый item в menu.

---

# 8. MENU EXTRACTION TASK

Из `https://vk.ru/@tapiti_vrn-menu` сделать полный dataset.

Для каждой точки:

```text
location
  category
    item
      name
      price
      size
      description
      status
      image/reference
      source
```

Определи:

- общие категории;
- локальные категории;
- позиции только одной точки;
- позиции в нескольких точках;
- разные цены/объемы одной позиции, если встречаются.

Не объединяй разные позиции только потому, что названия похожи.

Создай canonical ID:

```text
bubble-tea-strawberry-oreo
matcha-latte
lemonade-forest-berries
...
```

Но сохраняй raw source name отдельно.

---

# 9. KBZHU EXTRACTION TASK

Из `https://vk.ru/@tapiti_vrn-kbzhu` вытащить весь список.

Нужны:

- title;
- source spelling;
- kcal;
- protein;
- fat;
- carbs;
- serving / volume;
- notes.

### Matching rules

Связывать KBZHU с menu item по:

1. exact name;
2. normalized name;
3. verified synonym / source note.

Если matching uncertain — не присваивать автоматически.

Создай `unmatched-kbzhu.md`.

---

# 10. КАК ПОКАЗЫВАТЬ КБЖУ

КБЖУ не должно ломать эмоциональный visual style сайта.

Рекомендуемый UI:

**в карточке:**

```text
287 kcal
```

**в детали:**

```text
КБЖУ
287 ккал · Б 4,2 · Ж 7,1 · У 46,8
```

Если источник содержит объем:

```text
на 500 мл
```

или

```text
на порцию
```

Нельзя менять basis.

---

# 11. MENU UX — ЧТО ДОЛЖЕН ПОНИМАТЬ ПОСЕТИТЕЛЬ

За несколько секунд:

1. где меню;
2. какая выбрана точка;
3. что доступно именно там;
4. сколько стоит;
5. какой объем;
6. что это за напиток;
7. КБЖУ;
8. как найти точку.

Не нужно:

- заставлять пользователя регистрироваться;
- открывать пять разных страниц для пяти меню;
- скрывать location selector;
- превращать menu page в giant table.

---

# 12. Recommended menu interaction

## Desktop

Слева или сверху:

- location selector;
- category rail;
- search.

Основная область:

- asymmetric product grid;
- large images;
- compact pricing;
- strong product names.

При click:

- modal / drawer с крупной карточкой.

## Mobile

Сверху:

- selected location;
- horizontally scrollable category chips;
- search.

Grid:

- 1–2 columns depending breakpoint;
- cards not too tall;
- no hover dependency.

Product detail:

- bottom sheet / full-screen sheet preferred.

---

# 13. Five-point UX

Пользователь может войти с home page и выбрать:

```text
Где тебе ближе?

Озерки
Чижова
Максимир
Дельфин
Арена
```

Каждая карточка:

- real image;
- venue;
- address;
- floor / landmark;
- hours;
- route CTA.

Использовать внешние map links из официального Taplink, если доступны.

---

# 14. Research questions Claude must answer before coding

### Brand

- Какие цвета реально доминируют?
- Какой тип фотографии типичен?
- Каким образом используется лисёнок?
- Насколько playful tone?
- Насколько яркий vs premium?
- Какие graphic motifs повторяются?

### Product

- Какие 5–10 позиций визуально наиболее сильные?
- Какие категории главные?
- Какие позиции сезонные?
- Какие позиции чаще повторяются в Telegram?

### UX

- Какие категории пользователь должен видеть первыми?
- Как быстро найти точку?
- Нужен ли location-first menu?

### Motion

- Какие видео подходят для hero?
- Какие крупные media можно анимировать через crop/mask/parallax?
- Какие сцены можно сделать pinned?

---

# 15. Research output quality gate

До кодинга должен существовать хотя бы такой evidence matrix:

| Topic | Source | Confidence | Used in UI? |
|---|---|---:|---|
| locations | official Taplink / maps | high | yes |
| hours | official/venue | medium-high | yes |
| menu | VK menu article | high | yes |
| KBZHU | VK KBZHU article | high | yes |
| delivery | official channels | currently unconfirmed | no |
| visual atmosphere | Telegram export | high | yes |
| tone of voice | Telegram + VK | high | yes |
| reviews | maps | medium | only if explicitly needed |

Если `menu` или `KBZHU` еще не подтверждены — реализация меню считается **неготовой**.
