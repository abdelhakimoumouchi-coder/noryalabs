import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString().slice(0, 10)

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/delivery`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        orderBy: { order: 'asc' },
        select: { name: true, updatedAt: true },
      }),
      prisma.product.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { slug: true, updatedAt: true },
      }),
    ])

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(category.name)}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: category.name.toLowerCase().includes('homme') || category.name.toLowerCase().includes('femme') ? 0.8 : 0.7,
    }))

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
  } catch (error) {
    console.error('Unable to generate dynamic sitemap entries:', error)
    return staticRoutes
  }
}
