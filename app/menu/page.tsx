import type { Metadata } from 'next'
import { MenuApp } from '@/components/menu/MenuApp'

export const metadata: Metadata = {
  title: 'Меню с ценами и КБЖУ',
  description:
    'Меню TapiTi по каждой из пяти точек в Воронеже: бабл-ти, матча, кофе, фраппе, лимонады, горячие чаи. Цены, объёмы M и L, состав и КБЖУ.',
  alternates: { canonical: '/menu' },
}

export default function MenuPage() {
  return (
    <div className="mp-page">
      <MenuApp />
    </div>
  )
}
