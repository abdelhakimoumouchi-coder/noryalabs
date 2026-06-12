import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@/types'
import { requireAdmin } from '../../admin/_auth'
import { hasVariantStock, incrementColorStock, normalizeProductColors, productAvailableStock } from '@/lib/productColors'

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'in_delivery',
  'delivered',
  'canceled',
  'returned',
]

// ─────────────────────────────
// PATCH – update order status
// ��────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const { id: orderId } = await params
  const body = await req.json()
  const status = body.status as OrderStatus

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status } })

    if (status === 'canceled') {
      for (const item of order.items) {
        const selectedColorName = (item as any).selectedColorName as string | null | undefined
        const currentColors = normalizeProductColors(
          item.product?.colors,
          item.product && Array.isArray(item.product.images) ? item.product.images.filter((src): src is string => typeof src === 'string') : []
        )
        if (selectedColorName && item.product?.colors && hasVariantStock(currentColors)) {
          const nextColors = incrementColorStock(item.product.colors, selectedColorName, item.quantity)
          const nextNormalizedColors = normalizeProductColors(
            nextColors,
            Array.isArray(item.product.images) ? item.product.images.filter((src): src is string => typeof src === 'string') : []
          )
          await tx.product.update({
            where: { id: item.productId },
            data: {
              colors: nextColors as any,
              stock: productAvailableStock(item.product.stock, nextNormalizedColors),
            },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }
  })

  return NextResponse.json({ success: true })
}

// ─────────────────────────────
// DELETE – delete order (avec restock)
// ─────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const { id: orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const selectedColorName = (item as any).selectedColorName as string | null | undefined
      const currentColors = normalizeProductColors(
        item.product?.colors,
        item.product && Array.isArray(item.product.images) ? item.product.images.filter((src): src is string => typeof src === 'string') : []
      )
      if (selectedColorName && item.product?.colors && hasVariantStock(currentColors)) {
        const nextColors = incrementColorStock(item.product.colors, selectedColorName, item.quantity)
        const nextNormalizedColors = normalizeProductColors(
          nextColors,
          Array.isArray(item.product.images) ? item.product.images.filter((src): src is string => typeof src === 'string') : []
        )
        await tx.product.update({
          where: { id: item.productId },
          data: {
            colors: nextColors as any,
            stock: productAvailableStock(item.product.stock, nextNormalizedColors),
          },
        })
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }
    await tx.order.delete({ where: { id: orderId } })
  })

  return NextResponse.json({ success: true })
}
