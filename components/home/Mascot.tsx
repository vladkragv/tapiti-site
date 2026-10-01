'use client'

import Image from 'next/image'
import { MQ, useScene } from '@/components/motion/useScene'
import { MASCOT_DECK } from '@/content/social'
import { photo } from '@/lib/media/photos'

/**
 * Scene 08 — Лисёнок Тапи.
 * Motion idea: a deck of the brand's own character posters. Desktop: pinned, the top card peels off along an arc
 * (translate + rotate) revealing the next. Phone: no pin — cards tilt in alternately.
 */
export function Mascot() {
  const ref = useScene<HTMLElement>(({ gsap, mm, root }) => {
    const cards = gsap.utils.toArray<HTMLElement>('.mascot__card', root)
    const count = root.querySelector<HTMLElement>('.mascot__count')

    mm.add(MQ.desktop, () => {
      root.classList.add('is-pin')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${cards.length * 70}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(cards.length - 1, Math.floor(self.progress * cards.length))
            if (count) count.textContent = `0${i + 1} / 0${cards.length}`
          },
        },
      })
      cards.forEach((c, i) => {
        gsap.set(c, { zIndex: cards.length - i, rotation: (i % 2 ? 1 : -1) * (2 + i), y: i * 6 })
        if (i < cards.length - 1) {
          tl.to(c, { x: '-72%', y: -60, rotation: -26, opacity: 0, duration: 1, ease: 'power2.in' }, i)
          tl.fromTo(cards[i + 1], { scale: 0.94 }, { scale: 1, rotation: 0, y: 0, duration: 1, ease: 'power2.out' }, i)
        }
      })
      return () => root.classList.remove('is-pin')
    })

    mm.add(MQ.mobile, () => {
      cards.forEach((c, i) => {
        gsap.fromTo(
          c,
          { rotation: i % 2 ? 9 : -9, y: 70, opacity: 0 },
          { rotation: i % 2 ? 2.2 : -2.2, y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 88%', once: true } },
        )
      })
    })
  })

  return (
    <section ref={ref} className="mascot scene" id="brand" aria-labelledby="mascot-title">
      <i className="bubble bubble--violet mascot__b1" aria-hidden="true" style={{ ['--s' as string]: '120px' }} />
      <i className="bubble mascot__b2" aria-hidden="true" style={{ ['--s' as string]: '64px' }} />
      <div className="wrap mascot__in">
        <div className="mascot__text">
          <p className="eyebrow mascot__eyebrow">О TapiTi</p>
          <h2 id="mascot-title" className="display mascot__title">
            Знакомьтесь: лисёнок&nbsp;Тапи
          </h2>
          <p className="lead">
            Тапи напоминает, что в TapiTi вас всегда ждёт тепло, доброжелательность и комфорт. Здесь каждый гость как дома.
          </p>
          <p className="mascot__src">С&nbsp;июля 2024 года Тапи встречает гостей в&nbsp;Воронеже: сначала на Озерках, теперь на пяти точках по городу.</p>
          <p className="mascot__count display" aria-hidden="true">
            01 / 0{MASCOT_DECK.length}
          </p>
        </div>

        <ul className="mascot__deck" role="list">
          {MASCOT_DECK.map((k, i) => {
            const p = photo(k)
            return (
              <li key={k} className="mascot__card" style={{ ['--r' as string]: `${i % 2 ? 2 : -2}deg` }}>
                <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(min-width: 900px) 34vw, 78vw" />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

