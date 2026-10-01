import { TG_PATH, TIKTOK_PATH, VK_PATH } from './brandIcons'

type IconName = 'cup' | 'pin' | 'more' | 'vk' | 'tg' | 'tiktok' | 'arrow' | 'close' | 'search' | 'route' | 'clock' | 'external' | 'check' | 'flame'

const paths: Record<IconName, React.ReactNode> = {
  cup: (
    <>
      <path d="M5 8h14l-1.4 11a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8z" />
      <path d="M12 8V3.5l3.5-1.5" />
      <path d="M7 12.5h10" opacity=".5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </>
  ),
  vk: <path d={VK_PATH} />,
  tg: <path d={TG_PATH} />,
  tiktok: <path d={TIKTOK_PATH} />,
  arrow: <path d="M4 12h15m0 0-5.500-5.500M19 12l-5.500 5.500" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.200-4.200" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8 18h6.500a3.500 3.500 0 0 0 0-7h-5a3.500 3.500 0 0 1 0-7H16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <path d="M12 7.500V12l3 2" />
    </>
  ),
  external: <path d="M14 4h6v6m0-6-9 9M18 14v4.500a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 4 18.500v-11A1.500 1.500 0 0 1 5.500 6H10" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  flame: <path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 0 1-10 0c0-2 .8-3.200 2-4.500.2 1.500 1 2.200 1.800 2.500C10.500 8 11 5.500 12 3z" />,
}

const filled: IconName[] = ['vk', 'tg', 'tiktok', 'more']

export function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  const isFilled = filled.includes(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  )
}
