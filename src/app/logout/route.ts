// src/app/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const c = await cookies()
  c.set({ name: 'sb-access-token', value: '', path: '/', maxAge: 0 })
  c.set({ name: 'sb-refresh-token', value: '', path: '/', maxAge: 0 })
  return NextResponse.redirect(new URL('/login', 'http://localhost:3000'))
}
