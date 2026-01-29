'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const { totalItems } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-heading text-2xl font-bold text-accent hover:text-accentDark transition">
            Store Dz
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '/', label: 'Accueil' },
              { href: '/shop', label: 'Boutique' },
              { href: '/about', label: 'À propos' },
              { href: '/delivery', label: 'Livraison' },
              { href: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted hover:text-text transition font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-text hover:border-accent transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-semibold">Panier</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-background text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}