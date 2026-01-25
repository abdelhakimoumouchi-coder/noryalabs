'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="font-heading text-3xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-text/70 mb-8">Découvrez nos produits naturels algériens</p>
        <Link
          href="/shop"
          className="inline-block bg-olive text-white px-8 py-3 rounded-lg font-semibold hover:bg-sage transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold mb-8">Mon Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-6 border-b last:border-b-0">
                <Link href={`/product/${item.slug}`} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </Link>

                <div className="flex-1">
                  <Link href={`/product/${item.slug}`} className="font-heading text-lg font-semibold hover:text-olive">
                    {item.name}
                  </Link>
                  <p className="text-olive font-semibold mt-1">{formatPrice(item.priceDa)}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium ml-auto"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.priceDa * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="font-heading text-xl font-semibold mb-4">Résumé</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-text/70">Articles ({totalItems})</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-text/70">
                <span>Livraison</span>
                <span>Calculée à la caisse</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-heading text-lg font-semibold">Total</span>
                <span className="font-heading text-2xl font-bold text-olive">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-olive text-white text-center py-4 rounded-lg font-semibold hover:bg-sage transition-colors mb-3"
            >
              Commander
            </Link>

            <Link
              href="/shop"
              className="block w-full text-center text-olive font-medium hover:underline"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
