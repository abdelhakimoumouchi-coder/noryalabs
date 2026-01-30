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
  const cats = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const name = String(body.name || '').trim()
  const order = Number(body.order ?? 0)
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const slug = slugify(name)
  const cat = await prisma.category.create({ data: { name, slug, order } })
  return NextResponse.json(cat, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, name, order } = body || {}
  if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 })

  const data: any = {}
  if (name) {
    data.name = name.trim()
    data.slug = slugify(name)
  }
  if (order !== undefined) data.order = Number(order)

  const prev = await prisma.category.findUnique({ where: { id } })
  if (!prev) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.$transaction(async (tx) => {
    const cat = await tx.category.update({ where: { id }, data })
    if (name) {
      await tx.product.updateMany({
        where: { category: prev.name },
        data: { category: name.trim() },
      })
    }
    return cat
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 })

  const cat = await prisma.category.findUnique({ where: { id } })
  if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}