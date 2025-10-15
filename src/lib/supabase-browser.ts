import { createBrowserClient } from '@supabase/ssr'
export function sbBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createBrowserClient(url, anon)
}
