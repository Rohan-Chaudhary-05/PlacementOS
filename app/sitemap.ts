import type { MetadataRoute } from 'next'
import { getPublicOpportunities } from '@/lib/opportunities'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://placementos.com'

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/opportunities', priority: 0.9, changeFrequency: 'daily' },
  { path: '/ai-tools', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/ai-tools/cv-tailor', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/ai-tools/cover-letter', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/ai-tools/interview-prep', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/for-companies', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // Real listings only — demo samples must never reach search engines.
  const listings = (await getPublicOpportunities())
    .filter((o) => !o.isDemo && !o.id.startsWith('demo-'))
    .map((o) => ({
      url: `${BASE_URL}/opportunities/${o.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...statics, ...listings]
}
