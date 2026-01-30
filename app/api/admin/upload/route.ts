import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { requireAdmin } from '../_auth'

// ─────────────────────────────
// Config
// ─────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// ─────────────────────────────
// POST – upload files
// ─────────────────────────────
export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  const formData = await req.formData()
  const files = formData.getAll('files')

  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: 'No files' },
      { status: 400 }
    )
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const saved: string[] = []

  for (const file of files) {
    if (!(file instanceof File)) continue

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${Date.now()}_${safeName}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    await fs.writeFile(filePath, buffer)
    saved.push(`/uploads/${fileName}`)
  }

  return NextResponse.json({ urls: saved }, { status: 201 })
}
