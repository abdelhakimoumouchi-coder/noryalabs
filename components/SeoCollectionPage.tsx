import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { prisma } from '@/lib/prisma'
import { normalizeProduct } from '@/lib/seo'
import { Product } from '@/types'

type SeoCollectionPageProps = {
  h1: string
  intro: string[]
  productFilter?: {
    categoryContains?: string
  }
  links?: Array<{
    href: string
    label: string
  }>
}

export default async function SeoCollectionPage({
  h1,
  intro,
  productFilter,
  links = [],
}: SeoCollectionPageProps) {
  const productsRaw = await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
      ...(productFilter?.categoryContains
        ? {
            category: {
              contains: productFilter.categoryContains,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { subcategory: true },
  })

  const products = productsRaw.map(normalizeProduct) as Product[]

  return (
    <div className="bg-background text-text">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold mb-6">{h1}</h1>
        <div className="space-y-4 text-text/80 leading-7">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="btn-secondary">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title text-left">Sélection Store DZ</h2>
              <p className="section-subtitle text-left">
                Des montres disponibles avec paiement à la livraison en Algérie.
              </p>
            </div>
            <Link href="/shop" className="hidden sm:inline-flex text-accent font-semibold hover:underline">
              découvrir nos montres premium
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-muted">
              La collection sera mise à jour prochainement. Vous pouvez consulter toute la boutique ou nous contacter
              pour connaître les modèles disponibles.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
