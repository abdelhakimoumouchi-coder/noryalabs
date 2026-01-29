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
      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src="/hero-watch.jpeg"
          alt="Montre premium Store DZ"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            L’élégance au poignet,<br /> livrée partout en Algérie
          </h1>
          <p className="text-lg md:text-xl text-muted mb-8">
            Montres 100% originales • Qualité premium • Garantie 2 ans
          </p>
          <Link href="/shop" className="btn-primary">
            Découvrir la collection
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-surface p-6 rounded-xl text-center shadow-sm text-text">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Livraison en Algérie</h3>
              <p className="text-text/70">Livraison vers les 69 wilayas</p>
            </div>

            <div className="bg-surface p-6 rounded-xl text-center shadow-sm text-text">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Paiement à la livraison</h3>
              <p className="text-text/70">Payez en toute sécurité</p>
            </div>

            <div className="bg-surface p-6 rounded-xl text-center shadow-sm text-text">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">Produits 100% Originaux</h3>
              <p className="text-text/70">Montres authentiques</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-center mb-2 text-white">Produits Vedettes</h2>
            <p className="text-center text-muted">Nos best-sellers et nouveautés</p>
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

      <section className="bg-accent/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-xl text-text">
              <h3 className="font-heading text-2xl font-bold mb-4">Montre Homme</h3>
              <p className="text-text/70 mb-4">
                Découvrez notre collection exclusive de montres pour hommes, alliant élégance et fonctionnalité.
              </p>
              <Link href="/shop?category=skincare" className="text-accent font-semibold hover:underline">
                Découvrir →
              </Link>
            </div>

            <div className="bg-surface p-8 rounded-xl text-text">
              <h3 className="font-heading text-2xl font-bold mb-4">Montre Femme</h3>
              <p className="text-text/70 mb-4">
                Découvrez notre collection exclusive de montres pour femmes, alliant élégance et fonctionnalité.
              </p>
              <Link href="/shop?category=haircare" className="text-accent font-semibold hover:underline">
                Découvrir →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}