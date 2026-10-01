import Image from 'next/image'
import { BRAND } from '@/content/brand'

/** Brand mark: the round Tapi the fox artwork (reference/brand/fox-logo-source.webp). */
export function Logo({ size = 64, priority = false }: { size?: number; priority?: boolean }) {
  return (
    <Image
      src="/brand/fox-logo.webp"
      alt={`${BRAND.name} — лисёнок Тапи`}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className="fox-logo"
      style={{ width: size, height: size }}
    />
  )
}
