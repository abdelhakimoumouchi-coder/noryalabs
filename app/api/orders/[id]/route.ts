import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@/types'
import { requireAdmin } from '../../admin/_auth'

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
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const orderId = params.id
  const body = await req.json()
  const status = body.status as OrderStatus

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status } })

    if (status === 'canceled') {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
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
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const orderId = params.id

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }
    await tx.order.delete({ where: { id: orderId } })
  })

  return NextResponse.json({ success: true })
}