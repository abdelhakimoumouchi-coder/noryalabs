import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function authorize(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret')
  return adminSecret && adminSecret === process.env.ADMIN_SECRET
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const categoryId = req.nextUrl.searchParams.get('categoryId') || undefined
  const subcats = await prisma.subcategory.findMany({
    where: { ...(categoryId ? { categoryId } : {}) },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(subcats)
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const name = String(body.name || '').trim()
  const order = Number(body.order ?? 0)
  const categoryId = String(body.categoryId || '').trim()
  if (!name || !categoryId) return NextResponse.json({ error: 'Name and categoryId required' }, { status: 400 })
  const slug = slugify(name)
  const sub = await prisma.subcategory.create({ data: { name, slug, order, categoryId } })
  return NextResponse.json(sub, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, name, order, categoryId } = body || {}
  if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 })

  const data: any = {}
  if (name) {
    data.name = name.trim()
    data.slug = slugify(name)
  }
  if (order !== undefined) data.order = Number(order)
  if (categoryId) data.categoryId = categoryId

  const sub = await prisma.subcategory.update({ where: { id }, data })
  return NextResponse.json(sub)
}

export async function DELETE(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 })
  await prisma.subcategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}