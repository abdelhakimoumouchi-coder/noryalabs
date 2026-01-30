import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const sort = searchParams.get('sort') || 'createdAt'

    const where: any = {}
    
    if (category) {
      where.category = category
    }
    if (subcategory) {
      where.subcategory = { name: subcategory }
    }
    
    if (priceMin || priceMax) {
      where.priceDa = {}
      if (priceMin) where.priceDa.gte = parseInt(priceMin)
      if (priceMax) where.priceDa.lte = parseInt(priceMax)
    }

    const orderBy: any = {}
    if (sort === 'price-asc') orderBy.priceDa = 'asc'
    else if (sort === 'price-desc') orderBy.priceDa = 'desc'
    else if (sort === 'name') orderBy.name = 'asc'
    else orderBy.createdAt = 'desc'

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { subcategory: true },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}