import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panier - Store DZ',
  robots: 'noindex, follow',
  alternates: {
    canonical: 'https://storedzone.store/cart',
  },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
