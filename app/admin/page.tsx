'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-40 text-[#d4af37] font-semibold">
        Chargement...
      </div>
    )
  }

  const stats = [
    {
      label: 'Commandes du jour',
      value: data.todayOrders,
      icon: ShoppingBag,
    },
    {
      label: 'En attente',
      value: data.pendingOrders,
      icon: Clock,
    },
    {
      label: 'Produits',
      value: data.totalProducts,
      icon: Package,
    },
    {
      label: 'Revenus (DA)',
      value: data.totalRevenue?.toLocaleString('fr-DZ'),
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black mb-10 text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-[#111827] border border-[#d4af37]/20 rounded-2xl p-6 hover:border-[#d4af37]/40 transition"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-xs uppercase tracking-wide">
                  {stat.label}
                </span>

                <span className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                  <Icon size={20} />
                </span>
              </div>

              <div className="text-3xl font-black text-white">
                {stat.value}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}