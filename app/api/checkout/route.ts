import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkoutSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedData = checkoutSchema.parse(body)

    const productIds = validatedData.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: 'Some products not found' },
        { status: 404 }
      )
    }

    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
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

    const order = await prisma.order.create({
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
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json({ orderId: order.id, order })
  } catch (error: any) {
    console.error('Checkout error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
