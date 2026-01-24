import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 6,
  }) as Product[]

  return (
    <div>
      <section className="bg-gradient-to-br from-sage/20 to-olive/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-text mb-6">
              Beauté Naturelle Algérienne
            </h1>
            <p className="text-xl text-text/80 mb-8 max-w-2xl mx-auto">
              Découvrez nos produits de beauté artisanaux, fabriqués avec des ingrédients naturels du terroir algérien
            </p>
            <Link
              href="/shop"
              className="inline-block bg-olive text-white px-8 py-4 rounded-lg font-semibold hover:bg-sage transition-colors text-lg"
            >
              Découvrir la Collection
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-surface p-6 rounded-xl text-center shadow-sm">
              <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Livraison en Algérie</h3>
              <p className="text-text/70">Livraison vers les 58 wilayas</p>
            </div>

            <div className="bg-surface p-6 rounded-xl text-center shadow-sm">
              <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Paiement à la livraison</h3>
              <p className="text-text/70">Payez en toute sécurité</p>
            </div>

            <div className="bg-surface p-6 rounded-xl text-center shadow-sm">
              <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Produits 100% Naturels</h3>
              <p className="text-text/70">Ingrédients authentiques</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-center mb-2">Produits Vedettes</h2>
            <p className="text-center text-text/70">Nos best-sellers et nouveautés</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="inline-block bg-text text-surface px-8 py-3 rounded-lg font-semibold hover:bg-text/90 transition-colors"
            >
              Voir Tous les Produits
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-olive/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-xl">
              <h3 className="font-heading text-2xl font-bold mb-4">Soin de la Peau</h3>
              <p className="text-text/70 mb-4">
                Huiles précieuses, savons artisanaux et masques naturels pour une peau rayonnante
              </p>
              <Link href="/shop?category=skincare" className="text-olive font-semibold hover:underline">
                Découvrir →
              </Link>
            </div>

            <div className="bg-surface p-8 rounded-xl">
              <h3 className="font-heading text-2xl font-bold mb-4">Soin des Cheveux</h3>
              <p className="text-text/70 mb-4">
                Henné, huiles nourrissantes et soins capillaires traditionnels
              </p>
              <Link href="/shop?category=haircare" className="text-olive font-semibold hover:underline">
                Découvrir →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
