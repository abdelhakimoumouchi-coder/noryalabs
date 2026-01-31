export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(cats)
}