'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Filter, Home, MessageCircle, ShoppingBag, Store } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function BottomMobileNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const isShop = pathname === '/shop'
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '213555123456'
  const whatsappHref = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Bonjour, je suis intéressé par vos montres Store DZ')}`

  const openFilters = () => {
    if (isShop) {
      window.dispatchEvent(new CustomEvent('storedzone:open-mobile-filters'))
    }
  }

  const itemClass = 'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition'
  const activeClass = 'text-accent'
  const idleClass = 'text-muted hover:text-text'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pt-2 shadow-[0_-12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'calc(0.45rem + env(safe-area-inset-bottom))' }}
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex max-w-md items-center gap-1">
        <Link href="/" className={`${itemClass} ${pathname === '/' ? activeClass : idleClass}`}>
          <Home size={19} />
          <span>Accueil</span>
        </Link>
        <Link href="/shop" className={`${itemClass} ${pathname === '/shop' ? activeClass : idleClass}`}>
          <Store size={19} />
          <span>Boutique</span>
        </Link>
        {isShop ? (
          <button type="button" onClick={openFilters} className={`${itemClass} ${idleClass}`} aria-label="Ouvrir les filtres">
            <Filter size={19} />
            <span>Filtres</span>
          </button>
        ) : (
          <Link href="/shop" className={`${itemClass} ${idleClass}`}>
            <Filter size={19} />
            <span>Filtres</span>
          </Link>
        )}
        <Link href="/cart" className={`${itemClass} ${pathname === '/cart' ? activeClass : idleClass} relative`}>
          <span className="relative">
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-background">
                {totalItems}
              </span>
            )}
          </span>
          <span>Panier</span>
        </Link>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`${itemClass} ${idleClass}`}>
          <MessageCircle size={19} />
          <span>WhatsApp</span>
        </a>
      </div>
    </nav>
  )
}
