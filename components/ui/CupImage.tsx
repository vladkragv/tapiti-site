import Image from 'next/image'
import { CUPS, cupSrc } from '@/content/menu'

/** Real cup photo cut out of the official TapiTi menu (transparent WebP). */
export function CupImage({
  id,
  height,
  alt = '',
  className,
  priority,
  sizes,
}: {
  id: string
  /** intrinsic display height in CSS px (used for width/height + sizes) */
  height: number
  alt?: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const m = CUPS[id]
  const ratio = m ? m.w / m.h : 0.62
  const w = Math.round(height * ratio)
  return (
    <Image
      src={cupSrc(id)}
      alt={alt}
      width={w}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes ?? `${w}px`}
      // cups are small pre-optimised WebP cut-outs (≈10–25 KB); the optimiser would only add latency
      unoptimized
      aria-hidden={alt ? undefined : true}
      draggable={false}
    />
  )
}
