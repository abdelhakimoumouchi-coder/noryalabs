'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { WILAYAS } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [errors, setErrors] = useState<any>({})

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    wilaya: '',
    address: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          const fieldErrors: any = {}
          data.details.forEach((err: any) => {
            fieldErrors[err.path[0]] = err.message
          })
          setErrors(fieldErrors)
        } else {
          alert(data.error || 'Erreur lors de la commande')
        }
        setLoading(false)
        return
      }

      setOrderId(data.orderId)
      setSuccess(true)
      clearCart()
    } catch (error) {
      alert('Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !success) {
    router.push('/cart')
    return null
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-heading text-4xl font-bold mb-4">Commande confirmée !</h1>
        <p className="text-xl text-text/70 mb-2">Merci pour votre commande</p>
        <p className="text-text/60 mb-8">Numéro de commande: <span className="font-mono font-semibold">{orderId}</span></p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-green-900 font-semibold mb-2">Nous avons bien reçu votre commande</p>
          <p className="text-green-700 text-sm">
            Vous serez contacté sous peu pour confirmer la livraison. Paiement à la livraison.
          </p>
        </div>

        <a
          href="/"
          className="inline-block bg-olive text-white px-8 py-3 rounded-lg font-semibold hover:bg-sage transition-colors"
        >
          Retour à l'accueil
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm p-6">
            <h2 className="font-heading text-2xl font-semibold mb-6">Informations de livraison</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
                {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone *</label>
                <input
                  type="tel"
                  required
                  placeholder="05 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wilaya *</label>
                <select
                  required
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                >
                  <option value="">Sélectionner une wilaya</option>
                  {WILAYAS.map((wilaya) => (
                    <option key={wilaya} value={wilaya}>{wilaya}</option>
                  ))}
                </select>
                {errors.wilaya && <p className="text-red-500 text-sm mt-1">{errors.wilaya}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adresse complète *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  placeholder="Rue, numéro, quartier..."
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optionnel)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive"
                  placeholder="Instructions de livraison..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-olive text-white py-4 rounded-lg font-semibold hover:bg-sage transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="font-heading text-xl font-semibold mb-4">Votre commande</h2>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-text/70">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">{formatPrice(item.priceDa * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-heading text-lg font-semibold">Total</span>
                <span className="font-heading text-2xl font-bold text-olive">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 font-semibold text-sm mb-1">Paiement à la livraison</p>
              <p className="text-blue-700 text-xs">
                Vous paierez en espèces lors de la réception de votre commande
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
