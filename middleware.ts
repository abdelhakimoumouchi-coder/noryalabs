import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]

  if (host === 'www.storedzone.store') {
    const url = request.nextUrl.clone()
    url.hostname = 'storedzone.store'
    return NextResponse.redirect(url, 301)
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('admin_session')

    if (!cookie && !request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}
