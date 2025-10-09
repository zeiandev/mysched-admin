import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const supaServer = () => {
  const store = cookies();
  const cookieAdapter: any = {
    get(name: string) { return store.get(name)?.value; },
    set(name: string, value: string, options: CookieOptions) {
      store.set({ name, value, ...options } as any);
    },
    remove(name: string, options: CookieOptions) {
      store.set({ name, value: '', ...options } as any);
    },
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );
};
