import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { event, session } = await req.json()
  const c = await cookies()
  const set = (name: string, value: string, maxAge: number) =>
    c.set({
      name,
      value,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
      secure: process.env.NODE_ENV === 'production',
    })

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    set('sb-access-token', session?.access_token ?? '', 60 * 60 * 24 * 7)
    set('sb-refresh-token', session?.refresh_token ?? '', 60 * 60 * 24 * 30)
  }
  if (event === 'SIGNED_OUT') {
    set('sb-access-token', '', 0)
    set('sb-refresh-token', '', 0)
  }
  return NextResponse.json({ ok: true })
}
