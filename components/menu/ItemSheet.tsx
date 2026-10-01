'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CupImage } from '@/components/ui/CupImage'
import { Icon } from '@/components/ui/Icon'
import { LOCATIONS } from '@/content/locations'
import { MENU, cupInk, cupTone } from '@/content/menu'
import type { LocationId, MenuItem } from '@/content/types'
import { baseOf, kbzhuFor, num1, pluralPoints, priceFor, rub } from '@/lib/menu/utils'

export function ItemSheet({
  item,
  loc,
  similar,
  onClose,
  onOpenItem,
  onPickLoc,
}: {
  item: MenuItem | null
  loc: LocationId
  similar: MenuItem[]
  onClose: () => void
  onOpenItem: (id: string) => void
  onPickLoc: (l: LocationId) => void
}) {
  const dlg = useRef<HTMLDialogElement>(null)
  const [size, setSize] = useState<'M' | 'L'>('M')
  const [temp, setTemp] = useState<'cold' | 'hot'>('cold')
  // keep the last item mounted while the dialog animates closed (derived state, no ref reads in render)
  const [shown, setShown] = useState<MenuItem | null>(item)
  if (item && item !== shown) setShown(item)
  const it = item ?? shown

  // open / close the native dialog in sync with state
  useEffect(() => {
    const d = dlg.current
    if (!d) return
    if (item && !d.open) d.showModal()
    if (!item && d.open) d.close()
  }, [item])

  // reset toggles when another item is opened
  const id = item?.id ?? null
  const [prevId, setPrevId] = useState<string | null>(id)
  if (id !== prevId) {
    setPrevId(id)
    if (item) {
      setSize('M')
      setTemp(item.temp === 'hot' ? 'hot' : 'cold')
    }
  }
  useEffect(() => {
    dlg.current?.querySelector('.isheet__scroll')?.scrollTo({ top: 0 })
  }, [id])

  const offer = it ? priceFor(it, it.offers[loc] ? loc : null) : null
  const hasL = !!offer?.L
  const canTemp = it?.temp === 'both' && !!it.kbzhu?.some((v) => v.temp === 'hot')
  const v = useMemo(() => (it ? kbzhuFor(it, hasL ? size : 'M', temp) : null), [it, size, temp, hasL])
  const available = it?.locationIds.length ?? 0
  const base = it ? baseOf(it.description) : null

  return (
    <dialog
      ref={dlg}
      className="sheet isheet"
      aria-label={it ? `${it.name}: подробности` : 'Подробности'}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dlg.current) dlg.current?.close()
      }}
    >
      {it && offer ? (
        <div className="sheet__body isheet__body" style={{ ['--tone' as string]: cupTone(it.id, 90), ['--tone-deep' as string]: cupTone(it.id, 78, 70), ['--tone-ink' as string]: cupInk(it.id) }}>
          <button type="button" className="sheet__close" onClick={() => dlg.current?.close()} aria-label="Закрыть">
            <Icon name="close" />
          </button>

          <div className="isheet__art" aria-hidden="true">
            <span className="isheet__disc" />
            <div key={it.id} className="isheet__cup">
              <CupImage id={it.id} height={420} sizes="(min-width: 900px) 280px, 180px" priority />
            </div>
          </div>

          <div className="isheet__scroll">
            <div className="sheet__grab" aria-hidden="true" />
            <p className="isheet__cat eyebrow">
              {MENU.categories.find((c) => c.id === it.category)!.name}
              <span>
                {available === 5 ? 'Во всех 5 точках' : `Есть в ${pluralPoints(available)} из 5`}
              </span>
            </p>
            <h2 key={`n-${it.id}`} className="isheet__name display swap-in">
              {it.name}
            </h2>
            <p key={`d-${it.id}`} className="isheet__desc swap-in">
              {offer.description ?? it.description}
            </p>
            {base ? <p className="isheet__base">Основа — напиток на {base}</p> : null}

            <div className="isheet__row">
              <div className="seg" role="radiogroup" aria-label="Размер" style={{ ['--n' as string]: hasL ? 2 : 1, ['--i' as string]: size === 'L' && hasL ? 1 : 0 }}>
                <span className="seg__ind" aria-hidden="true" />
                <button type="button" role="radio" aria-checked={size === 'M'} onClick={() => setSize('M')}>
                  <b>M</b> 500 мл <em key={`m-${it.id}`} className="num-in">{rub(offer.M)}</em>
                </button>
                {hasL ? (
                  <button type="button" role="radio" aria-checked={size === 'L'} onClick={() => setSize('L')}>
                    <b>L</b> 700 мл <em key={`l-${it.id}`} className="num-in">{rub(offer.L!)}</em>
                  </button>
                ) : null}
              </div>
              {canTemp ? (
                <div className="seg seg--temp" role="radiogroup" aria-label="Температура" style={{ ['--n' as string]: 2, ['--i' as string]: temp === 'hot' ? 1 : 0 }}>
                <span className="seg__ind" aria-hidden="true" />
                  <button type="button" role="radio" aria-checked={temp === 'cold'} onClick={() => setTemp('cold')}>
                    Холодный
                  </button>
                  <button type="button" role="radio" aria-checked={temp === 'hot'} onClick={() => setTemp('hot')}>
                    Горячий
                  </button>
                </div>
              ) : null}
            </div>
            {!it.offers[loc] ? <p className="isheet__warn">На выбранной точке этого напитка нет — цена с ближайшей, где он есть.</p> : null}

            <section className="kbzhu" aria-labelledby="kbzhu-h">
              <h3 id="kbzhu-h" className="kbzhu__h">
                КБЖУ
              </h3>
              {v ? (
                <>
                  <dl className="kbzhu__grid">
                    <div>
                      <dt>Ккал</dt>
                      <dd key={`k-${v.source}`} className="display num-in">{num1(v.kcal)}</dd>
                    </div>
                    <div>
                      <dt>Белки</dt>
                      <dd key={`p-${v.source}`} className="display num-in">{num1(v.protein)}&nbsp;г</dd>
                    </div>
                    <div>
                      <dt>Жиры</dt>
                      <dd key={`f-${v.source}`} className="display num-in">{num1(v.fat)}&nbsp;г</dd>
                    </div>
                    <div>
                      <dt>Углеводы</dt>
                      <dd key={`c-${v.source}`} className="display num-in">{num1(v.carbs)}&nbsp;г</dd>
                    </div>
                  </dl>
                  <p className="kbzhu__basis">
                    На весь напиток: размер {hasL ? size : 'M'} ({(hasL ? size : 'M') === 'M' ? '500' : '700'} мл)
                    {canTemp || it.temp === 'hot' ? `, ${temp === 'hot' ? 'горячий' : 'холодный'}` : ''}.
                  </p>
                </>
              ) : (
                <p className="kbzhu__none">
                  {it.kbzhu
                    ? 'Для этого размера или варианта КБЖУ в таблице TapiTi не указано.'
                    : 'КБЖУ для этой позиции в официальной таблице TapiTi не опубликовано.'}
                </p>
              )}
            </section>

            <section aria-labelledby="where-h" className="isheet__where">
              <h3 id="where-h" className="kbzhu__h">
                Где есть
              </h3>
              <ul role="list" className="where">
                {LOCATIONS.map((l) => {
                  const o = it.offers[l.id]
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        className="where__btn"
                        aria-pressed={l.id === loc}
                        disabled={!o}
                        onClick={() => onPickLoc(l.id)}
                        title={o ? `Показать меню: ${l.venue}` : `${l.venue}: нет в меню`}
                      >
                        <span>{l.name}</span>
                        <small>{o ? `${o.M}${o.L ? ' / ' + o.L : ''} ₽` : 'нет'}</small>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            {similar.length ? (
              <section aria-labelledby="sim-h" className="isheet__sim">
                <h3 id="sim-h" className="kbzhu__h">
                  Похожие
                </h3>
                <ul role="list" className="sim">
                  {similar.map((s) => (
                    <li key={s.id}>
                      <button type="button" className="sim__btn" onClick={() => onOpenItem(s.id)} style={{ ['--tone' as string]: cupTone(s.id) }}>
                        <span className="sim__art" aria-hidden="true">
                          <CupImage id={s.id} height={110} sizes="64px" />
                        </span>
                        <span>{s.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

          </div>
        </div>
      ) : null}
    </dialog>
  )
}

