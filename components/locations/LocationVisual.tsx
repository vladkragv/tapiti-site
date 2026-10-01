import Image from 'next/image'
import { CupImage } from '@/components/ui/CupImage'
import type { Location } from '@/content/types'
import { hasPhoto, photo } from '@/lib/media/photos'

const TILE_CUPS: Record<string, string[]> = {
  arena: ['matcha-smurfito', 'frappe-krem-kiss', 'milk-tea-klubnichnyy-oreo'],
}

/**
 * Real photo of the point when one exists in the Telegram export; otherwise a typographic tile
 * (no stock, no invented imagery).
 */
export function LocationVisual({ loc, sizes, priority }: { loc: Location; sizes: string; priority?: boolean }) {
  if (hasPhoto(loc.image)) {
    const p = photo(loc.image)
    return (
      <div className="lv lv--photo" style={{ background: p.color }}>
        <Image
          src={p.src}
          alt={p.alt}
          width={p.w}
          height={p.h}
          sizes={sizes}
          priority={priority}
          style={{ objectPosition: loc.focus ?? '50% 50%' }}
        />
        {loc.imageNote ? <span className="lv__note">{loc.imageNote}</span> : null}
      </div>
    )
  }
  const cups = TILE_CUPS[loc.id] ?? []
  return (
    <div className="lv lv--tile" style={{ ['--ac' as string]: loc.accent }}>
      <span className="lv__big display" aria-hidden="true">
        {loc.name}
      </span>
      <div className="lv__cups" aria-hidden="true">
        {cups.map((id) => (
          <CupImage key={id} id={id} height={260} sizes="140px" />
        ))}
      </div>
      <p className="lv__cap">
        {loc.venue}
        {loc.floor ? ` · ${loc.floor}` : ''}
      </p>
    </div>
  )
}
