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
  vk: <path d="M3.5 7.5c.2 5.2 3 8.3 8 8.3h.3v-3c1.8.2 3.2 1.5 3.7 3h2.6c-.7-2.4-2.4-3.8-3.5-4.3 1.1-.6 2.6-2.2 3-4h-2.4c-.5 1.6-1.9 3.1-3.4 3.3V7.5H9.4v5.6C7.8 12.700 5.900 10.900 5.800 7.500z" />,
  tg: <path d="M20.500 4.200 3.600 10.800c-.7.3-.7 1.200 0 1.400l4.200 1.300 1.600 5c.2.600.9.700 1.300.3l2.300-2.100 4.400 3.200c.6.400 1.300.1 1.500-.6l3-14.100c.2-.9-.6-1.500-1.400-1zM9.200 13.300l8.100-5.100-6.200 6.500-.3 3.300z" />,
  tiktok: <path d="M15 3c.3 2.300 1.700 3.800 4 4v3c-1.500 0-2.800-.4-4-1.200V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.200a3 3 0 1 0 2 2.800V3z" />,
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
