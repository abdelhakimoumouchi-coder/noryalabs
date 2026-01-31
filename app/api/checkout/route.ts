import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkoutSchema } from '@/lib/validations'
import { findShipping } from '@/lib/shipping'

async function verifyTurnstile(token: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token) return false
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })
  const data = await resp.json()
  return data.success === true
}

// ─────────────────────────────
// POST – créer la commande
// ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1) Validation des données
    const parsed = checkoutSchema.parse(body)

    // 2) Captcha obligatoire
    const captchaOk = await verifyTurnstile((body as any).turnstileToken)
    if (!captchaOk) {
      return NextResponse.json({ error: 'Captcha failed' }, { status: 400 })
    }

    // 3) Charger les produits
    const productIds = parsed.items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 400 })
    }

    // 4) Construire les lignes + calculs
    let subtotalDa = 0
    const orderItems = parsed.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const qty = Number(item.quantity) || 0
      if (qty <= 0) throw new Error('Quantité invalide')
      if (product.stock !== undefined && product.stock < qty) {
        throw new Error(`Stock insuffisant pour ${product.name}`)
      }
      const lineTotal = product.priceDa * qty
      subtotalDa += lineTotal
      return {
        productId: product.id,
        quantity: qty,
        unitPriceDa: product.priceDa,
        subtotalDa: lineTotal,
      }
    })

    const shippingDa = findShipping(parsed.wilaya)
    const totalDa = subtotalDa + shippingDa

    // 5) Transaction : décrémenter le stock et créer la commande + items
    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return tx.order.create({
        data: {
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          phone: parsed.phone,
          wilaya: parsed.wilaya,
          address: parsed.address,
          notes: parsed.notes ?? null,
          subtotalDa,
          shippingDa,
          totalDa,
          items: { create: orderItems },
        },
      })
    })

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation', details: error.errors },
        { status: 400 }
      )
    }
    if (typeof error?.message === 'string' && error.message.startsWith('Stock insuffisant')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur lors de la commande' }, { status: 500 })
  }
}