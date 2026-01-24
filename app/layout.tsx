import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Norya Labs - Beauté Naturelle Algérienne',
  description: 'Découvrez notre collection de produits de beauté naturels algériens. Huile d\'argan, savon d\'Alep, ghassoul et plus encore.',
  keywords: 'beauté naturelle, cosmétiques algériens, huile d\'argan, savon d\'Alep, ghassoul',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
