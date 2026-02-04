import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface text-text mt-auto border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 text-accent">Store Dz</h3>
            <p className="text-sm text-muted">
              L'élégance au poignet, livrée partout en Algérie.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/shop" className="hover:text-text transition">Boutique</Link></li>
              <li><Link href="/about" className="hover:text-text transition">À propos</Link></li>
              <li><Link href="/delivery" className="hover:text-text transition">Livraison</Link></li>
              <li><Link href="/contact" className="hover:text-text transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/contact" className="hover:text-text transition">Service client</Link></li>
              <li><Link href="/admin/orders" className="hover:text-text transition">Admin</Link></li>
              <li><a href="tel:+213555123456" className="hover:text-text transition">+213 555 123 456</a></li>
              <li><a href="mailto:support@storedz.dz" className="hover:text-text transition">support@storedz.dz</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suivez-nous</h4>
            <div className="flex items-center gap-4 text-muted">
              <a href="#" aria-label="Facebook" className="hover:text-text transition">
                {/* Icône Facebook */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.87 6.48 1.87 12.07c0 4.78 3.44 8.74 7.94 9.68v-6.84H7.6v-2.84h2.21v-2.17c0-2.18 1.3-3.38 3.28-3.38.95 0 1.94.17 1.94.17v2.12h-1.09c-1.08 0-1.42.67-1.42 1.36v1.9h2.41l-.38 2.84h-2.03v6.84c4.5-.94 7.94-4.9 7.94-9.68z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-text transition">
                {/* Icône Instagram */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm11.25 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-muted">
          © {new Date().getFullYear()} Store Dz. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}