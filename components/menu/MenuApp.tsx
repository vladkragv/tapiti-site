'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Icon } from '@/components/ui/Icon'
import { LOCATIONS, hoursText } from '@/content/locations'
import { MENU } from '@/content/menu'
import type { CategoryId, LocationId, MenuItem } from '@/content/types'
import { matchesQuery, pluralPositions, normText } from '@/lib/menu/utils'
import { ClassicList } from './ClassicList'
import { ItemSheet } from './ItemSheet'
import { MenuCard } from './MenuCard'

type Cat = 'all' | CategoryId
const LOC_KEY = 'tapiti.menu.loc'
const isLoc = (v: string | null): v is LocationId => !!v && LOCATIONS.some((l) => l.id === v)
const isCat = (v: string | null): v is Cat => v === 'all' || (!!v && MENU.categories.some((c) => c.id === v))

type VTDocument = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }

/**
 * Every filter change (point / category / search) is a View Transition: cards that stay glide to their new
 * place, new ones rise in, removed ones fade out. Browsers without the API (or reduced motion) just update.
 */
function smooth(update: () => void, after?: () => void) {
  const doc = document as VTDocument
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update()
    after?.()
    return
  }
  const t = doc.startViewTransition(() => {
    flushSync(update)
  })
  if (after) t.finished.then(after, after)
}

