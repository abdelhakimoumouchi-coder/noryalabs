import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { requireAdmin } from '../_auth'

export const runtime = 'nodejs' // force le runtime node

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const formData = await req.formData()
    const files = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files' }, { status: 400 })
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const saved: string[] = []

    for (const file of files) {
      // file peut être string ou Blob/File
      if (!file || typeof file === 'string' || typeof (file as any).arrayBuffer !== 'function') continue

      const blob = file as Blob
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const originalName = (blob as any).name || 'file'
      const safeName = String(originalName).replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileName = `${Date.now()}_${safeName || 'upload'}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      await fs.writeFile(filePath, buffer)
      saved.push(`/uploads/${fileName}`)
    }

    if (saved.length === 0) {
      return NextResponse.json({ error: 'No valid files' }, { status: 400 })
    }

    return NextResponse.json({ urls: saved }, { status: 201 })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json(
      { error: 'Failed to upload', details: e?.message },
      { status: 500 }
    )
  }
}
