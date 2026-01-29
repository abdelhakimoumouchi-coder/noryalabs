import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminProductSchema } from '@/lib/validations'

function authorize(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret')
  return adminSecret && adminSecret === process.env.ADMIN_SECRET
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    const data = adminProductSchema.partial().parse(body)
    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json(product)
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (e.name === 'ZodError') return NextResponse.json({ error: 'Validation', details: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}