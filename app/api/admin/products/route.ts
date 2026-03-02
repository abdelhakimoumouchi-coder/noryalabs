import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '../_auth'

// ─────────────────────────────
// Utils
// ─────────────────────────────

function makeSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || `prod-${crypto.randomUUID().slice(0, 8)}`
}

function ensureLocalUploads(images: unknown): string[] {
  const arr = Array.isArray(images) ? images : []

  return arr
    .map((src) => (typeof src === 'string' ? src : ''))
    .filter((src) => src.startsWith('/uploads/'))
}

// ─────────────────────────────
// GET
// ─────────────────────────────
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { subcategory: true },
  })

  return NextResponse.json(products)
}

// ─────────────────────────────
// POST
// ─────────────────────────────
export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const body = await req.json()

    // 🔥 Validation minimale safe (pas de Zod pour éviter 400 inutiles)
    if (!body.name || !body.priceDa || !body.category) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const slug = body.slug ?? makeSlug(body.name)

    const images = ensureLocalUploads(body.images)
    const safeImages = images.length ? images : ['/placeholder.jpg']

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        priceDa: Number(body.priceDa),
        category: body.category,
        subcategoryId: body.subcategoryId || null,
        description: body.description || '',
        benefits: Array.isArray(body.benefits) ? body.benefits : [],
        images: safeImages,
        colors: Array.isArray(body.colors) ? body.colors : [],
        stock: Number(body.stock) || 0,
        isFeatured: Boolean(body.featured),
      },
    })

    return NextResponse.json(product, { status: 201 })

  } catch (e: any) {
    console.error(e)

    return NextResponse.json(
      { error: 'Failed to create product', details: e?.message },
      { status: 500 }
    )
  }
}