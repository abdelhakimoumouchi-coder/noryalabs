'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import clsx from 'clsx'

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/shop', label: 'Boutique' },
  { href: '/about', label: 'À propos' },
  { href: '/delivery', label: 'Livraison' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { totalItems } = useCart()
  const [open, setOpen] = useState(false)
  const [hasItems, setHasItems] = useState(false)

  useEffect(() => {
    setHasItems(totalItems > 0)
  }, [totalItems])

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-heading text-2xl font-bold text-accent hover:text-accentDark transition">
            Store Dz
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((item) => (
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
              <span
                className={clsx(
                  'absolute -top-2 -right-2 bg-accent text-background text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold transition-transform',
                  hasItems ? 'scale-100' : 'scale-0'
                )}
                aria-live="polite"
              >
                {totalItems}
              </span>
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-text hover:border-accent transition"
              onClick={() => setOpen((v) => !v)}
              aria-label="Ouvrir le menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-3 rounded-lg bg-card border border-border text-text hover:border-accent transition font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}