import Image from 'next/image'
import { BRAND } from '@/content/brand'

/** Official wordmark (flood-fill cut from the Telegram logo post). */
export function Logo({ height = 44, priority = false }: { height?: number; priority?: boolean }) {
  const w = Math.round((height * 921) / 745)
  return (
    <Image
      src="/brand/logo.webp"
      alt={`${BRAND.name} — ${BRAND.tagline}`}
      width={w}
      height={height}
      priority={priority}
      sizes={`${w}px`}
      style={{ width: w, height }}
    />
  )
}
