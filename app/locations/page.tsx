import type { Metadata } from 'next'
import { LocationsApp } from '@/components/locations/LocationsApp'

export const metadata: Metadata = {
  title: 'Точки в Воронеже: адреса и график',
  description:
    'Пять точек TapiTi в Воронеже: ЖК «Озерки», ТРЦ «Галерея Чижова», ТРЦ «Максимир», парк «Дельфин», ТРЦ «Арена». Адреса, этажи, график работы и ссылки на карты.',
  alternates: { canonical: '/locations' },
}

export default function LocationsPage() {
  return (
    <div className="ls-page">
      <LocationsApp />
    </div>
  )
}
