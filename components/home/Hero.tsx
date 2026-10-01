'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { CupImage } from '@/components/ui/CupImage'
import { MQ, useScene } from '@/components/motion/useScene'
import { photo } from '@/lib/media/photos'

const hero = photo('hero-cheers')

/**
 * Scene 01 — Hero depth.
 * Motion idea: layered parallax. Slowest → fastest: doodles, bubbles, the full-bleed photo, cups; the text barely moves.
 * Entrance is pure CSS (works without JS); scroll depth is GSAP/ScrollTrigger (desktop strong, phone gentle).
 */
export function Hero({ drinks }: { drinks: number }) {
  const ref = useScene<HTMLElement>(({ gsap, mm, root }) => {
    const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', root)
    const build = (k: number) => {
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth ?? '0')
        gsap.to(el, {
          y: -d * k,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
      gsap.to('.hero__doodles', {
        backgroundPosition: `0px ${k * 0.22}px`,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      })
    }
    mm.add(MQ.desktop, () => build(260))
    mm.add(MQ.mobile, () => build(90))
  })

  return (
    <section ref={ref} className="hero scene" aria-labelledby="hero-title">
      <div className="hero__doodles doodles" aria-hidden="true" />

      {/* full-bleed real photo, dissolving into the teal field */}
      <div className="hero__photo" aria-hidden="true">
        <div className="hero__photo-in" data-depth="0.18">
          <Image
            src={hero.src}
            alt=""
            width={hero.w}
            height={hero.h}
            priority
            sizes="(min-width: 900px) 52vw, 100vw"
            style={{ objectPosition: '50% 38%' }}
          />
        </div>
      </div>

      <div className="hero__bubbles" aria-hidden="true">
        <i className="bubble bubble--violet hero__b1" data-depth="0.18" style={{ ['--s' as string]: '150px' }} />
        <i className="bubble hero__b2" data-depth="0.3" style={{ ['--s' as string]: '70px' }} />
        <i className="bubble bubble--pink hero__b3" data-depth="0.45" style={{ ['--s' as string]: '96px' }} />
      </div>

      <div className="wrap hero__in">
        <div className="hero__copy">
          <p className="hero__pill eyebrow">
            <span className="hero__dot" aria-hidden="true" />
            Воронеж · 5 точек
          </p>
          <h1 id="hero-title" className="display hero__title">
            <span className="line line--brand">
              <span translate="no">TapiTi</span>
            </span>
            <span className="line">
              <span>яркие вкусы</span>
            </span>
            <span className="line">
              <span className="hero__title-hl">в каждом глотке</span>
            </span>
          </h1>
          <p className="lead hero__lead">
            Бабл-ти с тапиокой и джус-боллами, матча, кофе, лимонады и азиатские сладости. Пять точек в&nbsp;Воронеже: заходи за любимым вкусом.
          </p>
          <div className="hero__cta">
            <Link className="btn" href="/menu">
              Смотреть меню <Icon name="arrow" className="arrow" />
            </Link>
            <Link className="btn btn--ghost" href="/locations">
              Найти точку
            </Link>
          </div>
          <dl className="hero__facts">
            <div>
              <dt>точек в городе</dt>
              <dd className="display">5</dd>
            </div>
            <div>
              <dt>напитков в меню</dt>
              <dd className="display">{drinks}</dd>
            </div>
            <div>
              <dt>ежедневно</dt>
              <dd className="display">10–22</dd>
            </div>
          </dl>
        </div>

        <div className="hero__stage" aria-hidden="true">
          <div className="hero__cup hero__cup--a" data-depth="1.1">
            <CupImage id="matcha-zaklyate-lesa" height={300} sizes="(min-width: 900px) 220px, 120px" priority />
          </div>
          <div className="hero__cup hero__cup--b" data-depth="0.8">
            <CupImage id="frappe-klubnika-marakuyya" height={250} sizes="(min-width: 900px) 180px, 100px" />
          </div>
          <div className="hero__cup hero__cup--c" data-depth="1.5">
            <CupImage id="milk-tea-dynnyy-banan" height={210} sizes="(min-width: 900px) 150px, 84px" />
          </div>
          <svg className="hero__badge" viewBox="0 0 200 200" role="presentation">
            <defs>
              <path id="hero-circ" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
            </defs>
            <circle cx="100" cy="100" r="98" fill="#1b0a3a" />
            <text fontFamily="var(--font-display)" fontWeight="700" fontSize="15.500" letterSpacing="3.200" fill="#2fd0c4">
              <textPath href="#hero-circ">BUBBLE TEA • COFFEE • LEMONADE •</textPath>
            </text>
            <circle cx="100" cy="100" r="9" fill="#ff82c8" />
          </svg>
        </div>
      </div>
    </section>
  )
}
