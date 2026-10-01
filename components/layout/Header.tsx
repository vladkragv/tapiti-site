'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { BRAND } from '@/content/brand'
import { ordering } from '@/content/ordering'

const NAV = [
  { href: '/menu', label: 'Меню' },
  { href: '/locations', label: 'Точки' },
  { href: '/#brand', label: 'О TapiTi' },
]

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
      <div className="hdr__in wrap">
        <Link href="/" className="hdr__logo" aria-label="TapiTi — на главную" translate="no">
          <Logo height={42} priority />
        </Link>

        <nav className="hdr__nav" aria-label="Основная навигация">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname === n.href ? 'page' : undefined} className="hdr__link">
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
          <a className="hdr__icon" href={BRAND.links.vk} target="_blank" rel="noopener noreferrer" aria-label="VK — TapiTi во ВКонтакте">
            <span aria-hidden="true">VK</span>
          </a>
          <a className="hdr__icon" href={BRAND.links.telegram} target="_blank" rel="noopener noreferrer" aria-label="TG — TapiTi в Telegram">
            <span aria-hidden="true">TG</span>
          </a>
        </div>
      </div>
    </header>
  )
}
