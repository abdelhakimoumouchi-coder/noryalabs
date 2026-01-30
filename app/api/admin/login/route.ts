import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

// ─────────────────────────────
// Cloudflare Turnstile
// ─────────────────────────────
async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return false

  const resp = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    }
  )

  const data = await resp.json()
  return data.success === true
}

// ─────────────────────────────
// POST – admin login
// ─────────────────────────────
export async function POST(req: NextRequest) {
  const { password, turnstileToken } = await req.json()

  // Captcha check
  if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
    return NextResponse.json(
      { error: 'Captcha failed' },
      { status: 400 }
    )
  }

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) {
    return NextResponse.json(
      { error: 'Server not configured' },
      { status: 500 }
    )
  }

  const ok = await bcrypt.compare(password ?? '', hash)
  if (!ok) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ ok: true })

  res.cookies.set('admin_session', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8h
    path: '/',
  })

  return res
}
