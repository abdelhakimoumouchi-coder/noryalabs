import { NextRequest, NextResponse } from 'next/server'

export function requireAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value
  if (session !== 'ok') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}