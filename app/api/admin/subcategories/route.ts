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
// GET – list subcategories
// ─────────────────────────────
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const categoryId =
    req.nextUrl.searchParams.get('categoryId') || undefined

  const subcategories = await prisma.subcategory.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(subcategories)
}

// ─────────────────────────────
// POST – create subcategory
// ─────────────────────────────
export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const body = await req.json()
  const name = String(body.name || '').trim()
  const order = Number(body.order ?? 0)
  const categoryId = String(body.categoryId || '').trim()

  if (!name || !categoryId) {
    return NextResponse.json(
      { error: 'Name and categoryId required' },
      { status: 400 }
    )
  }

  const slug = slugify(name)

  const sub = await prisma.subcategory.create({
    data: { name, slug, order, categoryId },
  })

  return NextResponse.json(sub, { status: 201 })
}

// ─────────────────────────────
// PATCH – update subcategory
// ─────────────────────────────
export async function PATCH(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const body = await req.json()
  const { id, name, order, categoryId } = body || {}

  if (!id) {
    return NextResponse.json(
      { error: 'Id required' },
      { status: 400 }
    )
  }

  const data: any = {}

  if (name) {
    data.name = name.trim()
    data.slug = slugify(name)
  }

  if (order !== undefined) data.order = Number(order)
  if (categoryId) data.categoryId = categoryId

  const sub = await prisma.subcategory.update({
    where: { id },
    data,
  })

  return NextResponse.json(sub)
}

// ─────────────────────────────
// DELETE – delete subcategory
// ─────────────────────────────
export async function DELETE(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const body = await req.json()
  const { id } = body || {}

  if (!id) {
    return NextResponse.json(
      { error: 'Id required' },
      { status: 400 }
    )
  }

  await prisma.subcategory.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
