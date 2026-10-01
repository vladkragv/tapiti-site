import { MENU } from '@/content/menu'
import type { ClassicItem, KbzhuVariant } from '@/content/types'
import { num1, rub } from '@/lib/menu/utils'

const sizeLabel = (s: KbzhuVariant['size']) => (s === 'M' ? 'M · 500 мл' : s === 'L' ? 'L · 700 мл' : (s ?? ''))

function Kb({ item }: { item: ClassicItem }) {
  if (!item.kbzhu?.length) return <span className="cl__nokb">КБЖУ не опубликовано</span>
  return (
    <details className="cl__kb">
      <summary>КБЖУ</summary>
      <ul role="list">
        {item.kbzhu.map((v) => (
          <li key={v.source}>
            <b>
              {sizeLabel(v.size)}
              {v.temp === 'hot' ? ' · горячий' : ''}
            </b>
            <span>
              {num1(v.kcal)} ккал · Б {num1(v.protein)} · Ж {num1(v.fat)} · У {num1(v.carbs)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}

/** «Классика» — a priced list by volume (350 / 450 / 500 мл), identical on all five points. */
export function ClassicList({ items }: { items: ClassicItem[] }) {
  return (
    <section className="cl" aria-labelledby="classic-h" id="classic">
      <header className="cl__head">
        <h2 id="classic-h" className="display">
          Классика
        </h2>
        <p>{MENU.classic.note}</p>
      </header>
      <div className="cl__table" role="table" aria-label="Классика: цены по объёму">
        <div className="cl__row cl__row--h" role="row">
          <span role="columnheader">Напиток</span>
          <span role="columnheader">350 мл</span>
          <span role="columnheader">450 мл</span>
          <span role="columnheader">500 мл</span>
        </div>
        {items.map((c) => (
          <div className="cl__row" role="row" key={c.id}>
            <span role="cell" className="cl__name">
              <b>{c.name}</b>
              {c.sub ? <small>{c.sub}</small> : null}
              {c.temp === 'cold' ? <small>со льдом</small> : null}
              <Kb item={c} />
            </span>
            {[350, 450, 500].map((v) => (
              <span role="cell" key={v} className="cl__price" data-label={`${v} мл`}>
                {c.prices[String(v)] ? rub(c.prices[String(v)]) : '—'}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
