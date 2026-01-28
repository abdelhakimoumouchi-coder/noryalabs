import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findShipping } from '@/lib/shipping'

const phoneRegex = /^0[567]\d{8}$/
const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_delivery', 'delivered'] as const
type ActiveStatus = typeof ACTIVE_STATUSES[number]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, phone, wilaya, address, notes, items } = body || {}

    const errors: any[] = []
    if (!firstName || firstName.trim().length < 1) errors.push({ path: ['firstName'], message: 'Prénom requis' })
    if (!lastName || lastName.trim().length < 1) errors.push({ path: ['lastName'], message: 'Nom requis' })
    if (!phoneRegex.test(String(phone || ''))) errors.push({ path: ['phone'], message: 'Téléphone invalide (10 chiffres, commence par 05/06/07)' })
    if (!wilaya) errors.push({ path: ['wilaya'], message: 'Wilaya requise' })
    if (!address || address.trim().length < 5) errors.push({ path: ['address'], message: 'Adresse trop courte' })
    if (!Array.isArray(items) || items.length === 0) errors.push({ path: ['items'], message: 'Panier vide' })

    if (errors.length) {
      return NextResponse.json({ error: 'Validation', details: errors }, { status: 400 })
    }

    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

    let subtotal = 0
    const orderItems: { productId: string; quantity: number; unitPriceDa: number; subtotalDa: number }[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      const quantity = Number(item.quantity) || 0
      if (!product || quantity <= 0) {
        return NextResponse.json({ error: 'Produit introuvable ou quantité invalide' }, { status: 400 })
      }
      if (product.stock < quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${product.name}` }, { status: 400 })
      }
      const unitPriceDa = product.priceDa
      const subtotalDa = unitPriceDa * quantity
      orderItems.push({ productId: product.id, quantity, unitPriceDa, subtotalDa })
      subtotal += subtotalDa
    }

    const shippingDa = findShipping(wilaya)
    const totalDa = subtotal + shippingDa

    // Création de la commande + décrément stock en transaction
    const order = await prisma.$transaction(async (tx) => {
      // décrément stocks
      for (const oi of orderItems) {
        await tx.product.update({
          where: { id: oi.productId },
          data: { stock: { decrement: oi.quantity } },
        })
      }

      return tx.order.create({
        data: {
          firstName,
          lastName,
          phone,
          wilaya,
          address,
          notes: notes || '',
          subtotalDa: subtotal,
          shippingDa,
          totalDa,
          status: 'pending',
          items: {
            create: orderItems.map((oi) => ({
              productId: oi.productId,
              quantity: oi.quantity,
              unitPriceDa: oi.unitPriceDa,
              subtotalDa: oi.subtotalDa,
            })),
          },
        },
        select: { id: true },
      })
    })

    return NextResponse.json({ orderId: order.id }, { status: 200 })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}