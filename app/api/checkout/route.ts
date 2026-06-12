import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'   // <-- ajouté
import { checkoutSchema } from '@/lib/validations'
import { findShipping } from '@/lib/shipping'
import {
  colorAvailableStock,
  decrementColorStock,
  hasVariantStock,
  normalizeProductColors,
  productAvailableStock,
} from '@/lib/productColors'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = checkoutSchema.parse(body)

    const captchaOk = await verifyTurnstile((body as any).turnstileToken)
    if (!captchaOk) {
      return NextResponse.json({ error: 'Captcha failed' }, { status: 400 })
    }

    const productIds = parsed.items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 400 })
    }

    type ProductRow = (typeof products)[number]

    let subtotalDa = 0
    const orderItems = parsed.items.map((item) => {
      const product = products.find((p: ProductRow) => p.id === item.productId)!
      const qty = Number(item.quantity) || 0
      if (qty <= 0) throw new Error('Quantité invalide')
      const productImages = Array.isArray(product.images) ? product.images.filter((src): src is string => typeof src === 'string') : []
      const colors = normalizeProductColors(product.colors, productImages)
      const usesVariantStock = hasVariantStock(colors)
      const selectedColor = item.selectedColorName
        ? colors.find((color) => color.name === item.selectedColorName)
        : null

      if (colors.length > 0 && !selectedColor) {
        throw new Error(`Veuillez choisir une couleur pour ${product.name}`)
      }

      const availableStock = selectedColor
        ? colorAvailableStock(selectedColor, product.stock)
        : productAvailableStock(product.stock, colors)

      if (availableStock < qty) {
        const label = selectedColor ? `${product.name} (${selectedColor.name})` : product.name
        throw new Error(`Stock insuffisant pour ${label}. Il reste ${availableStock} pièce${availableStock > 1 ? 's' : ''}.`)
      }
      const lineTotal = product.priceDa * qty
      subtotalDa += lineTotal
      return {
        productId: product.id,
        quantity: qty,
        unitPriceDa: product.priceDa,
        subtotalDa: lineTotal,
        productNameSnapshot: product.name,
        selectedVariantId: item.variantId?.trim() || selectedColor?.id || selectedColor?.name || null,
        selectedColorName: item.selectedColorName?.trim() || null,
        selectedColorHex: item.selectedColorHex?.trim() || null,
        selectedColorImage: item.selectedColorImage?.trim() || null,
        usesVariantStock,
      }
    })

    const shippingDa = findShipping(parsed.wilaya)
    const totalDa = subtotalDa + shippingDa

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of orderItems) {
        const product = products.find((p: ProductRow) => p.id === item.productId)!
        if (item.usesVariantStock && item.selectedColorName) {
          const nextColors = decrementColorStock(product.colors, item.selectedColorName, item.quantity)
          const nextNormalizedColors = normalizeProductColors(nextColors, Array.isArray(product.images) ? product.images.filter((src): src is string => typeof src === 'string') : [])
          await tx.product.update({
            where: { id: item.productId },
            data: {
              colors: nextColors as any,
              stock: productAvailableStock(product.stock, nextNormalizedColors),
            },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
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
          items: {
            create: orderItems.map(({ usesVariantStock, ...item }) => item),
          },
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
    if (typeof error?.message === 'string' && (error.message.startsWith('Stock insuffisant') || error.message.startsWith('Veuillez choisir'))) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur lors de la commande' }, { status: 500 })
  }
}
