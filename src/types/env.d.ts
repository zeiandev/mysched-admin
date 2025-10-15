declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE: string
    NEXT_PUBLIC_SITE_URL?: string
    NODE_ENV?: 'development' | 'test' | 'production'
    ALLOW_ANY_AUTH_AS_ADMIN?: 'true' | 'false'
    NEXT_ADMIN_EMAILS?: string
  }
}