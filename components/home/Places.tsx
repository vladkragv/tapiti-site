'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LocationFacts, LocationActions } from '@/components/locations/LocationCard'
import { LocationVisual } from '@/components/locations/LocationVisual'
import { Icon } from '@/components/ui/Icon'
import { MQ, useScene } from '@/components/motion/useScene'
import { LOCATIONS } from '@/content/locations'
import type { LocationId } from '@/content/types'

/**
 * Scene 06a — «5». Typography scale transition: the numeral scales up until it fills the viewport and
 * its colour becomes the next scene's background (violet) — a continuous hand-off, not a fade.
 */
export function BigFive() {
  const ref = useScene<HTMLElement>(({ gsap, mm, root }) => {
    const num = root.querySelector<HTMLElement>('.five__num')!
    const txt = root.querySelector<HTMLElement>('.five__txt')!
    const flood = root.querySelector<HTMLElement>('.five__flood')!
    const build = (dist: string, maxScale: number) => {
      const origin = () => {
        const r = num.getBoundingClientRect()
        const p = root.getBoundingClientRect()
        // centre of the glyph body (slightly below the middle — the bowl of the «5»)
        return { x: r.left - p.left + r.width * 0.5, y: r.top - p.top + r.height * 0.62 }
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: `+=${dist}`, pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true },
        defaults: { ease: 'none' },
      })
      tl.fromTo(num, { scale: 1 }, { scale: maxScale, transformOrigin: '50% 62%', ease: 'power2.in', duration: 1 }, 0)
      tl.to(txt, { opacity: 0, y: -40, duration: 0.25 }, 0)
      tl.fromTo(
        flood,
        { clipPath: () => `circle(0px at ${origin().x}px ${origin().y}px)` },
        { clipPath: () => `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${origin().x}px ${origin().y}px)`, duration: 0.45, ease: 'power2.in' },
        0.55,
      )
    }
    mm.add(MQ.desktop, () => build('150%', 38))
    mm.add(MQ.mobile, () => build('120%', 30))
  })

  return (
    <section ref={ref} className="five scene" aria-label="Пять точек в Воронеже">
      <div className="five__flood" aria-hidden="true" />
      <div className="five__in wrap">
        <span className="five__num display" aria-hidden="true">
          5
        </span>
        <div className="five__txt">
          <h2 className="display five__title">точек TapiTi по&nbsp;всему Воронежу</h2>
          <p className="five__sub">Озерки · Чижова · Максимир · Дельфин · Арена</p>
        </div>
      </div>
    </section>
  )
}

/** Scene 06b — «Где тебе ближе?» Selected point changes the photo (mask wipe), details and links. */
export function HomePlaces() {
  const [sel, setSel] = useState<LocationId>('maximir')
  const loc = LOCATIONS.find((l) => l.id === sel)!

  return (
    <section className="places scene dark on-dark" id="places" aria-labelledby="places-title">
      <div className="wrap places__in">
        <div className="places__list-wrap">
          <p className="eyebrow places__eyebrow">Точки TapiTi</p>
          <h2 id="places-title" className="display places__title">
            Где тебе ближе?
          </h2>
          <div className="places__list" role="group" aria-label="Выберите точку">
            {LOCATIONS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                className="places__btn"
                aria-pressed={sel === l.id}
                onClick={() => setSel(l.id)}
                style={{ ['--ac' as string]: l.accent }}
              >
                <span className="places__n display" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="places__name display">{l.name}</span>
                <span className="places__venue">{l.venue}</span>
              </button>
            ))}
          </div>
          <Link href="/locations" className="places__all">
            Все точки и карты <Icon name="arrow" size={20} />
          </Link>
        </div>

        <article className="places__card" aria-live="polite" aria-atomic="true">
          <div className="places__visual" key={`v-${loc.id}`}>
            <LocationVisual loc={loc} sizes="(min-width: 900px) 46vw, 92vw" />
          </div>
          <div className="places__info" key={`i-${loc.id}`}>
            <h3 className="display places__h3">{loc.venue}</h3>
            {loc.openedNote ? <p className="places__opened">{loc.openedNote}</p> : null}
            <LocationFacts loc={loc} />
            <LocationActions loc={loc} light />
          </div>
        </article>
      </div>
    </section>
  )
}
