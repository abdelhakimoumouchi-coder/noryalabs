'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

const FALLBACK_IMG = '/placeholder.jpg'

const pickLocalImage = (images: string[]) => {
  if (!Array.isArray(images)) return FALLBACK_IMG
  const img = images.find((src) => typeof src === 'string' && src.length > 0)
  return img || FALLBACK_IMG
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const router = useRouter()

  const mainImage = pickLocalImage(product.images || [])

  const categoryLabel =
    product.category === 'skincare'
      ? 'Soin de la peau'
      : product.category === 'haircare'
        ? 'Soin des cheveux'
        : product.category || 'Autre'

  const href = product.slug ? `/product/${product.slug}` : '/shop'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      priceDa: product.priceDa,
      quantity: 1,
      image: mainImage,
      slug: product.slug ?? '',
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div className="group card overflow-hidden bg-gradient-to-b from-card to-surface hover:shadow-soft hover:-translate-y-1 transition duration-200 border border-border/60 rounded-lg sm:rounded-xl">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-highlight">
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = FALLBACK_IMG
            }}
          />
          {product.isFeatured && (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-accent text-background text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-soft">
              Coup de cœur
            </span>
          )}
        </div>
      </Link>

      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wide truncate">{categoryLabel}</p>
        <h3 className="font-heading text-sm sm:text-lg font-semibold text-text line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-base sm:text-xl font-bold text-accent">{formatPrice(product.priceDa)}</p>

        <div className="space-y-2">
          <div className="hidden md:flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border text-text hover:border-accent hover:text-accent transition"
            >
              Ajouter au panier
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full px-3 py-2 text-sm rounded-lg bg-accent text-background hover:bg-accentDark transition"
            >
              Acheter maintenant
            </button>
          </div>
          <div className="flex md:hidden flex-col gap-1.5">
            <button
              onClick={handleAddToCart}
              className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-border text-text hover:border-accent hover:text-accent transition"
            >
              Ajouter
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full px-2 py-1.5 text-[11px] rounded-lg bg-accent text-background hover:bg-accentDark transition"
            >
              Acheter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
