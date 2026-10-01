import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { BRAND } from '@/content/brand'
import { LOCATIONS, hoursText } from '@/content/locations'

export function Footer() {
  return (
    <footer className="ftr on-dark dark">
      <div className="wrap ftr__in">
        <div className="ftr__brand">
          <div className="ftr__logo">
            <Logo height={84} />
          </div>
          <p className="ftr__lead">Bubble tea, кофе и лимонады — пять точек в Воронеже.</p>
          <p className="ftr__small">Оплата: {BRAND.payments.toLowerCase()}.</p>
        </div>

        <nav className="ftr__col" aria-label="Разделы">
          <h2 className="ftr__h">Сайт</h2>
          <ul role="list">
            <li>
              <Link href="/menu">Меню и КБЖУ</Link>
            </li>
            <li>
              <Link href="/locations">Все точки</Link>
            </li>
            <li>
              <Link href="/#brand">О TapiTi</Link>
            </li>
          </ul>
        </nav>

        <div className="ftr__col ftr__col--points">
          <h2 className="ftr__h">Точки · {hoursText(LOCATIONS[0])}</h2>
          <ul role="list">
            {LOCATIONS.map((l) => (
              <li key={l.id}>
                <Link href={`/locations#${l.id}`}>
                  <strong>{l.venue}</strong>
                  <span>
                    {l.address}
                    {l.floor ? `, ${l.floor}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ftr__col">
          <h2 className="ftr__h">Мы в сети</h2>
          <ul role="list">
            <li>
              <a href={BRAND.links.telegram} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </li>
            <li>
              <a href={BRAND.links.vk} target="_blank" rel="noopener noreferrer">
                ВКонтакте
              </a>
            </li>
            <li>
              <a href={BRAND.links.tiktok} target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
            </li>
            <li>
              <a href={BRAND.links.taplink} target="_blank" rel="noopener noreferrer">
                Taplink
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap ftr__legal">
        <p>
          Цены, составы и КБЖУ — по официальному меню TapiTi во ВКонтакте; на точках могут отличаться. Если у вас аллергия на определённые
          ингредиенты, обязательно сообщите бариста. Сайт носит информационный характер.
        </p>
        <p>© TapiTi · Bubble Tea • Coffee • Воронеж</p>
      </div>
    </footer>
  )
}
