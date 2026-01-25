'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/Toast'
import { Product } from '@/types'

export default function ProductPage() {
  const params = useParams()
  const { addItem } = useCart()
  const { showToast, ToastComponent } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [params.slug])

  const fetchProduct = async () => {
    const res = await fetch(`/api/products/${params.slug}`)
    const data = await res.json()
    setProduct(data)
    setLoading(false)
  }

  const handleAddToCart = () => {
    if (!product) return

    const images = Array.isArray(product.images) ? product.images : []
    addItem({
      productId: product.id,
      name: product.name,
      priceDa: product.priceDa,
      quantity,
      image: images[0] || '',
      slug: product.slug,
    })
    showToast('Produit ajouté au panier', 'success')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Produit non trouvé</h1>
      </div>
    )
  }

  const images = Array.isArray(product.images) ? product.images : []
  const benefits = Array.isArray(product.benefits) ? product.benefits : []

  return (
    <>
      {ToastComponent}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      selectedImage === idx ? 'ring-2 ring-olive' : ''
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-sage uppercase tracking-wide mb-2">
              {product.category === 'skincare' ? 'Soin de la peau' : 'Soin des cheveux'}
            </p>
            <h1 className="font-heading text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-olive mb-6">{formatPrice(product.priceDa)}</p>

            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold mb-3">Bienfaits</h2>
              <ul className="space-y-2">
                {benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold mb-3">Description</h2>
              <p className="text-text/80 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-surface p-6 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Quantité</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-sm text-text/60">
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-olive text-white py-4 rounded-lg font-semibold hover:bg-sage transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
            >
              {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
            </button>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-green-900">Paiement à la livraison</p>
                <p className="text-green-700">Livraison dans toute l'Algérie</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t p-4 z-40">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-olive text-white py-3 rounded-lg font-semibold hover:bg-sage transition-colors disabled:bg-gray-300"
          >
            Ajouter au panier - {formatPrice(product.priceDa * quantity)}
          </button>
        </div>
      </div>
    </>
  )
}
