import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      todayOrders,
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalProducts,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),

      prisma.order.count(),

      prisma.order.count({
        where: { status: 'pending' },
      }),

      prisma.order.aggregate({
        _sum: { totalDa: true },
      }),

      prisma.product.count(),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        wilaya: true,
        totalDa: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      todayOrders,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum?.totalDa ?? 0,
      totalProducts,
      recentOrders,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Dashboard error' },
      { status: 500 }
    )
  }
}