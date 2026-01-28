'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { Order, OrderStatus } from '@/types'

const STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending',      label: 'En attente',   color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed',    label: 'Confirmé',     color: 'bg-blue-100 text-blue-800' },
  { value: 'in_delivery',  label: 'En livraison', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered',    label: 'Livré',        color: 'bg-green-100 text-green-800' },
  { value: 'canceled',     label: 'Annulé',       color: 'bg-red-100 text-red-800' },
  { value: 'returned',     label: 'Retourné',     color: 'bg-orange-100 text-orange-800' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSecret, setAdminSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticated(true)
    fetchOrders()
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-secret': adminSecret },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data as Order[])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Supprimer cette commande ?')) return
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': adminSecret },
      })
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderId))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-surface p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="font-heading text-2xl font-bold mb-6 text-center">Admin - Gestion des Commandes</h1>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium mb-2">Secret Admin</label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive mb-4"
              placeholder="Entrez le secret admin"
            />
            <button
              type="submit"
              className="w-full bg-olive text-white py-3 rounded-lg font-semibold hover:bg-sage transition-colors"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-4xl font-bold">Gestion des Commandes</h1>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-sage transition-colors"
        >
          Actualiser
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wilaya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const status = STATUSES.find(s => s.value === order.status)
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.id.slice(-8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.firstName} {order.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.wilaya}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatPrice(order.totalDa)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${status?.color || ''}`}
                      >
                        {STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Supprimer la commande"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8l-1-2H9l-1 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune commande pour le moment
          </div>
        )}
      </div>
    </div>
  )
}