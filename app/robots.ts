import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://placementos.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/staff/', '/student/', '/company/', '/auth/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
