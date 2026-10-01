'use client'

import { useEffect, useRef, useState } from 'react'
import { BRAND } from '@/content/brand'
import { LOCATIONS } from '@/content/locations'
import type { LocationId } from '@/content/types'
import { MENU } from '@/content/menu'
import { pluralPositions } from '@/lib/menu/utils'
import { LocationActions, LocationFacts } from './LocationCard'
import { LocationVisual } from './LocationVisual'

/**
 * /locations — desktop: sticky visual on the left; as each chapter on the right enters the middle of the
 * viewport the matching point becomes active (mask wipe + scale). Phone: a plain list, address first.
 */
export function LocationsApp() {
  const [active, setActive] = useState<LocationId>('ozerki')
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const els = LOCATIONS.map((l) => refs.current[l.id]).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as LocationId)
      },
      { rootMargin: '-42% 0px -48% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const activeIdx = LOCATIONS.findIndex((l) => l.id === active)

  return (
    <div className="ls">
      <header className="wrap ls__head">
        <div>
          <p className="eyebrow ls__eyebrow">Воронеж</p>
          <h1 className="display ls__title">Пять точек TapiTi</h1>
        </div>
        <div className="ls__lead">
          <p>
            Озерки, «Галерея Чижова», «Максимир», парк «Дельфин» и «Арена». Часы работы — ежедневно с&nbsp;10:00 до&nbsp;22:00; в праздники график может отличаться — следите за{' '}
            <a href={BRAND.links.telegram} target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            .
          </p>
          <nav className="ls__jump" aria-label="Быстрый переход к точке">
            {LOCATIONS.map((l) => (
              <a key={l.id} className="chip" href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}>
                {l.name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="wrap ls__body">
        <div className="ls__stage" aria-hidden="true">
          <div className="ls__frame">
            {LOCATIONS.map((l) => (
              <div key={l.id} className="ls__v" data-active={l.id === active}>
                <LocationVisual loc={l} sizes="(min-width: 900px) 46vw, 0px" priority={l.id === 'ozerki'} />
              </div>
            ))}
          </div>
          <p className="ls__counter display">
            0{activeIdx + 1}
            <span> / 0{LOCATIONS.length}</span>
          </p>
        </div>

        <ol className="ls__list" role="list">
          {LOCATIONS.map((l, i) => (
            <li key={l.id} id={l.id} ref={(el) => void (refs.current[l.id] = el)} className="ls__ch" data-active={l.id === active} style={{ ['--ac' as string]: l.accent }}>
              <div className="ls__inline">
                <LocationVisual loc={l} sizes="92vw" />
              </div>
              <p className="ls__n display" aria-hidden="true">
                0{i + 1}
              </p>
              <h2 className="display ls__venue">{l.venue}</h2>
              {l.openedNote ? <p className="ls__opened">{l.openedNote}</p> : null}
              <LocationFacts loc={l} />
              <LocationActions loc={l} />
              <p className="ls__menu">
                Меню этой точки: {pluralPositions(MENU.stats[l.id].total + MENU.classic.items.length)}, с ценами и КБЖУ.
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
