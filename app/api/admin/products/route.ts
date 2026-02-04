import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminProductSchema } from '@/lib/validations'
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
// GET – list products
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
// POST – create product
// ─────────────────────────────
export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const body = await req.json()
    const data = adminProductSchema.parse(body)

    const slug = data.slug ?? makeSlug(data.name)
    const images = ensureLocalUploads(data.images)
    const safeImages = images.length ? images : ['/placeholder.jpg']

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        benefits: data.benefits ?? [],
        images: safeImages,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation', details: e.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
        { error: 'Failed to create product', details: e?.message },
        { status: 500 }
    )
  }
}