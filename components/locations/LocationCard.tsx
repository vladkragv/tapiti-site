'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { hoursText, openStatus } from '@/content/locations'
import type { Location } from '@/content/types'

/** Live «open now» label — computed on the client for Voronezh time (hydration-safe). */
export function OpenNow({ loc }: { loc: Location }) {
  const [s, setS] = useState<{ open: boolean; label: string } | null>(null)
  useEffect(() => {
    const tick = () => setS(openStatus(loc))
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [loc])
  if (!s) return <span className="open open--idle">{hoursText(loc)}</span>
  return (
    <span className={`open ${s.open ? 'open--on' : 'open--off'}`}>
      <i aria-hidden="true" />
      {s.label}
    </span>
  )
}

export function LocationActions({ loc, light }: { loc: Location; light?: boolean }) {
  return (
    <div className="lc__actions">
      <Link className={`btn ${light ? 'btn--light' : ''}`} href={`/menu?loc=${loc.id}`}>
        Меню этой точки <Icon name="arrow" className="arrow" />
      </Link>
      <a className={`btn btn--ghost`} href={loc.yandexUrl} target="_blank" rel="noopener noreferrer">
        <Icon name="route" size={20} /> Яндекс Карты
      </a>
      <a className={`btn btn--ghost`} href={loc.twoGisUrl} target="_blank" rel="noopener noreferrer">
        2ГИС
      </a>
    </div>
  )
}

export function LocationFacts({ loc }: { loc: Location }) {
  return (
    <dl className="lc__facts">
      <div>
        <dt>Адрес</dt>
        <dd>
          {loc.address}
          {loc.floor ? <span>{loc.floor}</span> : null}
          {loc.landmark ? <span>{loc.landmark}</span> : null}
        </dd>
      </div>
      <div>
        <dt>Часы</dt>
        <dd>
          {hoursText(loc)}
          <OpenNow loc={loc} />
        </dd>
      </div>
    </dl>
  )
}
