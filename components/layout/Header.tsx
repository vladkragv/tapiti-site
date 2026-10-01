'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/ui/Icon'
import { BRAND } from '@/content/brand'
import { ordering } from '@/content/ordering'

const NAV = [
  { href: '/menu', label: 'Меню', tone: 'pink' },
  { href: '/locations', label: 'Точки', tone: 'mint' },
  { href: '/#brand', label: 'О TapiTi', tone: 'lilac' },
] as const

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="hdr" data-scrolled={scrolled} data-home={pathname === '/'}>
      <div className="hdr__in">
        <Link href="/" className="hdr__logo" aria-label="TapiTi — на главную" translate="no">
          <Logo size={68} priority />
        </Link>

        <nav className="hdr__nav" aria-label="Основная навигация">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname === n.href ? 'page' : undefined} className={`bbtn bbtn--${n.tone}`}>
              <span className="bbtn__shine" aria-hidden="true" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hdr__social">
          {ordering.mode === 'external' && ordering.url ? (
            <a className="btn" href={ordering.url} rel="noopener noreferrer" target="_blank">
              {ordering.label ?? 'Заказать'}
            </a>
          ) : null}
          <a className="sbtn sbtn--vk" href={BRAND.links.vk} target="_blank" rel="noopener noreferrer" aria-label="TapiTi во ВКонтакте">
            <Icon name="vk" size={26} />
          </a>
          <a className="sbtn sbtn--tg" href={BRAND.links.telegram} target="_blank" rel="noopener noreferrer" aria-label="TapiTi в Telegram">
            <Icon name="tg" size={26} />
          </a>
        </div>
      </div>
    </header>
  )
}
