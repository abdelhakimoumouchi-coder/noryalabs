import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../_auth'

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const body = await req.json()
    const rawUrls: unknown[] = Array.isArray(body.urls)
      ? body.urls
      : body.url
        ? [body.url]
        : []

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
