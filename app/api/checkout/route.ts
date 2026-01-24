import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkoutSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedData = checkoutSchema.parse(body)

    const result = await prisma.$transaction(async (tx) => {
      const productIds = validatedData.items.map(item => item.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      })

      if (products.length !== validatedData.items.length) {
        throw new Error('Some products not found')
      }

      for (const item of validatedData.items) {
        const product = products.find(p => p.id === item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }
      }

      const orderItems = validatedData.items.map(item => {
        const product = products.find(p => p.id === item.productId)!
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPriceDa: product.priceDa,
          subtotalDa: product.priceDa * item.quantity,
        }
      })

      const totalDa = orderItems.reduce((sum, item) => sum + item.subtotalDa, 0)

      const order = await tx.order.create({
        data: {
          customerName: validatedData.customerName,
          phone: validatedData.phone,
          wilaya: validatedData.wilaya,
          address: validatedData.address,
          notes: validatedData.notes,
          totalDa,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      for (const item of validatedData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return order
    })

    return NextResponse.json({ orderId: result.id, order: result })
  } catch (error: any) {
    console.error('Checkout error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