export function MenuApp() {
  const [loc, setLoc] = useState<LocationId>('chizhova')
  const [cat, setCat] = useState<Cat>('all')
  const [q, setQ] = useState('')
  const [qInput, setQInput] = useState('')
  const [itemId, setItemId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const listTop = useRef<HTMLDivElement>(null)

  // ── restore state from external systems (URL > localStorage > default). SSR renders the default point.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    let l: string | null = p.get('loc')
    if (!isLoc(l)) {
      try {
        l = window.localStorage.getItem(LOC_KEY)
      } catch {}
    }
    if (isLoc(l)) setLoc(l)
    const c = p.get('cat')
    if (isCat(c)) setCat(c)
    setQ(p.get('q') ?? '')
    setQInput(p.get('q') ?? '')
    const it = p.get('item')
    if (it && MENU.items.some((i) => i.id === it)) {
      setItemId(it)
      const owner = MENU.items.find((i) => i.id === it)!
      if (!isLoc(p.get('loc')) && !owner.locationIds.includes((isLoc(l) ? l : 'chizhova') as LocationId)) setLoc(owner.locationIds[0])
    }
    setReady(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── write state back to URL (shareable), replace — no history spam
  useEffect(() => {
    if (!ready) return
    const p = new URLSearchParams()
    p.set('loc', loc)
    if (cat !== 'all') p.set('cat', cat)
    if (q) p.set('q', q)
    if (itemId) p.set('item', itemId)
    window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`)
    try {
      window.localStorage.setItem(LOC_KEY, loc)
    } catch {}
  }, [ready, loc, cat, q, itemId])

  const location = LOCATIONS.find((l) => l.id === loc)!

  const here = useMemo(() => MENU.items.filter((i) => i.locationIds.includes(loc)), [loc])
  const catCounts = useMemo(() => {
    const m: Record<string, number> = { all: here.length + MENU.classic.items.length }
    for (const c of MENU.categories) m[c.id] = c.id === 'classic' ? MENU.classic.items.length : here.filter((i) => i.category === c.id).length
    return m
  }, [here])

  const filteredHere = useMemo(() => here.filter((i) => (cat === 'all' || cat === i.category) && matchesQuery(i, q)), [here, cat, q])
  const filteredElsewhere = useMemo(
    () => MENU.items.filter((i) => !i.locationIds.includes(loc) && (cat === 'all' || cat === i.category) && matchesQuery(i, q)),
    [loc, cat, q],
  )
  const classic = useMemo(
    () => (cat === 'all' || cat === 'classic' ? MENU.classic.items.filter((c) => !q || normText(`${c.name} ${c.sub ?? ''}`).includes(normText(q))) : []),
    [cat, q],
  )

  const groups = useMemo(
    () =>
      MENU.categories
        .filter((c) => c.id !== 'classic')
        .map((c) => ({ cat: c, items: filteredHere.filter((i) => i.category === c.id) }))
        .filter((g) => g.items.length),
    [filteredHere],
  )

  const open = useCallback((id: string) => setItemId(id), [])
  const close = useCallback(() => setItemId(null), [])
  const current: MenuItem | null = itemId ? (MENU.items.find((i) => i.id === itemId) ?? null) : null
  const similar = useMemo(
    () => (current ? MENU.items.filter((i) => i.category === current.category && i.id !== current.id && i.locationIds.includes(loc)).slice(0, 4) : []),
    [current, loc],
  )

  const total = filteredHere.length + classic.length

  /** after a filter change, glide back to the top of the results if the visitor scrolled past it */
  const revealTop = useCallback(() => {
    const el = listTop.current
    if (!el) return
    const top = el.getBoundingClientRect().top
    const limit = (window.matchMedia('(max-width: 899px)').matches ? 110 : 80) + 8
    if (top < limit - 40) window.scrollTo({ top: window.scrollY + top - limit - 60, behavior: 'smooth' })
  }, [])

  const pickLoc = (l: LocationId) => {
    if (l !== loc) smooth(() => setLoc(l))
  }
  const pickCat = (c: Cat) => {
    if (c !== cat) smooth(() => setCat(c), revealTop)
  }

  // typing: update the field instantly, commit the filter (with a transition) once the visitor pauses
  useEffect(() => {
    if (qInput === q) return
    const id = window.setTimeout(() => smooth(() => setQ(qInput)), 200)
    return () => window.clearTimeout(id)
  }, [qInput, q])

  // keep the active chip in view in the horizontal rails (phones), smoothly
  useEffect(() => {
    if (!window.matchMedia('(max-width: 899px)').matches) return
    document.querySelectorAll<HTMLElement>('.catrail [aria-pressed="true"], .locpick [aria-checked="true"]').forEach((el) => {
      el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: ready ? 'smooth' : 'auto' })
    })
  }, [cat, loc, ready])

  return (
    <div className="mp wrap">
      <header className="mp__head">
        <div>
          <p className="eyebrow mp__eyebrow">Меню · Воронеж</p>
          <h1 className="display mp__title">Меню TapiTi</h1>
        </div>
        <p className="mp__lead">
          Меню у каждой точки своё: выберите, где будете пить, — покажем то, что есть именно там, с ценами, объёмами и КБЖУ.
        </p>
      </header>

      <div className="mp__layout">
        <aside className="mp__side" aria-label="Фильтры меню">
          <div ref={pickerRef} id="loc-picker" className="mp__block">
            <h2 className="mp__h" id="loc-h">
              Точка
            </h2>
            <div className="locpick" role="radiogroup" aria-labelledby="loc-h">
              {LOCATIONS.map((l) => {
                const n = MENU.stats[l.id].total + MENU.classic.items.length
                return (
                  <button key={l.id} type="button" role="radio" aria-checked={loc === l.id} className="locpick__btn" onClick={() => pickLoc(l.id)} style={{ ['--ac' as string]: l.accent }}>
                    <span className="locpick__dot" aria-hidden="true" />
                    <span className="locpick__name">{l.name}</span>
                    <small>{n}</small>
                  </button>
                )
              })}
            </div>
            <p className="mp__where">
              {location.venue}
              <span>
                {location.address}
                {location.floor ? `, ${location.floor}` : ''}
              </span>
              <span>{hoursText(location)}</span>
            </p>
          </div>

          <div className="mp__block mp__search">
            <label htmlFor="menu-q" className="mp__h">
              Поиск
            </label>
            <div className="search">
              <Icon name="search" size={20} />
              <input id="menu-q" type="search" inputMode="search" autoComplete="off" placeholder="Название или вкус: клубника, матча…" value={qInput} onChange={(e) => setQInput(e.target.value)} />
              {qInput ? (
                <button type="button" className="search__x" aria-label="Очистить поиск" onClick={() => (setQInput(''), smooth(() => setQ('')))}>
                  <Icon name="close" size={18} />
                </button>
              ) : null}
            </div>
          </div>

          <nav className="mp__block mp__cats" aria-label="Категории">
            <h2 className="mp__h">Категории</h2>
            <div className="catrail">
              <button type="button" className="chip" aria-pressed={cat === 'all'} onClick={() => pickCat('all')}>
                Все <small>{catCounts.all}</small>
              </button>
              {MENU.categories.map((c) => (
                <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} disabled={!catCounts[c.id]} onClick={() => pickCat(c.id)}>
                  {c.short} <small>{catCounts[c.id]}</small>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <div className="mp__main" ref={listTop}>
          <p className="mp__status" role="status" aria-live="polite">
            {location.name}: {pluralPositions(total)}
            {q ? ` по запросу «${q}»` : ''}
          </p>

          {groups.map((g) => (
            <section key={g.cat.id} className="mp__group" aria-labelledby={`g-${g.cat.id}`}>
              {cat === 'all' ? (
                <h2 id={`g-${g.cat.id}`} className="mp__gh display" style={{ ['--vt' as string]: `gh-${g.cat.id}` }}>
                  {g.cat.name}
                  <small>{g.items.length}</small>
                </h2>
              ) : (
                <h2 id={`g-${g.cat.id}`} className="sr-only">
                  {g.cat.name}
                </h2>
              )}
              {g.cat.id === 'frappe' || g.cat.id === 'lemonade' ? (
                <p className="mp__top">{MENU.toppings[g.cat.id]?.[loc]}</p>
              ) : null}
              {g.cat.id === 'hot-tea' ? <p className="mp__top">Размер M, 500 мл</p> : null}
              <ul className="mp__grid" role="list">
                {g.items.map((i) => (
                  <MenuCard key={i.id} item={i} loc={loc} onOpen={open} />
                ))}
              </ul>
            </section>
          ))}

          {classic.length ? <ClassicList items={classic} /> : null}

          {total === 0 ? (
            <div className="mp__empty">
              <p className="display">Здесь такого нет</p>
              <p>
                На точке «{location.name}» ничего не нашлось{q ? ` по запросу «${q}»` : ''}.
                {filteredElsewhere.length ? ' Но на других точках — есть, смотрите ниже.' : ' Попробуйте другое слово или сбросьте категорию.'}
              </p>
              <button type="button" className="btn btn--ghost" onClick={() => (setQInput(''), smooth(() => (setQ(''), setCat('all'))))}>
                Сбросить фильтры
              </button>
            </div>
          ) : null}

          {filteredElsewhere.length ? (
            <details className="mp__else" open={total === 0}>
              <summary>
                <span className="display">Нет на точке «{location.name}»</span>
                <small>
                  {filteredElsewhere.length} — но есть на других
                </small>
              </summary>
              <ul className="mp__grid" role="list">
                {filteredElsewhere.map((i) => (
                  <MenuCard key={i.id} item={i} loc={loc} onOpen={open} ghost />
                ))}
              </ul>
            </details>
          ) : null}

          <footer className="mp__foot">
            <p>
              Цены в рублях. Размеры: M — 500 мл, L — 700 мл. {MENU.classic.allergy}
            </p>
            <p>
              Источник: официальное меню TapiTi во ВКонтакте и таблица КБЖУ. Позиция может отсутствовать на точке в течение дня — уточняйте у бариста. На сайте нет оформления заказа — напитки готовят и выдают на точках.
            </p>
          </footer>
        </div>
      </div>

      <ItemSheet item={current} loc={loc} similar={similar} onClose={close} onOpenItem={open} onPickLoc={pickLoc} />
    </div>
  )
}

