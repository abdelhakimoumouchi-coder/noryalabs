'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, ShoppingBag, X } from 'lucide-react'
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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent hover:text-accent">
            Store DZ
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted hover:text-text">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-text hover:border-accent hover:text-accent"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline text-sm font-semibold">Panier</span>
              <span
                className={clsx(
                  'absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-background transition-transform',
                  hasItems ? 'scale-100' : 'scale-0'
                )}
                aria-live="polite"
              >
                {totalItems}
              </span>
            </Link>
            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text hover:border-accent"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(88vw,360px)] border-l border-border bg-background p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="font-heading text-2xl font-bold text-accent">
                Store DZ
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="grid gap-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-4 text-base font-semibold text-text hover:border-accent"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-4 font-semibold text-background"
              >
                <ShoppingBag size={18} />
                Panier ({totalItems})
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
