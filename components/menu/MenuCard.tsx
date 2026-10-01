import { CupImage } from '@/components/ui/CupImage'
import { MENU, cupInk, cupTone } from '@/content/menu'
import type { LocationId, MenuItem } from '@/content/types'
import { cardKcal, num1, priceFor, rub } from '@/lib/menu/utils'
import { LOCATIONS } from '@/content/locations'

export function MenuCard({
  item,
  loc,
  onOpen,
  ghost,
}: {
  item: MenuItem
  loc: LocationId
  onOpen: (id: string) => void
  /** item is not sold at the selected point (shown dimmed, with where it is available) */
  ghost?: boolean
}) {
  const offer = priceFor(item, ghost ? null : loc)
  const k = cardKcal(item)
  const cat = MENU.categories.find((c) => c.id === item.category)!
  const where = ghost ? item.locationIds.map((id) => LOCATIONS.find((l) => l.id === id)!.name) : null
  return (
    <li className={`mc${ghost ? ' mc--ghost' : ''}`} style={{ ['--tone' as string]: cupTone(item.id), ['--tone-ink' as string]: cupInk(item.id) }}>
      <button type="button" className="mc__btn" onClick={() => onOpen(item.id)} aria-haspopup="dialog">
        <span className="mc__art" aria-hidden="true">
          <CupImage id={item.id} height={210} sizes="160px" />
        </span>
        <span className="mc__price">
          {ghost ? 'от ' : ''}
          {rub(offer.M)}
        </span>
        <span className="mc__body">
          <span className="mc__cat">{cat.short}</span>
          <span className="mc__name display">{item.name}</span>
          <span className="mc__desc">{item.description}</span>
          <span className="mc__meta">
            <span>M 500 мл{offer.L ? ` · L 700 мл ${rub(offer.L)}` : ''}</span>
            {k ? (
              <span className="mc__kcal" title="КБЖУ на размер M, холодный">
                {num1(k.kcal)} ккал
              </span>
            ) : null}
          </span>
          {where ? <span className="mc__where">Есть: {where.join(', ')}</span> : null}
        </span>
      </button>
    </li>
  )
}

