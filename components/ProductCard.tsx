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
    <div className="group bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={href}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4">
        <p className="text-sm text-sage uppercase tracking-wide mb-1">{categoryLabel}</p>
        <h3 className="font-heading text-lg font-semibold text-text mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-olive">{formatPrice(product.priceDa)}</p>

        <div className="mt-4 space-y-2">
          {/* Desktop : visible au survol, empilés */}
          <div className="hidden md:flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full px-3 py-2 text-sm rounded-lg border border-olive text-olive hover:bg-olive hover:text-white transition"
            >
              Ajouter au panier
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full px-3 py-2 text-sm rounded-lg bg-olive text-white hover:bg-sage transition"
            >
              Acheter maintenant
            </button>
          </div>
          {/* Mobile : toujours visibles, empilés */}
          <div className="flex md:hidden flex-col gap-2">
            <button
              onClick={handleAddToCart}
              className="w-full px-3 py-2 text-sm rounded-lg border border-olive text-olive hover:bg-olive hover:text-white transition"
            >
              Ajouter au panier
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full px-3 py-2 text-sm rounded-lg bg-olive text-white hover:bg-sage transition"
            >
              Acheter maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}