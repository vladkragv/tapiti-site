'use client'

import Link from 'next/link'
import { CupImage } from '@/components/ui/CupImage'
import { Icon } from '@/components/ui/Icon'
import { MQ, useScene } from '@/components/motion/useScene'

export type TeaserItem = {
  id: string
  name: string
  category: string
  from: number
  kcal: number | null
  size: string | null
  hue: number
}

/**
 * Scene 05 — Menu teaser.
 * Motion idea: asymmetric choreography — cards arrive in batches from alternating sides with opposite tilt
 * (one rhythm: 90ms stagger), cups settle with a slight zoom-out. Hover (pointer devices): cup tilts up.
 */
export function Teaser({ items }: { items: TeaserItem[] }) {
  const ref = useScene<HTMLElement>(({ gsap, mm, root, ScrollTrigger }) => {
    mm.add(MQ.motion, () => {
      const cards = gsap.utils.toArray<HTMLElement>('.tz__card', root)
      gsap.set(cards, { opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: (i) => 80 + (i % 2) * 44, x: (i) => (i % 2 ? 40 : -40), rotation: (i) => (i % 2 ? 5 : -5), opacity: 0, scale: 0.94 },
            { y: 0, x: 0, rotation: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.09, overwrite: true },
          ),
      })
      gsap.utils.toArray<HTMLElement>('.tz__cup img', root).forEach((img) => {
        gsap.fromTo(img, { scale: 1.16 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top 100%', end: 'top 35%', scrub: true } })
      })
    })
  })

  return (
    <section ref={ref} className="tz scene" aria-labelledby="tz-title">
      <div className="wrap">
        <header className="tz__head">
          <div>
            <p className="eyebrow tz__eyebrow">Меню</p>
            <h2 id="tz-title" className="display tz__title">
              Из июльского обновления
            </h2>
          </div>
          <p className="tz__note">
            Эти напитки TapiTi показала в посте об обновлённом меню{' '}
            <a href="https://t.me/tapiti_vrn/384" target="_blank" rel="noopener noreferrer">
              15 июля 2026
            </a>
            . Цены и КБЖУ — внутри.
          </p>
        </header>

        <ul className="tz__grid" role="list">
          {items.map((it, i) => (
            <li key={it.id} className="tz__card" style={{ ['--h' as string]: it.hue, ['--n' as string]: i }}>
              <Link href={`/menu?item=${it.id}`} className="tz__link" scroll={false}>
                <span className="tz__disc" aria-hidden="true" />
                <span className="tz__cup" aria-hidden="true">
                  <CupImage id={it.id} height={300} sizes="(min-width: 900px) 160px, 110px" />
                </span>
                <span className="tz__cat">{it.category}</span>
                <span className="tz__name display">{it.name}</span>
                <span className="tz__meta">
                  <span className="tz__price">от {it.from}&nbsp;₽</span>
                  {it.kcal != null ? (
                    <span className="tz__kcal">
                      {String(it.kcal).replace('.', ',')} ккал{it.size ? ` · ${it.size}` : ''}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
          <li className="tz__card tz__card--cta">
            <Link href="/menu" className="tz__cta">
              <span className="display">Всё меню</span>
              <span className="tz__cta-sub">выбрать точку, найти напиток, посмотреть КБЖУ</span>
              <span className="tz__cta-arrow" aria-hidden="true">
                <Icon name="arrow" size={32} />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
