'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { BRAND } from '@/content/brand'

/** Phone-only bottom action bar (menu / points / more). Hidden ≥ 900px via CSS. */
export function MobileBar() {
  const pathname = usePathname()
  const dlg = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dlg.current?.close()
  }, [pathname])

  return (
    <>
      <nav className="mbar" aria-label="Быстрая навигация">
        <Link href="/menu" className="mbar__btn" aria-current={pathname === '/menu' ? 'page' : undefined}>
          <Icon name="cup" />
          <span>Меню</span>
        </Link>
        <Link href="/locations" className="mbar__btn" aria-current={pathname === '/locations' ? 'page' : undefined}>
          <Icon name="pin" />
          <span>Точки</span>
        </Link>
        <button type="button" className="mbar__btn" onClick={() => dlg.current?.showModal()} aria-haspopup="dialog">
          <Icon name="more" />
          <span>Ещё</span>
        </button>
      </nav>

      <dialog
        ref={dlg}
        className="sheet sheet--more"
        aria-label="Ещё"
        onClick={(e) => {
          if (e.target === dlg.current) dlg.current?.close()
        }}
      >
        <div className="sheet__body">
          <div className="sheet__grab" aria-hidden="true" />
          <button type="button" className="sheet__close" onClick={() => dlg.current?.close()} aria-label="Закрыть">
            <Icon name="close" />
          </button>
          <p className="eyebrow" style={{ color: 'var(--violet-ink)' }}>
            TapiTi · Воронеж
          </p>
          <ul role="list" className="more-list">
            <li>
              <Link href="/" className="more-list__a">
                Главная
              </Link>
            </li>
            <li>
              <Link href="/#brand" className="more-list__a">
                О TapiTi и лисёнок Тапи
              </Link>
            </li>
            <li>
              <a href={BRAND.links.telegram} className="more-list__a" target="_blank" rel="noopener noreferrer">
                Telegram
                <Icon name="external" size={18} />
              </a>
            </li>
            <li>
              <a href={BRAND.links.vk} className="more-list__a" target="_blank" rel="noopener noreferrer">
                ВКонтакте
                <Icon name="external" size={18} />
              </a>
            </li>
            <li>
              <a href={BRAND.links.tiktok} className="more-list__a" target="_blank" rel="noopener noreferrer">
                TikTok
                <Icon name="external" size={18} />
              </a>
            </li>
          </ul>
          <p className="more-note">Оплата: {BRAND.payments.toLowerCase()}.</p>
        </div>
      </dialog>
    </>
  )
}
