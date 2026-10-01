'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { MQ, useScene } from '@/components/motion/useScene'
import { WALL_BOTTOM, WALL_TOP, type WallTile } from '@/content/social'
import { VIDEO, photo } from '@/lib/media/photos'
import { BRAND } from '@/content/brand'

const ALL: WallTile[] = [...WALL_TOP, ...WALL_BOTTOM]

function Tile({ t, onOpen, idx }: { t: WallTile; onOpen: (i: number) => void; idx: number }) {
  const vref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = vref.current
    if (!v) return
    // muted decorative loop: never autoplay when the visitor asked for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <li className="wall__tile">
      <button type="button" className="wall__btn" onClick={() => onOpen(idx)} aria-label={`Открыть: ${t.caption}`}>
        {t.kind === 'photo' ? (
          <Image
            src={photo(t.key).sm}
            alt={photo(t.key).alt}
            width={photo(t.key).smW}
            height={photo(t.key).smH}
            sizes="(min-width: 900px) 280px, 46vw"
            style={{ objectPosition: t.focus ?? '50% 50%' }}
          />
        ) : (
          <video ref={vref} muted loop playsInline preload="metadata" poster={VIDEO.confetti.poster} aria-label={t.caption}>
            <source src={VIDEO.confetti.src} type="video/mp4" />
          </video>
        )}
        <span className="wall__cap">{t.caption}</span>
      </button>
    </li>
  )
}

/**
 * Scene 07 — Real life wall (Telegram).
 * Motion idea: film strips. Desktop: two rows slide in opposite directions with scroll. Phone: a two-column
 * staggered masonry whose tiles open with a clip-path reveal (no horizontal scroll to fight the thumb).
 */
export function Wall() {
  const dlg = useRef<HTMLDialogElement>(null)
  const [cur, setCur] = useState(0)

  const open = useCallback((i: number) => {
    setCur(i)
    dlg.current?.showModal()
  }, [])
  const step = useCallback((d: number) => setCur((c) => (c + d + ALL.length) % ALL.length), [])

  const ref = useScene<HTMLElement>(({ gsap, mm, root }) => {
    mm.add(MQ.desktop, () => {
      const rows = gsap.utils.toArray<HTMLElement>('.wall__row', root)
      rows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i === 0 ? '4%' : '-24%' },
          { x: i === 0 ? '-24%' : '4%', ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
        )
      })
    })
    mm.add(MQ.mobile, () => {
      gsap.utils.toArray<HTMLElement>('.wall__tile', root).forEach((tile, i) => {
        gsap.fromTo(
          tile,
          { clipPath: 'inset(100% 0% 0% 0% round 18px)', y: 30 },
          { clipPath: 'inset(0% 0% 0% 0% round 18px)', y: 0, duration: 0.9, ease: 'power3.out', delay: (i % 2) * 0.1, scrollTrigger: { trigger: tile, start: 'top 92%', once: true } },
        )
      })
    })
  })

  const t = ALL[cur]
  const isPhoto = t.kind === 'photo'
  const ph = isPhoto ? photo(t.key) : null

  return (
    <section ref={ref} className="wall scene" aria-labelledby="wall-title">
      <div className="wrap wall__head">
        <p className="eyebrow wall__eyebrow">Живое</p>
        <h2 id="wall-title" className="display wall__title">
          TapiTi в&nbsp;реальной жизни
        </h2>
        <p className="wall__sub">
          Кадры из{' '}
          <a href={BRAND.links.telegram} target="_blank" rel="noopener noreferrer">
            Telegram-канала
          </a>{' '}
          — гости, стаканы с рисунками, витрины с азиатскими сладостями.
        </p>
      </div>

      <div className="wall__rows">
        <ul className="wall__row" role="list">
          {WALL_TOP.map((tile, i) => (
            <Tile key={`${tile.kind}-${i}`} t={tile} idx={i} onOpen={open} />
          ))}
        </ul>
        <ul className="wall__row wall__row--b" role="list">
          {WALL_BOTTOM.map((tile, i) => (
            <Tile key={`${tile.kind}-b${i}`} t={tile} idx={WALL_TOP.length + i} onOpen={open} />
          ))}
        </ul>
      </div>

      <dialog
        ref={dlg}
        className="sheet lightbox"
        aria-label="Просмотр"
        onClick={(e) => {
          if (e.target === dlg.current) dlg.current?.close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        <div className="lightbox__body">
          <button type="button" className="sheet__close" onClick={() => dlg.current?.close()} aria-label="Закрыть">
            <Icon name="close" />
          </button>
          <div className="lightbox__media">
            {ph ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} />
            ) : (
              <video src={VIDEO.confetti.src} poster={VIDEO.confetti.poster} muted loop playsInline autoPlay controls aria-label={t.caption} />
            )}
          </div>
          <div className="lightbox__bar">
            <button type="button" className="chip" onClick={() => step(-1)} aria-label="Предыдущее">
              ←
            </button>
            <p>{t.caption}</p>
            {ph ? (
              <a className="chip" href={ph.telegram} target="_blank" rel="noopener noreferrer">
                Пост в Telegram <Icon name="external" size={16} />
              </a>
            ) : (
              <a className="chip" href={t.kind === 'video' ? t.tg : BRAND.links.telegram} target="_blank" rel="noopener noreferrer">
                Telegram <Icon name="external" size={16} />
              </a>
            )}
            <button type="button" className="chip" onClick={() => step(1)} aria-label="Следующее">
              →
            </button>
          </div>
        </div>
      </dialog>
    </section>
  )
}
