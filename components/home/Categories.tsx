'use client'

import Link from 'next/link'
import { CupImage } from '@/components/ui/CupImage'
import { Icon } from '@/components/ui/Icon'
import { MQ, useScene } from '@/components/motion/useScene'
import { runMotif, type Motif } from './motifs'

export type CatPanel = {
  id: string
  name: string
  lead: string
  verb: string
  count: number
  motif: Motif
  bg: string
  fg: string
  accent: string
  cups: string[]
  words?: string[]
}

const Steam = () => (
  <svg viewBox="0 0 60 140" aria-hidden="true">
    <path d="M30 138c-18-20 18-30 0-52S12 42 30 4" />
  </svg>
)

function Deco({ motif }: { motif: Motif }) {
  switch (motif) {
    case 'bubble':
      return (
        <>
          <i className="bubble bubble--violet" style={{ ['--s' as string]: '38px' }} />
          <i className="bubble" style={{ ['--s' as string]: '26px' }} />
          <i className="bubble bubble--pink" style={{ ['--s' as string]: '32px' }} />
        </>
      )
    case 'fruit':
      return (
        <>
          <i className="slice" />
          <i className="slice slice--pink" />
          <i className="slice slice--lime" />
        </>
      )
    case 'cream':
      return (
        <svg className="drip" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0h400v36c-18 0-18 40-38 40s-14-30-34-30-14 52-40 52-20-60-44-60-18 40-42 40-18-70-44-70-20 54-44 54-18-30-40-30-14 46-36 46-18-58-38-58z" />
        </svg>
      )
    case 'calm':
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className="bar" />
          ))}
        </>
      )
    case 'dark':
    case 'warm':
      return (
        <>
          <span className="steam">
            <Steam />
          </span>
          <span className="steam">
            <Steam />
          </span>
          <span className="steam">
            <Steam />
          </span>
        </>
      )
    case 'ice':
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className="shard" />
          ))}
        </>
      )
    case 'light':
      return <i className="slice slice--big" />
    default:
      return null
  }
}

/**
 * Scene 04 — «Что у нас есть».
 * Desktop: pinned horizontal track, 9 category panels — each category has its own motion motif (see motifs.ts).
 * Phone: no horizontal scrolling — a sticky stack of cards that scale back as the next one arrives.
 */
export function Categories({ panels }: { panels: CatPanel[] }) {
  const ref = useScene<HTMLElement>(({ gsap, mm, root, ScrollTrigger }) => {
    const pin = root.querySelector<HTMLElement>('.cats__pin')!
    const track = root.querySelector<HTMLElement>('.cats__track')!
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.cat'))
    const dots = Array.from(root.querySelectorAll<HTMLElement>('.cats__dot'))

    mm.add(MQ.desktop, () => {
      root.classList.add('is-h')
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
      const main = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.45,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)))
            dots.forEach((d, k) => d.classList.toggle('is-on', k === i))
          },
        },
      })
      cards.forEach((card, i) => {
        const motif = (card.dataset.motif ?? 'classic') as Motif
        runMotif(gsap, card, motif, () => ({
          trigger: card,
          containerAnimation: main,
          start: i === 0 ? 'left 55%' : 'left 88%',
          end: 'right 12%',
          scrub: true,
        }))
      })
      return () => root.classList.remove('is-h')
    })

    mm.add(MQ.mobile, () => {
      cards.forEach((card, i) => {
        // entrance: cups pop up once (the «Классика» card has words, not cups)
        const cupEls = card.querySelectorAll('.cat__cup')
        if (cupEls.length) gsap.from(cupEls, {
          y: 60,
          opacity: 0,
          rotation: (k) => (k % 2 ? 6 : -6),
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        })
        // stack: previous card recedes while the next one covers it
        const next = cards[i + 1]
        if (next) {
          gsap.to(card, {
            scale: 0.93,
            filter: 'brightness(0.88)',
            ease: 'none',
            transformOrigin: '50% 0%',
            scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 18%', scrub: true },
          })
        }
      })
      ScrollTrigger.sort()
    })
  })

  return (
    <section ref={ref} className="cats scene" id="categories" aria-labelledby="cats-title">
      <div className="wrap cats__intro">
        <p className="eyebrow cats__eyebrow">Что у нас есть</p>
        <h2 id="cats-title" className="display cats__title">
          Девять способов выпить вкусно
        </h2>
      </div>

      <div className="cats__pin">
        <ul className="cats__track" role="list">
          {panels.map((p, i) => (
            <li key={p.id} className="cat" data-motif={p.motif} style={{ ['--pbg' as string]: p.bg, ['--pfg' as string]: p.fg, ['--pac' as string]: p.accent, ['--i' as string]: i }}>
              <div className="cat__deco" aria-hidden="true">
                <Deco motif={p.motif} />
              </div>

              <div className="cat__text">
                <p className="cat__num display" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="display cat__name">{p.name}</h3>
                <p className="cat__lead">{p.lead}</p>
                <p className="cat__count">
                  <strong>{p.count}</strong> {countWord(p.count)}
                </p>
                <Link href={`/menu?cat=${p.id}`} className="btn cat__btn">
                  {p.verb} <Icon name="arrow" className="arrow" />
                </Link>
              </div>

              <div className="cat__art" aria-hidden="true">
                {p.words ? (
                  <div className="cat__words">
                    {p.words.map((w) => (
                      <span key={w} className="cat__word display">
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="cat__ring">
                    {p.cups.map((id, k) => (
                      <div key={id} className="cat__cup" style={{ ['--k' as string]: k }}>
                        <div className="cat__cup-in">
                          <CupImage id={id} height={320} sizes="(min-width: 900px) 230px, 110px" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <ol className="cats__dots" aria-hidden="true">
          {panels.map((p, i) => (
            <li key={p.id} className={`cats__dot${i === 0 ? ' is-on' : ''}`} />
          ))}
        </ol>
      </div>
    </section>
  )
}

function countWord(n: number) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'позиция'
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'позиции'
  return 'позиций'
}

