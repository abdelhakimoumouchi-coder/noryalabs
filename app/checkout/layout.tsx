import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commande - Store DZ',
  robots: 'noindex, follow',
  alternates: {
    canonical: 'https://storedzone.store/checkout',
  },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
