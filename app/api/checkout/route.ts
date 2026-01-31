import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return false
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })
  const data = await resp.json()
  return data.success === true
}
// ─────────────────────────────
// Types
// ─────────────────────────────
type CartItem = {
  productId: string
  quantity: number
}

// ─────────────────────────────
// POST – checkout
// ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items: CartItem[] = body.items

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Panier vide ou invalide' },
        { status: 400 }
      )
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((i) => i.productId),
        },
      },
    })

    // ✅ type réel Prisma
    type ProductRow = typeof products[number]

    let total = 0

    for (const item of items) {
      const product = products.find(
        (p: ProductRow) => p.id === item.productId
      )

      const quantity = Number(item.quantity) || 0

      if (!product || quantity <= 0) {
        return NextResponse.json(
          { error: 'Produit introuvable ou quantité invalide' },
          { status: 400 }
        )
      }

      // champ correct du modèle Prisma
      total += product.priceDa * quantity
    }

    return NextResponse.json({ total })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du checkout' },
      { status: 500 }
    )
  }
}