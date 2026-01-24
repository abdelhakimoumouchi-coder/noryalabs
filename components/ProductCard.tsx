import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  slug: string
  name: string
  priceDa: number
  category: string
  images: string[]
}

export default function ProductCard({ product }: { product: Product }) {
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || '/placeholder.jpg'

  return (
    <Link
      href={`/product/${product.slug}`}
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
          {product.category === 'skincare' ? 'Soin de la peau' : 'Soin des cheveux'}
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
