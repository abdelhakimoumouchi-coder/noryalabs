import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId') || undefined
  const subcats = await prisma.subcategory.findMany({
    where: { ...(categoryId ? { categoryId } : {}) },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(subcats)
}