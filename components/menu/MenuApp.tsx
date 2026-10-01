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

/**
 * Filter changes are a light fade-swap: the results dip (140 ms), the state flips while they are invisible,
 * the scroller resets to the top, then they rise back in. Only opacity/transform are animated, so it never janks.
 */
function useSwap(resultsRef: React.RefObject<HTMLElement | null>, scrollerRef: React.RefObject<HTMLElement | null>) {
  return useCallback(
    (update: () => void) => {
      const el = resultsRef.current
      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        update()
        return
      }
      el.classList.add('is-leaving')
      window.setTimeout(() => {
        flushSync(update)
        if (scrollerRef.current) scrollerRef.current.scrollTop = 0
        if (window.matchMedia('(max-width: 899px)').matches) {
          const top = el.getBoundingClientRect().top + window.scrollY - 190
          if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
        }
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('is-leaving')))
      }, 150)
    },
    [resultsRef, scrollerRef],
  )
}
export function MenuApp() {
  const [loc, setLoc] = useState<LocationId>('chizhova')
  const [cat, setCat] = useState<Cat>('all')
  const [q, setQ] = useState('')
  const [qInput, setQInput] = useState('')
  const [itemId, setItemId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const smooth = useSwap(resultsRef, scrollerRef)

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

  const pickLoc = (l: LocationId) => {
    if (l !== loc) smooth(() => setLoc(l))
  }
  const pickCat = (c: Cat) => {
    if (c !== cat) smooth(() => setCat(c))
  }

  // typing: update the field instantly, commit the filter (with a transition) once the visitor pauses
  useEffect(() => {
    if (qInput === q) return
    const id = window.setTimeout(() => smooth(() => setQ(qInput)), 220)
    return () => window.clearTimeout(id)
  }, [qInput, q, smooth])

  // inertial smooth scrolling for the results list (desktop). Lenis is loaded lazily and only here.
  const lenisRef = useRef<{ stop: () => void; start: () => void } | null>(null)
  useEffect(() => {
    const wrapper = scrollerRef.current
    if (!wrapper || window.matchMedia('(max-width: 899px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let dead = false
    let destroy: (() => void) | undefined
    import('lenis').then(({ default: Lenis }) => {
      if (dead) return
      const lenis = new Lenis({ wrapper, content: wrapper.firstElementChild as HTMLElement, duration: 1.05, smoothWheel: true, autoRaf: true, wheelMultiplier: 0.9 })
      lenisRef.current = lenis
      destroy = () => lenis.destroy()
    })
    return () => {
      dead = true
      lenisRef.current = null
      destroy?.()
    }
  }, [])
  useEffect(() => {
    if (itemId) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [itemId])

  // keep the active chip in view in the horizontal rails (phones), smoothly
  useEffect(() => {
    if (!window.matchMedia('(max-width: 899px)').matches) return
    document.querySelectorAll<HTMLElement>('.catrail [aria-pressed="true"], .locpick [aria-checked="true"]').forEach((el) => {
      el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: ready ? 'smooth' : 'auto' })
    })
  }, [cat, loc, ready])

  return (
    <div className="mp">
      <header className="mp__head">
        <div>
          <p className="eyebrow mp__eyebrow">Меню · Воронеж</p>
          <h1 className="display mp__title">Меню TapiTi</h1>
        </div>
        <p className="mp__lead">Выбирай точку и вкус: покажем всё, что там наливают, с ценами, объёмами и КБЖУ.</p>
      </header>

      <div className="mp__layout">
        <aside className="mp__side" aria-label="Фильтры меню">
          <div id="loc-picker" className="mp__block">
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

        <div className="mp__scroll" ref={scrollerRef}>
          <div className="mp__main">
          <p className="mp__status" role="status" aria-live="polite">
            {location.name}: {pluralPositions(total)}
            {q ? ` по запросу «${q}»` : ''}
          </p>
          <div className="mp__results" ref={resultsRef}>
          {groups.map((g) => (
            <section key={g.cat.id} className="mp__group" aria-labelledby={`g-${g.cat.id}`}>
              {cat === 'all' ? (
                <h2 id={`g-${g.cat.id}`} className="mp__gh display">
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
            <p>Размеры: M — 500 мл, L — 700 мл. Подберём вкус и ответим на вопросы о составе на точке.</p>
          </footer>
          </div>
          </div>
        </div>
      </div>

      <ItemSheet item={current} loc={loc} similar={similar} onClose={close} onOpenItem={open} onPickLoc={pickLoc} />
    </div>
  )
}

