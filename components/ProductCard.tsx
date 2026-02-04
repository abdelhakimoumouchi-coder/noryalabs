'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

const FALLBACK_IMG = '/placeholder.jpg'

const pickLocalImage = (images: string[]) => {
  if (!Array.isArray(images)) return FALLBACK_IMG
  const local = images.find((src) => src.startsWith('/uploads/'))
  return local || FALLBACK_IMG
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
    <div className="group card overflow-hidden bg-gradient-to-b from-card to-surface hover:shadow-soft hover:-translate-y-1 transition duration-200 border border-border/60 rounded-xl">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-highlight">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = FALLBACK_IMG
            }}
          />
          {product.isFeatured && (
            <span className="absolute top-3 left-3 bg-accent text-background text-xs font-semibold px-3 py-1 rounded-full shadow-soft">
              Coup de cœur
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted uppercase tracking-wide">{categoryLabel}</p>
        <h3 className="font-heading text-lg font-semibold text-text line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-accent">{formatPrice(product.priceDa)}</p>

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
          <div className="flex md:hidden flex-col gap-2">
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
        </div>
      </div>
    </div>
  )
}