'use client'

import { useEffect, useRef } from 'react'
import type { gsap as GSAPType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export type SceneApi = {
  gsap: typeof GSAPType
  ScrollTrigger: typeof ScrollTriggerType
  mm: ReturnType<typeof GSAPType.matchMedia>
  root: HTMLElement
}

/** Media queries that decide which motion variant a scene builds. Reduced motion → nothing is built. */
export const MQ = {
  desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
} as const

/**
 * Runs a GSAP/ScrollTrigger scene against a ref'd root. GSAP is loaded lazily (one shared chunk),
 * everything created inside is reverted on unmount / route change.
 */
export function useScene<T extends HTMLElement = HTMLElement>(setup: (api: SceneApi) => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    let ctx: ReturnType<typeof GSAPType.context> | undefined
    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia()
        setup({ gsap, ScrollTrigger, mm, root: el })
      }, el)
    })()
    return () => {
      cancelled = true
      ctx?.revert()
    }
    // scenes are built once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

