import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const hdr = req.headers
  // safer IP extraction, no req.ip
  const ip =
    hdr.get('x-real-ip') ||
    hdr.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdr.get('x-vercel-forwarded-for') ||
    'unknown'

  let city = '', region = '', country = ''
  try {
    if (ip && ip !== 'unknown') {
      const res = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'no-store' })
      const j = await res.json()
      city = j.city || ''
      region = j.region || ''
      country = j.country_name || j.country || ''
    }
  } catch {}

  const secure = (hdr.get('x-forwarded-proto') || '').toLowerCase() === 'https'

  return NextResponse.json({
    ip,
    city,
    region,
    country,
    secure,
  })
}
