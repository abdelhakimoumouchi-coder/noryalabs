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
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [params.slug])

  const fetchProduct = async () => {
    const res = await fetch(`/api/products/${params.slug}`)
    const data = await res.json()
    setProduct(data)
    setLoading(false)
    if (Array.isArray(data?.colors) && data.colors.length > 0) {
      setSelectedCharacteristic(data.colors[0])
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
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
  const characteristics = Array.isArray(product.colors) ? product.colors : []

  return (
    <>
      {ToastComponent}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-surface border border-border">
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
                    className={`relative aspect-square rounded-lg overflow-hidden border ${
                      selectedImage === idx ? 'border-accent' : 'border-border'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted uppercase tracking-wide mb-2">
              {product.category === 'skincare' ? 'Soin de la peau' : product.category === 'haircare' ? 'Soin des cheveux' : product.category}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-text">{product.name}</h1>
            <p className="text-2xl font-bold text-accent mb-6">{formatPrice(product.priceDa)}</p>

            {characteristics.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Caractéristiques</p>
                <div className="flex flex-wrap gap-2">
                  {characteristics.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCharacteristic(c)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        selectedCharacteristic === c ? 'bg-accent text-background border-accent' : 'border-border text-text'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-muted">{product.description}</p>
            </div>

            {benefits.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Bienfaits</p>
                <ul className="list-disc list-inside space-y-1 text-muted">
                  {benefits.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-muted">{product.stock} en stock</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded bg-surface text-text border border-border hover:border-accent hover:text-accent transition flex items-center justify-center font-semibold"
                >
                  -
                </button>
                <span className="w-10 text-center font-semibold text-text">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded bg-surface text-text border border-border hover:border-accent hover:text-accent transition flex items-center justify-center font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-accent text-background py-3 rounded-lg font-semibold hover:bg-accentDark transition"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}