// next.config.ts
import type { NextConfig } from 'next'
import * as dotenv from 'dotenv'

// Load environment early
dotenv.config({ path: '.env.local' })
dotenv.config()

// Warn if important env vars missing
const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

for (const k of requiredEnv) {
  if (!process.env[k]) {
    console.warn(`[next.config] Missing ${k} in environment`)
  }
}

// Secure headers for all routes
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ALLOW_ANY_AUTH_AS_ADMIN: process.env.ALLOW_ANY_AUTH_AS_ADMIN,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
