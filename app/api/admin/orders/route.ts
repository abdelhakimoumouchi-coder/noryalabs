import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../_auth'
// ...
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard
  // suite...
}
export async function GET(request: NextRequest) {
  try {
    const adminSecret = request.headers.get('x-admin-secret')
    
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}