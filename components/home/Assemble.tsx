'use client'

import { useRef } from 'react'
import { MQ, useScene } from '@/components/motion/useScene'
import { VIDEO } from '@/lib/media/photos'

const STEPS = [
  { n: '01', t: 'Шарики на дно', d: 'Тапиока или джус-болл — нежные, мармеладной консистенции. С них всё начинается.' },
  { n: '02', t: 'Чай, кофе, матча', d: 'Основа напитка: молочный чай, кофе, матча, фруктовый чай или лимонад.' },
  { n: '03', t: 'Сливочный крем', d: 'Шапка из сливочного крема почти в каждом молочном напитке.' },
  { n: '04', t: 'Хруст сверху', d: 'Гранола, крошка орео, фисташка — и перемешать перед первым глотком.' },
]

/**
 * Scene 02 — «Из чего собран стакан».
 * Motion idea: scroll scrubs a real TapiTi clip (a cup being filled). The scene is entered through a brand-colour
 * circle wipe (teal → ink); the video window scales to focus, captions swap per progress. Distinct from the hero's parallax.
 */
export function Assemble() {
  const video = useRef<HTMLVideoElement>(null)

  const ref = useScene<HTMLElement>(({ gsap, mm, root, ScrollTrigger }) => {
    const bg = root.querySelector<HTMLElement>('.asm__bg')!
    const win = root.querySelector<HTMLElement>('.asm__window')!
    const bar = root.querySelector<HTMLElement>('.asm__bar > i')!
    const steps = Array.from(root.querySelectorAll<HTMLElement>('.asm__step'))
    const vid = video.current!
    vid.pause()
    // the clip (≈3 MB) is only fetched when the scene is about 1.5 screens away
    ScrollTrigger.create({
      trigger: root,
      start: 'top 250%',
      once: true,
      onEnter: () => {
        vid.preload = 'auto'
        vid.load()
      },
    })

    const build = (distance: string, startScale: number) => {
      root.classList.add('is-wipe')
      // 1) circle wipe: teal (hero) → ink while the section scrolls in
      gsap.fromTo(
        bg,
        { clipPath: 'circle(0% at 50% 6%)' },
        {
          clipPath: 'circle(140% at 50% 6%)',
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top 92%', end: 'top 12%', scrub: true },
        },
      )

      // content appears only once the ink has taken over (white text never sits on the teal hand-off)
      gsap.fromTo(
        root.querySelector('.asm__in'),
        { autoAlpha: 0 },
        { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top 50%', end: 'top 14%', scrub: true } },
      )

      // 2) pinned scrub
      let setT: ((v: number) => void) | null = null
      const arm = () => {
        setT = gsap.quickTo(vid, 'currentTime', { duration: 0.28, ease: 'power3.out' }) as (v: number) => void
      }
      if (vid.readyState >= 1) arm()
      else vid.addEventListener('loadedmetadata', arm, { once: true })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${distance}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress
            const vp = Math.min(1, Math.max(0, (p - 0.14) / 0.84))
            if (setT && vid.duration) setT(vp * (vid.duration - 0.06))
            const idx = Math.min(steps.length - 1, Math.floor(vp * steps.length))
            steps.forEach((s, i) => s.classList.toggle('is-active', i === idx))
            gsap.set(bar, { scaleX: vp })
          },
        },
      })
      tl.fromTo(win, { scale: startScale, borderRadius: '56px' }, { scale: 1, borderRadius: '28px', ease: 'power2.out', duration: 0.14 }, 0)
      tl.to({}, { duration: 0.86 })
    }

    mm.add(MQ.desktop, () => build('260%', 0.62))
    mm.add(MQ.mobile, () => build('210%', 0.7))
    ScrollTrigger.sort()
  })

  return (
    <section ref={ref} className="asm scene dark on-dark" aria-labelledby="asm-title">
      <div className="asm__bg" aria-hidden="true" />
      <div className="wrap asm__in">
        <div className="asm__copy">
          <p className="eyebrow asm__eyebrow">Как собирается стакан</p>
          <h2 id="asm-title" className="display asm__title">
            Слой за&nbsp;слоем
          </h2>
          <ol className="asm__steps" role="list">
            {STEPS.map((s, i) => (
              <li key={s.n} className={`asm__step${i === 0 ? ' is-active' : ''}`}>
                <span className="asm__n display">{s.n}</span>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="asm__stage">
          <div className="asm__window">
            <video ref={video} muted playsInline preload="metadata" poster={VIDEO.assembly.poster} aria-label="Как собирается напиток в TapiTi: слой за слоем">
              <source src={VIDEO.assembly.src} type="video/mp4" />
            </video>
          </div>
          <div className="asm__bar" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </section>
  )
}
