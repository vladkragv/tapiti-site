/**
 * Public site URL. Not known at build time of the demo — set NEXT_PUBLIC_SITE_URL in production
 * (used for canonical, Open Graph and sitemap).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
