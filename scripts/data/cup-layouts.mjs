// Layout of cup photos inside the official menu images (native pixel coords).
// Each section: img, xs = [[x0,x1] per column], y0 = top of first row, pitch = row pitch, h = box height, names[row][col]
// Boxes are deliberately a bit generous; the extractor trims to the cup silhouette.
const S = 1.28 // displayed (2000px wide overview) → native

const d = (v) => Math.round(v * S)

export const SOURCES = {
  // Highest resolution first: Дельфин (2 pages) covers almost every item
  'dolphin-2': 'reference/vk/menu-dolphin-2.jpg',
  'dolphin-1': 'reference/vk/menu-dolphin-1.jpg',
  chizhova: 'reference/vk/menu-chizhova.jpg',
  maximir: 'reference/vk/menu-maximir.jpg',
  arena: 'reference/vk/menu-arena.jpg',
}

// dolphin-1 (2199x2560)
const D1 = [
  {
    src: 'dolphin-1', cat: 'coffee', xs: [[d(36), d(135)], [d(352), d(450)]], y0: d(468), pitch: d(161), h: d(158),
    names: [['Кофейный Тапи', 'Тарошка'], ['Шоколадный батончик', 'Орео-кофэ'], ['Темное желание', 'Шоколад карамель'], ['Клубничное облако', 'Дубайский шейк'], ['Бархатная малина', 'Карибская черника'], ['Кофейный банан', 'Рафаэлка']],
  },
  {
    src: 'dolphin-1', cat: 'milk-tea', xs: [[d(703), d(800)], [d(1020), d(1115)], [d(1340), d(1435)]], y0: d(95), pitch: d(156.5), h: d(155),
    names: [['Черный жемчуг', 'Взрыв карамели', 'Мальвиша'], ['Орех в лесу', 'Тапи блю', 'Ягодная жвачка'], ['Кокосовый таро', 'Клубника в шоколаде', 'Орео'], ['Клубничный орео', 'Лес чудес', 'Печенько-малина'], ['Рафаэль-банано', 'Лав малина', 'Банана папа'], ['Вишневый тапи', 'Дынный банан', 'Тапи шок']],
  },
  {
    src: 'dolphin-1', cat: 'lemonade', xs: [[d(703), d(800)], [d(1020), d(1115)], [d(1340), d(1435)]], y0: d(1178), pitch: d(158), h: d(158),
    names: [['Мятная вишня', 'Китайский лимон', 'Клубничный моджито'], ['Тропик лав', 'Малиновая свежесть', 'Моджито'], ['Три-ля-ля', 'Лагуна', 'Малиничи'], ['Эпл киви', 'Кисло-дынька', 'Виноградный мохито']],
  },
  {
    src: 'dolphin-1', cat: 'lemonade', xs: [[d(703), d(800)], [d(940), d(1040)], [d(1195), d(1290)], [d(1430), d(1530)]], y0: d(1810), pitch: d(158), h: d(160),
    names: [['Черника лайм', 'Дюшеска', 'Крыживик', 'Сморград']],
  },
  {
    src: 'dolphin-1', cat: 'hot-tea', xs: [[d(38), d(130)], [d(358), d(450)]], y0: d(1545), pitch: d(140), h: d(136),
    names: [['Лимон-малина', 'Смородина-мята'], ['Манго-маракуйя', 'Вишня-апельсин']],
  },
]

// single items that exist only in Chizhova / Maximir menus (native coords, measured on tiles)
const one = (src, cat, name, x0, y0, x1, y1) => ({ src, cat, xs: [[x0, x1]], y0, pitch: 0, h: y1 - y0, names: [[name]] })
const EXTRA = [
  one('chizhova', 'coffee', 'Мелонано', 255, 655, 332, 750),
  one('chizhova', 'coffee', 'Крепкий орешек', 22, 778, 96, 884),
  one('chizhova', 'milk-tea', 'Любовь-это', 750, 178, 820, 282),
  one('chizhova', 'milk-tea', 'Манго', 522, 402, 590, 503),
  one('chizhova', 'milk-tea', 'Банничка', 750, 624, 820, 728),
  one('chizhova', 'fruit-tea', 'Цитрусовый взрыв', 1252, 192, 1322, 288),
  one('chizhova', 'frappe', 'Юдзу-апельсин', 525, 924, 595, 1030),
  one('chizhova', 'frappe', 'Грасмур', 775, 924, 845, 1030),
  one('chizhova', 'frappe', 'Тропико яблоко', 1032, 920, 1104, 1020),
  one('maximir', 'matcha', 'Сенсей клубника', 1372, 1086, 1462, 1212),
]

// dolphin-2 (1922x2560)
export const LAYOUTS = [
  ...D1,
  ...EXTRA,
  {
    src: 'dolphin-2', cat: 'fruit-tea', xs: [[d(40), d(140)], [d(408), d(508)]], y0: d(82), pitch: d(169.6), h: d(165),
    names: [['Маракуйя', 'Сияние'], ['Гранилина', 'Лесные ягоды'], ['Клубничный киви', 'Мохитка'], ['Чистый цитрус', 'Вишня личи'], ['Черлинка', 'Сморситрус'], ['Грейпфрут личи', 'Тропи трио'], ['Винолайм', 'Экзотик фрукт'], ['Кивикуйка', 'Китайская малина']],
  },
  {
    src: 'dolphin-2', cat: 'milk-cocktail', xs: [[d(775), d(870)], [d(1138), d(1235)]], y0: d(92), pitch: d(168), h: d(150),
    names: [['Банановый сникерс', 'Дубайская малина'], ['Таро-орео', 'Клубняшка'], ['Баунти', 'Дубайск'], ['Какао ти', 'Ванилька-хрусь']],
  },
  {
    src: 'dolphin-2', cat: 'matcha', xs: [[d(778), d(870)], [d(1145), d(1235)]], y0: d(812), pitch: d(153), h: d(150),
    names: [['Смурфито', 'Рубиновое сердце'], ['Фисташечка', 'Голубое небо'], ['Розовая пантера', 'Матча ти'], ['Заклятье леса', 'Фламинго']],
  },
  {
    src: 'dolphin-2', cat: 'frappe', xs: [[d(48), d(138)], [d(442), d(532)], [d(805), d(895)], [d(1180), d(1272)]], y0: d(1497), pitch: d(160), h: d(172),
    names: [['Шокика', 'Красная фурия', 'Фисташка айс', 'Крем кисс'], ['Айс-вишня', 'Кофейный краш', 'Клубника маракуйя', 'Виноградный лед'], ['Грейпи блю', 'Ледяной орео', 'Маликоко', 'Какао банэль']],
  },
]

