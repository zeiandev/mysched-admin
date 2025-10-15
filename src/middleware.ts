import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PROTECTED = ['/admin', '/api']
const protects = (p: string) => PROTECTED.some(x => p === x || p.startsWith(x + '/'))

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!protects(pathname)) return NextResponse.next()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return NextResponse.redirect(new URL('/login?reason=server-misconfig', req.url))
  }

  const res = NextResponse.next()
  const cookiesAdapter = {
    get: (name: string) => req.cookies.get(name)?.value,
    getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
    set: (name: string, value: string, options?: CookieOptions) =>
      res.cookies.set(name, value, options),
    remove: (name: string, options?: CookieOptions) =>
      res.cookies.set(name, '', { ...(options || {}), maxAge: 0 }),
  }

  const sb = createServerClient(url, anon, { cookies: cookiesAdapter })
  const { data } = await sb.auth.getUser()
  if (!data?.user) {
    const to = new URL('/login', req.url)
    to.searchParams.set('reason', 'unauthorized')
    return NextResponse.redirect(to)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
