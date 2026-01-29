'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const { totalItems } = useCart()

  return (
    <nav className="bg-surface shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-heading text-2xl font-bold text-noir">
            Store Dz
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-text hover:text-olive transition-colors">
              Accueil
            </Link>
            <Link href="/shop" className="text-text hover:text-olive transition-colors">
              Boutique
            </Link>
            <Link href="/about" className="text-text hover:text-olive transition-colors">
              À propos
            </Link>
            <Link href="/delivery" className="text-text hover:text-olive transition-colors">
              Livraison
            </Link>
            <Link href="/contact" className="text-text hover:text-olive transition-colors">
              Contact
            </Link>
          </div>

          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-4 py-2 bg-olive text-white rounded-lg hover:bg-sage transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
