'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
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
 * Runs a GSAP/ScrollTrigger scene against a ref'd root. GSAP is loaded lazily (one shared chunk).
 *
 * IMPORTANT (route changes): ScrollTrigger pins wrap the pinned node in a `.pin-spacer`. If React removes the
 * old page while those wrappers still exist, `removeChild` throws and Next shows «This page couldn't load».
 * Passive-effect cleanups run AFTER React has already detached DOM, so the revert lives in a layout-effect
 * cleanup, which runs before the nodes are removed.
 */
export function useScene<T extends HTMLElement = HTMLElement>(setup: (api: SceneApi) => void) {
  const ref = useRef<T>(null)
  const ctxRef = useRef<ReturnType<typeof GSAPType.context> | null>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    cancelled.current = false
    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled.current) return
      gsap.registerPlugin(ScrollTrigger)
      ctxRef.current = gsap.context(() => {
        const mm = gsap.matchMedia()
        setup({ gsap, ScrollTrigger, mm, root: el })
      }, el)
    })()
    // scenes are built once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    return () => {
      cancelled.current = true
      ctxRef.current?.revert()
      ctxRef.current = null
    }
  }, [])

  return ref
}
