'use client'

import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-[#d4af37]/20 p-6 flex flex-col">
        <h2 className="text-xl font-black text-[#d4af37] mb-10">
          Store Dz Admin
        </h2>

        <nav className="flex flex-col gap-5 text-sm">
          <Link href="/admin" className="flex items-center gap-3 hover:text-[#d4af37] transition">
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link href="/admin/orders" className="flex items-center gap-3 hover:text-[#d4af37] transition">
            <ShoppingBag size={18} /> Commandes
          </Link>

          <Link href="/admin/products" className="flex items-center gap-3 hover:text-[#d4af37] transition">
            <Package size={18} /> Produits
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 text-red-400 hover:text-red-500 transition"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
}