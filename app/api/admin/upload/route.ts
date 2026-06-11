import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../_auth'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE = 8 * 1024 * 1024

function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const files = formData.getAll('files').filter((file): file is File => file instanceof File)

      if (files.length === 0) {
        return NextResponse.json({ error: 'No files provided' }, { status: 400 })
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const urls: string[] = []

      for (const file of files) {
        if (!ALLOWED_TYPES.has(file.type)) {
          return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const originalName = sanitizeFileName(file.name || 'product-image.webp')
        const ext = path.extname(originalName) || '.webp'
        const base = path.basename(originalName, ext) || 'product-image'
        const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}_${base}${ext}`

        await writeFile(path.join(uploadDir, fileName), buffer)
        urls.push(`/uploads/${fileName}`)
      }

      return NextResponse.json({ urls }, { status: 201 })
    }

    const body = await req.json()
    const rawUrls: unknown[] = Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : []

    if (rawUrls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 })
    }

    const validated: string[] = []
    for (const u of rawUrls) {
      if (typeof u !== 'string') {
        return NextResponse.json({ error: 'Invalid URL value' }, { status: 400 })
      }
      let parsed: URL
      try {
        parsed = new URL(u)
      } catch {
        return NextResponse.json({ error: `Invalid URL: ${u}` }, { status: 400 })
      }
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return NextResponse.json({ error: `Unsupported URL protocol: ${u}` }, { status: 400 })
      }
      validated.push(u)
    }

    return NextResponse.json({ urls: validated }, { status: 201 })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json(
      { error: 'Failed to process', details: e?.message },
      { status: 500 }
    )
  }
}
