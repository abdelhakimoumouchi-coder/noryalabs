import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { SITE_URL, STORE_PHONE, homeDescription, normalizeProduct } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featuredProductsRaw = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
  const featuredProducts = featuredProductsRaw.map(normalizeProduct) as Product[]

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Store DZ',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Boutique algérienne de montres premium homme et femme, 100% originales, avec livraison partout en Algérie.',
    areaServed: {
      '@type': 'Country',
      name: 'Algeria',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: STORE_PHONE,
      contactType: 'customer service',
      areaServed: 'DZ',
      availableLanguage: ['fr', 'ar'],
    },
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Store DZ',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="bg-background text-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero-watch.jpeg"          // Vérifie l'extension exacte
          alt="Montre premium Store DZ"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
          unoptimized                      // enlève ceci si l’optimisation fonctionne chez toi
        />
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-text mb-6 drop-shadow-lg">
            L’élégance au poignet,<br /> livrée partout en Algérie
          </h1>
          <p className="text-lg md:text-xl text-muted mb-8">
            {homeDescription}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href="/shop" className="btn-primary">
              Découvrir la collection
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUITS VEDETTES */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title">Produits Vedettes</h2>
            <p className="section-subtitle">Nos best-sellers et nouveautés</p>
          </div>

          <div className="mb-12">
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="flex sm:hidden gap-4 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {featuredProducts.map((product) => (
                <div key={product.id} className="min-w-[260px] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold bg-text text-background hover:bg-text/90 transition"
            >
              Voir Tous les Produits
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES CALL-OUT */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #0F1420 0%, #0B101A 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Carte Homme */}
          <div className="card p-0 text-text overflow-hidden flex flex-row items-stretch">
            <div className="p-8 flex-1 flex flex-col justify-center">
              <h3 className="font-heading text-2xl font-bold mb-4">Montre Homme</h3>
              <p className="text-muted mb-4">
                Collection exclusive, élégance et performance.
              </p>
              <Link
                href="/shop?category=montre pour homme"
                className="text-accent font-semibold hover:underline">
                Découvrir →
              </Link>
            </div>
            <div className="relative w-48 min-h-[170px]">
              <Image
                src="/homme.jpg"
                alt="Montre homme premium originale Store DZ"
                fill
                quality={95}
                sizes="(max-width: 768px) 50vw, 12rem"
                className="object-cover object-center rounded-r-xl"
                unoptimized
              />
            </div>
          </div>

          {/* Carte Femme */}
          <div className="card p-0 text-text overflow-hidden flex flex-row items-stretch">
            <div className="p-8 flex-1 flex flex-col justify-center">
              <h3 className="font-heading text-2xl font-bold mb-4">Montre Femme</h3>
              <p className="text-muted mb-4">
                Style, raffinement et fiabilité au quotidien.
              </p>
              <Link
                href="/shop?category=montre pour femme"
                className="text-accent font-semibold hover:underline">
                Découvrir →
              </Link>
            </div>
            <div className="relative w-48 min-h-[170px]">
              <Image
                src="/femme.jpg"
                alt="Montre femme élégante premium en Algérie"
                fill
                quality={95}
                sizes="(max-width: 768px) 50vw, 12rem"
                className="object-cover object-center rounded-r-xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Livraison en Algérie',
                desc: 'Vers toutes les wilayas, suivi assuré',
                icon: (
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ),
              },
              {
                title: 'Paiement à la livraison',
                desc: 'Payez en toute sécurité à la réception',
                icon: (
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
              {
                title: 'Produits 100% Originaux',
                desc: 'Authenticité garantie, qualité premium',
                icon: (
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="card p-6 text-text">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
