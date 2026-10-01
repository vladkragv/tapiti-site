import mediaJson from '@/content/data/media.json'

export type Photo = { src: string; sm: string; w: number; h: number; smW: number; smH: number; color: string; alt: string; telegram: string }

const MEDIA = mediaJson as unknown as Record<string, Photo>

export function photo(key: string): Photo {
  const p = MEDIA[key]
  if (!p) throw new Error(`Unknown photo key: ${key}`)
  return p
}

export const hasPhoto = (key?: string): key is string => !!key && key in MEDIA

export const VIDEO = {
  assembly: { src: '/media/video/assembly.mp4', poster: '/media/video/assembly-poster.jpg', w: 540, h: 960 },
  pour: { src: '/media/video/pour.mp4', poster: '/media/video/pour-poster.jpg', w: 540, h: 960 },
  confetti: { src: '/media/video/confetti.mp4', poster: '/media/video/confetti-poster.jpg', w: 480, h: 688 },
} as const
