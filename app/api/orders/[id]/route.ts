import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { orderStatusSchema } from '@/lib/validations'

const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_delivery', 'delivered'] as const
type ActiveStatus = typeof ACTIVE_STATUSES[number]

function authorize(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret')
  return adminSecret && adminSecret === process.env.ADMIN_SECRET
}

function isActive(status: string): status is ActiveStatus {
  return (ACTIVE_STATUSES as readonly string[]).includes(status)
}

async function adjustStock(deltaSign: 1 | -1, orderId: string) {
  // deltaSign: -1 pour décrémenter, +1 pour ré-incrémenter
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order) return { ok: false, notFound: true }

  // vérifier stock avant décrément
  if (deltaSign === -1) {
    for (const item of order.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product || product.stock < item.quantity) {
        return { ok: false, error: `Stock insuffisant pour ${product?.name || item.productId}` }
      }
    }
  }

  // appliquer
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: deltaSign === 1 ? item.quantity : -item.quantity } },
      })
    }
  })

  return { ok: true }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!authorize(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const newStatus = orderStatusSchema.parse(body.status)

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const wasActive = isActive(order.status)
    const willBeActive = isActive(newStatus)

    // Transitions de stock :
    // inactive -> active : décrémenter
    // active -> inactive : ré-incrémenter
    if (!wasActive && willBeActive) {
      const res = await adjustStock(-1, id)
      if (!res.ok) return NextResponse.json({ error: res.error || 'Stock error' }, { status: 400 })
    }
    if (wasActive && !willBeActive) {
      const res = await adjustStock(1, id)
      if (!res.ok) return NextResponse.json({ error: res.error || 'Stock error' }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Order update error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!authorize(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Si la commande est dans un statut actif, on ré-incrémente avant suppression
    if (isActive(order.status)) {
      const res = await adjustStock(1, id)
      if (!res.ok) return NextResponse.json({ error: res.error || 'Stock error' }, { status: 400 })
    }

    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order delete error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}