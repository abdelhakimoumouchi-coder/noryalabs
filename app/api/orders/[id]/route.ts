import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@/types'

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
// ─────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id
  const body = await req.json()

  const status = body.status as OrderStatus

  // validation stricte du status
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid order status' },
      { status: 400 }
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    )
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status },
    })

    // logique métier : retour stock si commande annulée
    if (status === 'canceled') {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }
    }
  })

  return NextResponse.json({ success: true })
}