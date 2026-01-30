import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '../_auth'

// ─────────────────────────────
// Utils
// ─────────────────────────────
function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─────────────────────────────
// GET – list categories
// ─────────────────────────────
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const cats = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(cats)
}

// ─────────────────────────────
// POST – create category
// ─────────────────────────────
export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const body = await req.json()
  const name = String(body.name || '').trim()
  const order = Number(body.order ?? 0)

  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }

  const slug = slugify(name)

  const cat = await prisma.category.create({
    data: { name, slug, order },
  })

  return NextResponse.json(cat, { status: 201 })
}

// ─────────────────────────────
// PATCH – update category
// ─────────────────────────────
export async function PATCH(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const body = await req.json()
  const { id, name, order } = body || {}

  if (!id) {
    return NextResponse.json({ error: 'Id required' }, { status: 400 })
  }

  const prev = await prisma.category.findUnique({
    where: { id },
  })

  if (!prev) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    name?: string
    slug?: string
    order?: number
  } = {}

  if (name) {
    data.name = name.trim()
    data.slug = slugify(name)
  }

  if (order !== undefined) {
    data.order = Number(order)
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const cat = await tx.category.update({
      where: { id },
      data,
    })

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

// ─────────────────────────────
// DELETE – delete category
// ─────────────────────────────
export async function DELETE(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const body = await req.json()
  const { id } = body || {}

  if (!id) {
    return NextResponse.json({ error: 'Id required' }, { status: 400 })
  }

  const cat = await prisma.category.findUnique({
    where: { id },
  })

  if (!cat) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.category.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
