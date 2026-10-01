import type { gsap as GSAPType } from 'gsap'

type G = typeof GSAPType
type Vars = Record<string, unknown>

/**
 * Per-category motion «motifs» for the horizontal category scene. Each motif drives its panel while the
 * panel travels through the viewport (ScrollTrigger + containerAnimation) — every category moves differently:
 *   bubble → orbit · fruit → rise & float · cream → top-down reveal · calm → vertical bars · dark → crop-in
 *   ice → creamy zoom · light → horizontal sweep · warm → steam · classic → word cascade
 */
export type Motif = 'bubble' | 'fruit' | 'cream' | 'calm' | 'dark' | 'ice' | 'light' | 'warm' | 'classic'

export function runMotif(gsap: G, panel: HTMLElement, motif: Motif, st: () => object) {
  const q = (s: string) => Array.from(panel.querySelectorAll<HTMLElement>(s))
  const cups = q('.cat__cup')
  const deco = q('.cat__deco > *')
  const tl = gsap.timeline({ scrollTrigger: st(), defaults: { ease: 'none' } })
  const on = (els: HTMLElement[] | HTMLElement | null, from: Vars, to: Vars, pos: number | string = 0) => {
    if (!els || (Array.isArray(els) && !els.length)) return
    tl.fromTo(els, from, to, pos)
  }
  const ring = q('.cat__ring')[0] ?? null

  switch (motif) {
    case 'bubble': {
      on(ring, { rotation: -38 }, { rotation: 38 })
      // counter-rotate every cup so it stays upright while its orbit slot (k·120°) turns with the ring
      q('.cat__cup-in').forEach((el, k) => {
        gsap.set(el, { xPercent: -50, yPercent: -50 })
        on(el, { rotation: 38 - k * 120 }, { rotation: -38 - k * 120 })
      })
      on(deco, { rotation: -60 }, { rotation: 120, transformOrigin: '50% 260%' })
      break
    }
    case 'fruit': {
      cups.forEach((c, i) => on(c, { y: 190 + i * 40 }, { y: -30 - i * 10 }))
      deco.forEach((d, i) => on(d, { y: 120 + i * 60, scale: 0.7 }, { y: -220 - i * 60, scale: 1.25, rotation: 90 }))
      break
    }
    case 'cream': {
      cups.forEach((c, i) => on(c, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', duration: 0.5 }, i * 0.14))
      on(deco, { yPercent: -120 }, { yPercent: 0, duration: 0.6, ease: 'power2.out' })
      tl.to({}, { duration: 0.3 })
      break
    }
    case 'calm': {
      on(deco, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', stagger: 0.07, duration: 0.5 })
      cups.forEach((c, i) => on(c, { yPercent: -45 - i * 8, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.1 + i * 0.08))
      break
    }
    case 'dark': {
      on(ring, { scale: 1.45, rotation: -5 }, { scale: 1, rotation: 0 })
      cups.forEach((c) => on(c, { clipPath: 'inset(34% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }))
      on(deco, { opacity: 0, y: 30 }, { opacity: 0.8, y: -40, stagger: 0.1 }, 0.1)
      break
    }
    case 'ice': {
      on(ring, { scale: 0.7 }, { scale: 1.12 })
      on(deco, { rotation: -20, x: -40 }, { rotation: 35, x: 60, stagger: 0.05 })
      break
    }
    case 'light': {
      cups.forEach((c, i) => on(c, { x: 300 + i * 90 }, { x: -60 - i * 30 }))
      on(deco, { rotation: 0 }, { rotation: 110 })
      break
    }
    case 'warm': {
      deco.forEach((d, i) => on(d, { yPercent: 20, opacity: 0 }, { yPercent: -35 - i * 10, opacity: 0.9, duration: 0.7, ease: 'power1.out' }, i * 0.1))
      cups.forEach((c, i) => on(c, { y: 40 + i * 14 }, { y: -10 }))
      break
    }
    case 'classic': {
      on(q('.cat__word'), { xPercent: -80, opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out' })
      tl.to({}, { duration: 0.5 })
      break
    }
  }
  return tl
}
