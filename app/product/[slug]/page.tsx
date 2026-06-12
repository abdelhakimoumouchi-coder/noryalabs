import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailsClient from '@/components/ProductDetailsClient'
import { prisma } from '@/lib/prisma'
import { absoluteUrl, buildPageMetadata, categoryLabel, normalizeProduct, SITE_URL, truncateMeta } from '@/lib/seo'
import { Product } from '@/types'

export const dynamic = 'force-dynamic'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { subcategory: true },
  })

  return product ? (normalizeProduct(product) as Product) : null
}

function productDescription(product: Product) {
  return product.description?.trim() ||
    `${product.name} est une ${categoryLabel(product.category).toLowerCase()} disponible chez Store DZ en Algérie, avec livraison nationale et paiement à la livraison.`
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return buildPageMetadata({
      title: 'Produit non trouvé - Store DZ',
      description: 'Ce produit Store DZ est introuvable ou indisponible.',
      path: `/product/${slug}`,
      robots: 'noindex, follow',
    })
  }

  const title = `${product.name} - Montre Premium Originale en Algérie`
  const description = truncateMeta(
    `${productDescription(product)} Livraison partout en Algérie, paiement à la livraison et garantie 2 ans.`
  )
  const image = product.images[0] || '/og-image.jpg'

  return buildPageMetadata({
    title,
    description,
    path: `/product/${product.slug}`,
    image,
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map(absoluteUrl),
    description: productDescription(product),
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'DZD',
      price: String(product.priceDa),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailsClient product={product} />
    </>
  )
}
