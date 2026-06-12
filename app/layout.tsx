import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import BottomMobileNav from '@/components/BottomMobileNav'
import { CartProvider } from '@/contexts/CartContext'
import { homeDescription, homeTitle, SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: homeTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: homeDescription,
  keywords: [
    'montre homme Algérie',
    'montre femme Algérie',
    'montre premium Algérie',
    'montre originale Algérie',
    'livraison montre Algérie',
    'paiement à la livraison Algérie',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: 'website',
    title: homeTitle,
    description: 'Montres homme et femme premium, 100% originales, livrées partout en Algérie avec paiement à la livraison.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/og-image.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: 'Boutique de montres premium homme et femme en Algérie. Produits originaux, garantie 2 ans, livraison nationale.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-background text-text">
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
            <Footer />
            <FloatingWhatsApp />
            <BottomMobileNav />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
