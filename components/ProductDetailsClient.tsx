'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Truck, BadgeCheck, MessageCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/Toast'
import { Product, ProductColor } from '@/types'
import { categoryLabel, STORE_PHONE } from '@/lib/seo'
import { colorAvailableStock, hasVariantStock, productAvailableStock } from '@/lib/productColors'

const FALLBACK_IMAGE = '/placeholder.jpg'

function colorImage(color?: ProductColor | null) {
  return color?.imageUrl || ''
}

export default function ProductDetailsClient({ product }: { product: Product }) {
  const router = useRouter()
  const { addItem } = useCart()
  const { showToast, ToastComponent } = useToast()
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [FALLBACK_IMAGE]
  const colors = Array.isArray(product.colors) ? product.colors : []
  const benefits = Array.isArray(product.benefits) ? product.benefits : []
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const displayImages = useMemo(() => {
    const selectedColorImage = colorImage(selectedColor)
    if (!selectedColorImage) return images
    return [selectedColorImage, ...images.filter((img) => img !== selectedColorImage)]
  }, [images, selectedColor])

  const variantsControlStock = hasVariantStock(colors)
  const totalAvailableStock = productAvailableStock(product.stock, colors)
  const selectedAvailableStock = selectedColor ? colorAvailableStock(selectedColor, product.stock) : totalAvailableStock
  const requiresColorSelection = colors.length > 0
  const isOutOfStock = totalAvailableStock <= 0
  const selectedColorOutOfStock = selectedColor ? selectedAvailableStock <= 0 : false
  const cannotOrder = isOutOfStock || selectedColorOutOfStock || (requiresColorSelection && !selectedColor)
  const maxQuantity = Math.max(0, selectedColor ? selectedAvailableStock : totalAvailableStock)
  const currentImage = displayImages[selectedImage] || displayImages[0] || FALLBACK_IMAGE
  const displayDescription = product.description?.trim() ||
    `${product.name} est une ${categoryLabel(product.category).toLowerCase()} disponible chez Store DZ en Algérie, avec livraison nationale et paiement à la livraison.`
  const hasPromotion = !!product.oldPriceDa && product.oldPriceDa > product.priceDa
  const discountPercent = hasPromotion
    ? Math.round(((product.oldPriceDa! - product.priceDa) / product.oldPriceDa!) * 100)
    : 0

  const selectColor = (color: ProductColor) => {
    setSelectedColor(color)
    setSelectedImage(0)
    setQuantity((current) => Math.min(current, Math.max(1, colorAvailableStock(color, product.stock))))
  }

  const addToCart = (goToCheckout = false) => {
    if (cannotOrder) return

    addItem({
      productId: product.id,
      name: product.name,
      priceDa: product.priceDa,
      quantity,
      image: colorImage(selectedColor) || currentImage,
      slug: product.slug,
      variantId: selectedColor?.id || selectedColor?.name || null,
      selectedColorName: selectedColor?.name || null,
      selectedColorHex: selectedColor?.hex || null,
      selectedColorImage: colorImage(selectedColor) || null,
      maxAvailableStock: maxQuantity || null,
    })

    showToast(selectedColor ? `Ajouté au panier - ${selectedColor.name}` : 'Produit ajouté au panier', 'success')
    if (goToCheckout) router.push('/checkout')
  }

  return (
    <>
      {ToastComponent}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface border border-border shadow-card">
              <img
                src={currentImage}
                alt={`${categoryLabel(product.category).toLowerCase()} originale ${product.name} en Algérie`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {hasPromotion && !isOutOfStock && (
                <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3">
                {displayImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg border bg-surface transition ${
                      selectedImage === idx ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent/70'
                    }`}
                    aria-label={`Afficher l'image ${idx + 1} de ${product.name}`}
                  >
                    <img src={img} alt={`${product.name} vue ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 shadow-card">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">{categoryLabel(product.category)}</p>
              <h1 className="mt-3 font-heading text-3xl sm:text-4xl font-bold leading-tight text-text">{product.name}</h1>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                {hasPromotion && (
                  <p className="text-base text-muted line-through">{formatPrice(product.oldPriceDa!)}</p>
                )}
                <p className="font-heading text-3xl font-bold text-accent">{formatPrice(product.priceDa)}</p>
              </div>

              <div className="mt-4">
                {isOutOfStock ? (
                  <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">Rupture de stock</span>
                ) : selectedColor ? (
                  <span className="inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-300">
                    {selectedColor.name} : {selectedAvailableStock} pièce{selectedAvailableStock > 1 ? 's' : ''} disponible{selectedAvailableStock > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-300">
                    Stock total : {totalAvailableStock} pièce{totalAvailableStock > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {colors.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Couleur</p>
                    {selectedColor && <p className="text-sm text-muted">{selectedColor.name}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const active = selectedColor?.name === color.name
                      const colorStock = colorAvailableStock(color, product.stock)
                      const disabled = colorStock <= 0
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => !disabled && selectColor(color)}
                          disabled={disabled}
                          aria-label={`Choisir la couleur ${color.name}`}
                          className={`group inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                            active
                              ? 'border-accent bg-accent text-background'
                              : 'border-border bg-card text-text hover:border-accent'
                          } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                        >
                          <span
                            className="h-5 w-5 rounded-full border border-white/30 shadow-inner"
                            style={{ backgroundColor: color.hex || '#C6A15B' }}
                          />
                          <span>{color.name}</span>
                          {variantsControlStock && <span className="text-xs opacity-75">({colorStock})</span>}
                        </button>
                      )
                    })}
                  </div>
                  {selectedColorOutOfStock ? (
                    <p className="mt-2 text-sm text-red-300">Rupture pour cette couleur.</p>
                  ) : !selectedColor ? (
                    <p className="mt-2 text-sm text-muted">Choisissez une couleur pour voir son stock et commander.</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">Quantité maximale pour {selectedColor.name} : {selectedAvailableStock}.</p>
                  )}
                </div>
              )}

              {!isOutOfStock && (
                <div className="mt-6">
                  <p className="mb-2 font-semibold">Quantité</p>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-9 w-9 rounded bg-surface font-semibold text-text hover:text-accent"
                      aria-label="Diminuer la quantité"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      disabled={quantity >= maxQuantity}
                      className="h-9 w-9 rounded bg-surface font-semibold text-text hover:text-accent"
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(false)}
                  disabled={cannotOrder}
                  className="w-full rounded-lg bg-accent px-5 py-4 font-semibold text-background transition hover:bg-accentDark disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                  {requiresColorSelection && !selectedColor ? 'Choisissez une couleur' : cannotOrder ? 'Produit indisponible' : 'Ajouter au panier'}
                </button>
                <button
                  type="button"
                  onClick={() => addToCart(true)}
                  disabled={cannotOrder}
                  className="w-full rounded-lg border border-accent px-5 py-4 font-semibold text-accent transition hover:bg-accent hover:text-background disabled:cursor-not-allowed disabled:border-gray-500 disabled:text-gray-500"
                >
                  {requiresColorSelection && !selectedColor ? 'Choisissez une couleur' : 'Commander maintenant'}
                </button>
                <a
                  href={`https://wa.me/${STORE_PHONE.replace('+', '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-semibold text-text hover:border-accent hover:text-accent"
                >
                  <MessageCircle size={18} />
                  Question sur WhatsApp
                </a>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-muted">
                {[
                  { icon: Truck, text: 'Livraison dans les 58 wilayas' },
                  { icon: BadgeCheck, text: 'Paiement à la livraison' },
                  { icon: ShieldCheck, text: 'Produit original avec garantie 2 ans' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                    <item.icon className="h-5 w-5 text-accent" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
            <h2 className="font-heading text-2xl font-bold">Description</h2>
            <p className="mt-4 leading-7 text-muted">{displayDescription}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl font-bold">Détails utiles</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Prix affiché en dinars algériens.</li>
              <li>Commande confirmée par téléphone.</li>
              <li>Livraison au bureau ou à domicile selon wilaya.</li>
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <Link href="/delivery" className="mt-5 inline-flex font-semibold text-accent hover:underline">
              Voir les informations livraison
            </Link>
          </div>
        </section>
      </div>

      <div
        className="fixed inset-x-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-accent font-bold">{formatPrice(product.priceDa)}</p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(false)}
            disabled={cannotOrder}
            className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-background disabled:bg-gray-500"
          >
            Ajouter
          </button>
        </div>
      </div>
    </>
  )
}
