import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { CartProvider } from '@/contexts/CartContext'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
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
