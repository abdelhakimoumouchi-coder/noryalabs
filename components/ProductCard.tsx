'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const router = useRouter()

  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || '/placeholder.jpg'

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
      slug: product.slug,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div className="group card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200">
      <Link href={href}>
        <div className="relative aspect-square overflow-hidden bg-background">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4">
        <p className="text-sm text-muted uppercase tracking-wide mb-1">{categoryLabel}</p>
        <h3 className="font-heading text-lg font-semibold text-text mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-accent">{formatPrice(product.priceDa)}</p>

        <div className="mt-4 space-y-2">
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