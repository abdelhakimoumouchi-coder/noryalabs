import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminProductSchema } from '@/lib/validations'
import { requireAdmin } from '../../_auth'

function ensureLocalUploads(images: unknown): string[] {
  const arr = Array.isArray(images) ? images : []
  return arr
    .map((src) => (typeof src === 'string' ? src : ''))
    .filter((src) => src.startsWith('/uploads/'))
}

// ─────────────────────────────
// PATCH – update product
// ─────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const { id } = params
    const body = await req.json()

    const data = adminProductSchema.partial().parse(body)

    const payload: typeof data & { images?: string[] } = { ...data }

    if ('images' in data) {
      const imgs = ensureLocalUploads(data.images)
      payload.images = imgs.length ? imgs : ['/placeholder.jpg']
    }

    const product = await prisma.product.update({
      where: { id },
      data: payload,
    })

    return NextResponse.json(product)
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
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const { id } = params

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