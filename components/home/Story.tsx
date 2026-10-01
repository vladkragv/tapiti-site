'use client'

import { useRef } from 'react'
import { MQ, useScene } from '@/components/motion/useScene'
import { BRAND } from '@/content/brand'
import { VIDEO } from '@/lib/media/photos'

/**
 * Scene 03 — «Перемешай».
 * Motion idea: image-mask reveal + scale-to-focus. The pour clip opens from the bottom of an arch while its inner
 * video zooms 1.45→1; two giant outlined words slide in opposite directions behind it (typographic layering).
 */
export function Story() {
  const vid = useRef<HTMLVideoElement>(null)

  const ref = useScene<HTMLElement>(({ gsap, mm, root, ScrollTrigger }) => {
    const arch = root.querySelector<HTMLElement>('.story__arch')!
    const inner = root.querySelector<HTMLElement>('.story__arch video')!
    const w1 = root.querySelector<HTMLElement>('.story__w1')!
    const w2 = root.querySelector<HTMLElement>('.story__w2')!
    const quotes = gsap.utils.toArray<HTMLElement>('.story__quote', root)

    mm.add(MQ.motion, () => {
      const isDesk = window.matchMedia('(min-width: 900px)').matches
      gsap.fromTo(
        arch,
        { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 32px 32px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 999px 999px 32px 32px)',
          ease: 'power2.inOut',
          scrollTrigger: { trigger: arch, start: 'top 88%', end: 'top 32%', scrub: 0.6 },
        },
      )
      gsap.fromTo(inner, { scale: 1.45 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: arch, start: 'top 88%', end: 'bottom 30%', scrub: true } })
      const k = isDesk ? 14 : 22
      gsap.fromTo(w1, { xPercent: -k }, { xPercent: k * 0.4, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo(w2, { xPercent: k }, { xPercent: -k * 0.4, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } })
      quotes.forEach((q, i) => {
        gsap.from(q, {
          y: 46,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: q, start: 'top 88%', once: true },
        })
      })
      // autoplay only while visible (saves battery, avoids decoding offscreen video)
      ScrollTrigger.create({
        trigger: arch,
        start: 'top 95%',
        end: 'bottom 5%',
        onToggle: (self) => {
          const v = vid.current
          if (!v) return
          if (self.isActive) v.play().catch(() => {})
          else v.pause()
        },
      })
    })
  })

  return (
    <section ref={ref} className="story scene" aria-labelledby="story-title">
      <div className="story__words" aria-hidden="true">
        <span className="story__w1 display">Пере</span>
        <span className="story__w2 display">мешай</span>
      </div>

      <div className="wrap story__in">
        <div className="story__text">
          <p className="eyebrow story__eyebrow">Фирменный ритуал</p>
          <h2 id="story-title" className="display story__title">
            Главный секрет&nbsp;— перемешай
          </h2>
          <p className="lead story__lead">
            Слои вкуса раскрываются, когда напиток перемешан. Крем, тапиока, джус-болл и топпинг — всё встречается в одном глотке.
          </p>
        </div>

        <div className="story__media">
          <div className="story__arch">
            <video ref={vid} muted loop playsInline preload="metadata" poster={VIDEO.pour.poster} aria-label="Как готовят напиток: добавляют крем и сироп. Кадры из ролика TapiTi">
              <source src={VIDEO.pour.src} type="video/mp4" />
            </video>
          </div>
        </div>

        <div className="story__quotes">
          <figure className="story__quote">
            <blockquote>{BRAND.quotes.mix.text}</blockquote>
            <figcaption>
              <a href={`https://t.me/tapiti_vrn/${BRAND.quotes.mix.tg}`} target="_blank" rel="noopener noreferrer">
                Telegram TapiTi · {BRAND.quotes.mix.date}
              </a>
            </figcaption>
          </figure>
          <figure className="story__quote story__quote--b">
            <blockquote>{BRAND.quotes.shake.text}</blockquote>
            <figcaption>
              <a href={`https://t.me/tapiti_vrn/${BRAND.quotes.shake.tg}`} target="_blank" rel="noopener noreferrer">
                Telegram TapiTi · {BRAND.quotes.shake.date}
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
