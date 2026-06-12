import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/favicon.ico',
        '/favicon-16x16.png',
        '/favicon-32x32.png',
        '/favicon-48x48.png',
        '/favicon-96x96.png',
        '/apple-touch-icon.png',
        '/site.webmanifest',
        '/assets/',
      ],
      disallow: ['/admin', '/cart', '/checkout', '/login', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
