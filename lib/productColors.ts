import { ProductColor } from '@/types'

const NAMED_HEX: Record<string, string> = {
  noir: '#111111',
  black: '#111111',
  argent: '#C0C0C0',
  silver: '#C0C0C0',
  dore: '#D4AF37',
  doré: '#D4AF37',
  gold: '#D4AF37',
  bleu: '#1D4ED8',
  blue: '#1D4ED8',
  marron: '#7C4A2D',
  brun: '#7C4A2D',
  blanc: '#F8FAFC',
  white: '#F8FAFC',
  rose: '#F4A6B8',
  rouge: '#B91C1C',
  vert: '#166534',
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeHex(value: unknown, name: string) {
  const raw = cleanString(value)
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) return raw
  return NAMED_HEX[name.toLowerCase()] || '#C6A15B'
}

function normalizeImage(value: unknown) {
  const src = cleanString(value)
  if (!src) return null
  if (src.startsWith('/uploads/') || src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }
  return `/uploads/${src}`
}

export function normalizeProductColors(colors: unknown, images: string[] = []): ProductColor[] {
  if (!Array.isArray(colors)) return []

  const normalized: Array<ProductColor | null> = colors.map((color, index) => {
      if (typeof color === 'string') {
        const name = color.trim()
        if (!name) return null
        return {
          id: name.toLowerCase(),
          name,
          hex: normalizeHex(null, name),
          imageUrl: images[index] || null,
          stock: null,
          sortOrder: index,
        }
      }

      if (!color || typeof color !== 'object') return null
      const item = color as Record<string, unknown>
      const name = cleanString(item.name)
      if (!name) return null

      const stock = typeof item.stock === 'number' && Number.isFinite(item.stock) ? item.stock : null
      const sortOrder = typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder) ? item.sortOrder : index

      return {
        id: cleanString(item.id) || name.toLowerCase(),
        name,
        hex: normalizeHex(item.hex, name),
        imageUrl: normalizeImage(item.imageUrl || item.image || item.src),
        stock,
        sortOrder,
      }
    })

  return normalized
    .filter((color): color is ProductColor => color !== null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function colorCartKey(productId: string, colorName?: string | null) {
  return `${productId}:${(colorName || 'default').toLowerCase()}`
}

export function hasVariantStock(colors: ProductColor[]) {
  return colors.some((color) => typeof color.stock === 'number')
}

export function productAvailableStock(productStock: number, colors: ProductColor[]) {
  if (!colors.length || !hasVariantStock(colors)) return Math.max(0, productStock)
  return colors.reduce((sum, color) => sum + Math.max(0, color.stock ?? 0), 0)
}

export function colorAvailableStock(color: ProductColor | null | undefined, fallbackStock: number) {
  if (!color) return Math.max(0, fallbackStock)
  return typeof color.stock === 'number' ? Math.max(0, color.stock) : Math.max(0, fallbackStock)
}

export function decrementColorStock(rawColors: unknown, colorName: string, quantity: number) {
  if (!Array.isArray(rawColors)) return rawColors
  return rawColors.map((color) => {
    if (typeof color === 'string') return color
    if (!color || typeof color !== 'object') return color
    const item = color as Record<string, unknown>
    if (typeof item.name !== 'string' || item.name !== colorName) return color
    const currentStock = typeof item.stock === 'number' ? item.stock : 0
    return { ...item, stock: Math.max(0, currentStock - quantity) }
  })
}

export function incrementColorStock(rawColors: unknown, colorName: string, quantity: number) {
  if (!Array.isArray(rawColors)) return rawColors
  return rawColors.map((color) => {
    if (typeof color === 'string') return color
    if (!color || typeof color !== 'object') return color
    const item = color as Record<string, unknown>
    if (typeof item.name !== 'string' || item.name !== colorName) return color
    const currentStock = typeof item.stock === 'number' ? item.stock : 0
    return { ...item, stock: currentStock + quantity }
  })
}
