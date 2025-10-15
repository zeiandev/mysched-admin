// next.config.ts
import type { NextConfig } from 'next'
import * as dotenv from 'dotenv'

// Load environment early — prefer .env.local, fallback to .env
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

// Expose needed variables explicitly for middleware and app
const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins is supported by Next.js runtime, not in type yet
  allowedDevOrigins: [process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean),
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ALLOW_ANY_AUTH_AS_ADMIN: process.env.ALLOW_ANY_AUTH_AS_ADMIN,
  },
}

export default nextConfig
