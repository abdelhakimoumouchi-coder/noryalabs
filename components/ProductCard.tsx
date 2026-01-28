import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const rawImages =
    Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string'
        ? [product.images]
        : []

  const normalizedImages = rawImages
    .filter(Boolean)
    .map((img) => img.trim())
    .filter((img) => img.length > 0)
    .map((img) => (img.startsWith('/') ? img : `/${img}`))

  const mainImage = normalizedImages[0] || '/placeholder.jpg'

  const categoryLabel =
    product.category === 'skincare'
      ? 'Soin de la peau'
      : product.category === 'haircare'
        ? 'Soin des cheveux'
        : product.category || 'Autre'

  const href = product.slug ? `/product/${product.slug}` : '/shop'

  return (
    <Link
      href={href}
      className="group bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-sage uppercase tracking-wide mb-1">
          {categoryLabel}
        </p>
        <h3 className="font-heading text-lg font-semibold text-text mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-olive">
          {formatPrice(product.priceDa)}
        </p>
      </div>
    </Link>
  )
}