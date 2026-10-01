import type { Metadata, Viewport } from 'next'
import { Onest, Unbounded } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileBar } from '@/components/layout/MobileBar'
import { BRAND } from '@/content/brand'
import { LOCATIONS, hoursText } from '@/content/locations'
import { SITE_URL } from '@/lib/site'
import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/layout.css'
import '@/styles/header.css'
import '@/styles/home.css'
import '@/styles/home-assemble.css'
import '@/styles/home-story.css'
import '@/styles/home-categories.css'
import '@/styles/home-teaser.css'
import '@/styles/home-places.css'
import '@/styles/home-wall.css'
import '@/styles/menu.css'
import '@/styles/locations.css'

const display = Unbounded({
  subsets: ['cyrillic', 'latin'],
  weight: ['500', '700', '800'],
  variable: '--font-unbounded',
  display: 'swap',
})
const body = Onest({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-onest',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TapiTi — bubble tea, кофе и лимонады в Воронеже · 5 точек',
    template: '%s · TapiTi Воронеж',
  },
  description:
    'TapiTi — сеть из пяти точек в Воронеже: бабл-ти с тапиокой и джус-боллами, матча, кофе, лимонады и азиатские сладости. Меню с ценами и КБЖУ по каждой точке, адреса и график.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'TapiTi',
    title: 'TapiTi — bubble tea, кофе и лимонады в Воронеже',
    description: 'Пять точек в Воронеже. Меню с ценами и КБЖУ по каждой точке.',
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#2fd0c4',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = LOCATIONS.map((l) => ({
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  name: `TapiTi — ${l.venue}`,
  url: `${SITE_URL}/locations#${l.id}`,
  servesCuisine: ['Bubble tea', 'Coffee', 'Lemonade'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${l.address}${l.floor ? `, ${l.floor}` : ''}`,
    addressLocality: 'Воронеж',
    addressCountry: 'RU',
  },
  openingHours: 'Mo-Su 10:00-22:00',
  hasMap: l.yandexUrl,
  sameAs: [BRAND.links.vk, BRAND.links.telegram],
  description: hoursText(l),
}))

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          К содержимому
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileBar />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  )
}

