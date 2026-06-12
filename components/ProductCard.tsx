'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { categoryLabel } from '@/lib/seo'

const FALLBACK_IMG = '/placeholder.jpg'

const pickLocalImage = (images: string[]) => {
  if (!Array.isArray(images)) return FALLBACK_IMG
  const img = images.find((src) => typeof src === 'string' && src.length > 0)
  return img || FALLBACK_IMG
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const firstColor = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null
  const mainImage = firstColor?.imageUrl || pickLocalImage(product.images || [])
  const isOutOfStock = product.stock <= 0
  const hasPromotion = !!product.oldPriceDa && product.oldPriceDa > product.priceDa
  const discountPercent = hasPromotion
    ? Math.round(((product.oldPriceDa! - product.priceDa) / product.oldPriceDa!) * 100)
    : 0

  const href = product.slug ? `/product/${product.slug}` : '/shop'

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      priceDa: product.priceDa,
      quantity: 1,
      image: mainImage,
      slug: product.slug ?? '',
      selectedColorName: firstColor?.name || null,
      selectedColorHex: firstColor?.hex || null,
      selectedColorImage: firstColor?.imageUrl || null,
    })
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-card to-surface shadow-card transition duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-soft">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-highlight">
          <img
            src={mainImage}
            alt={`${categoryLabel(product.category).toLowerCase()} originale ${product.name} en Algérie`}
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
          {isOutOfStock && (
            <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-soft">
              Rupture de stock
            </span>
          )}
          {hasPromotion && !isOutOfStock && (
            <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-soft">
              -{discountPercent}%
            </span>
          )}
          <span className="absolute bottom-2 right-2 hidden rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-text backdrop-blur transition group-hover:block">
            Voir
          </span>
        </div>
      </Link>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wide truncate">{categoryLabel(product.category)}</p>
        <Link href={href}>
          <h3 className="font-heading text-sm sm:text-lg font-semibold text-text line-clamp-2 leading-snug hover:text-accent">
            {product.name}
          </h3>
        </Link>
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                className="h-4 w-4 rounded-full border border-white/25"
                style={{ backgroundColor: color.hex || '#C6A15B' }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && <span className="text-xs text-muted">+{product.colors.length - 4}</span>}
          </div>
        )}
        <div>
          {hasPromotion && (
            <p className="text-xs sm:text-sm text-muted line-through">{formatPrice(product.oldPriceDa!)}</p>
          )}
          <p className="text-base sm:text-xl font-bold text-accent">{formatPrice(product.priceDa)}</p>
        </div>

        <div className="space-y-2 pt-1">
          <div className="hidden md:grid grid-cols-2 gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
            <Link
              href={href}
              className="w-full px-3 py-2 text-center text-sm rounded-lg border border-border text-text hover:border-accent hover:text-accent transition"
            >
              Voir le produit
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full px-3 py-2 text-sm rounded-lg bg-accent text-background hover:bg-accentDark transition disabled:bg-gray-600"
            >
              {isOutOfStock ? 'Indispo' : 'Ajouter'}
            </button>
          </div>
          <div className="grid md:hidden grid-cols-1 gap-1.5">
            <Link
              href={href}
              className="w-full px-2 py-2 text-center text-[11px] rounded-lg border border-border text-text hover:border-accent hover:text-accent transition"
            >
              Voir le produit
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full px-2 py-2 text-[11px] rounded-lg bg-accent text-background hover:bg-accentDark transition disabled:bg-gray-600"
            >
              {isOutOfStock ? 'Indispo' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
