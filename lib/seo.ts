import type { Metadata } from 'next'
import { Product } from '@/types'

export const SITE_URL = 'https://storedzone.store'
export const SITE_NAME = 'Store DZ'
export const STORE_PHONE = '+213555123456'
export const STORE_PHONE_DISPLAY = '+213 555 123 456'
export const STORE_EMAIL = 'support@storedz.dz'

export const homeTitle = 'Store DZ - Montres Premium Originales en Algérie'
export const homeDescription =
  'Achetez des montres homme et femme premium 100% originales en Algérie. Livraison dans les 58 wilayas, paiement à la livraison et garantie 2 ans.'

export function absoluteUrl(path = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function truncateMeta(text: string, max = 155) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trim()}…`
}

export function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return []

  return images
    .filter((src): src is string => typeof src === 'string' && src.trim().length > 0)
    .map((src) => {
      if (src.startsWith('http://') || src.startsWith('https://')) return src
      if (src.startsWith('/uploads/') || src.startsWith('/')) return src
      if (src.startsWith('blob:')) return ''
      return `/uploads/${src}`
    })
    .filter(Boolean)
}

export function normalizeProduct(product: any): Product {
  return {
    ...product,
    oldPriceDa: product.oldPriceDa && product.oldPriceDa > product.priceDa ? product.oldPriceDa : null,
    benefits: Array.isArray(product.benefits) ? product.benefits : [],
    images: normalizeImages(product.images).length > 0 ? normalizeImages(product.images) : ['/placeholder.jpg'],
    colors: Array.isArray(product.colors) ? product.colors : [],
  }
}

export function categoryLabel(category?: string) {
  const normalized = (category || '').toLowerCase()
  if (normalized.includes('homme')) return 'Montre homme'
  if (normalized.includes('femme')) return 'Montre femme'
  return category || 'Montres premium'
}

export function buildPageMetadata({
  title,
  description,
  path,
  robots = 'index, follow',
  image = '/og-image.jpg',
}: {
  title: string
  description: string
  path: string
  robots?: string
  image?: string
}): Metadata {
  const url = absoluteUrl(path)
  return {
    title: {
      absolute: title,
    },
    description,
    robots,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: absoluteUrl(image) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl(image)],
    },
  }
}
