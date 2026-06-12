import type { Metadata } from 'next'
import ShopClient from '@/components/ShopClient'
import { prisma } from '@/lib/prisma'
import { buildPageMetadata, normalizeProduct, SITE_URL } from '@/lib/seo'
import { Category, Product } from '@/types'

export const dynamic = 'force-dynamic'

type ShopPageProps = {
  searchParams?: Promise<{ category?: string }>
}

function decodeCategory(category?: string) {
  if (!category) return ''
  try {
    return decodeURIComponent(category)
  } catch {
    return category
  }
}

function metadataForCategory(category: string): Metadata {
  const normalized = category.toLowerCase()
  if (normalized.includes('homme')) {
    return buildPageMetadata({
      title: 'Montres Homme Premium Originales en Algérie - Store DZ',
      description: 'Sélection de montres homme premium, élégantes et originales. Livraison dans toute l’Algérie, paiement à la livraison.',
      path: `/shop?category=${encodeURIComponent(category)}`,
    })
  }

  if (normalized.includes('femme')) {
    return buildPageMetadata({
      title: 'Montres Femme Premium Originales en Algérie - Store DZ',
      description: 'Découvrez nos montres femme premium, raffinées et originales. Livraison partout en Algérie avec garantie 2 ans.',
      path: `/shop?category=${encodeURIComponent(category)}`,
    })
  }

  return buildPageMetadata({
    title: `${category} - Store DZ Algérie`,
    description: `Découvrez notre sélection ${category.toLowerCase()} chez Store DZ. Montres premium originales avec livraison partout en Algérie et paiement à la livraison.`,
    path: `/shop?category=${encodeURIComponent(category)}`,
  })
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams
  const category = decodeCategory(params?.category)
  if (category) return metadataForCategory(category)

  return buildPageMetadata({
    title: 'Boutique Montres Homme & Femme Premium - Store DZ Algérie',
    description: 'Découvrez notre collection de montres homme et femme premium, originales et garanties. Livraison partout en Algérie avec paiement à la livraison.',
    path: '/shop',
  })
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const category = decodeCategory(params?.category)
  const where = category ? { category } : {}

  const [productsRaw, total, categoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { subcategory: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ])

  const products = productsRaw.map(normalizeProduct) as Product[]
  const categories = categoriesRaw as Category[]

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category || 'Boutique Montres Homme & Femme Premium - Store DZ Algérie',
    url: category ? `${SITE_URL}/shop?category=${encodeURIComponent(category)}` : `${SITE_URL}/shop`,
    description: category
      ? `Collection ${category.toLowerCase()} premium disponible en Algérie avec paiement à la livraison.`
      : 'Collection de montres homme et femme premium originales disponible en Algérie.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ShopClient
        initialProducts={products}
        initialCategories={categories}
        initialCategory={category}
        initialPagination={{
          page: 1,
          pageSize: 12,
          total,
          totalPages: Math.ceil(total / 12),
        }}
      />
    </>
  )
}
