'use client'

import { useEffect } from 'react'

/** Re-measures ScrollTrigger once fonts + images have settled (pins depend on final layout). */
export function MotionBoot() {
  useEffect(() => {
    let alive = true
    const refresh = async () => {
      if (!alive) return
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (!alive) return
      gsap.registerPlugin(ScrollTrigger)
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }
    const t1 = window.setTimeout(refresh, 600)
    const onLoad = () => window.setTimeout(refresh, 200)
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
    document.fonts?.ready.then(() => alive && window.setTimeout(refresh, 120))
    return () => {
      alive = false
      window.clearTimeout(t1)
      window.removeEventListener('load', onLoad)
    }
  }, [])
  return null
}
