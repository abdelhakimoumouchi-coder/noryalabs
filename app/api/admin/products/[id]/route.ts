import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminProductSchema } from '@/lib/validations'
import { requireAdmin } from '../../_auth'

function ensureLocalUploads(images: unknown): string[] {
  const arr = Array.isArray(images) ? images : []
  return arr
    .map((src) => (typeof src === 'string' ? src.trim() : ''))
    .filter(
      (src) =>
        src.startsWith('/uploads/') ||
        src.startsWith('http://') ||
        src.startsWith('https://')
    )
}

// ─────────────────────────────
// GET – single product
// ─────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const { id } = await params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (e: any) {
    return NextResponse.json(
      { error: 'Failed to fetch product', details: e.message },
      { status: 500 }
    )
  }
}

// ─────────────────────────────
// PATCH – update product
// ─────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const { id } = await params

  try {
    const body = await req.json()

    const data = adminProductSchema.partial().parse(body)

    const payload: any = { ...data }

    if ('images' in data) {
      const imgs = ensureLocalUploads(data.images)
      payload.images = imgs.length ? imgs : ['/placeholder.jpg']
    }

    const updated = await prisma.product.update({
      where: { id },
      data: payload,
    })

    return NextResponse.json(updated)

  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (e?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation', details: e.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product', details: e?.message },
      { status: 500 }
    )
  }
}

// ─────────────────────────────
// DELETE – delete product
// ─────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const { id } = await params

  try {
    await prisma.orderItem.deleteMany({
      where: { productId: id },
    })

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })

  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete product', details: e?.message },
      { status: 500 }
    )
  }
}
