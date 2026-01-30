import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminProductSchema } from '@/lib/validations'
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

function makeSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `prod-${crypto.randomUUID().slice(0, 8)}`
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { subcategory: true },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = adminProductSchema.parse(body)
    const slug = data.slug ?? makeSlug(data.name)

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        benefits: data.benefits ?? [],
      },
    })
    return NextResponse.json(product)
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation', details: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product', details: e?.message }, { status: 500 })
  }
}