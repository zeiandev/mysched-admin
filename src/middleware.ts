import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // cookie adapter to satisfy @supabase/ssr types
  const cookiesAdapter: any = {
    get(name: string) {
      return req.cookies.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      res.cookies.set({ name, value, ...options } as any);
    },
    remove(name: string, options: CookieOptions) {
      res.cookies.set({ name, value: '', ...options } as any);
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAuth = !!user;
  const p = req.nextUrl.pathname;

  const protect = ['/dashboard', '/sections', '/classes', '/admins'].some(x => p.startsWith(x));
  const apiProtect = p === '/api/classes/import';
  const isLogin = p === '/login';

  if (!isAuth && (protect || apiProtect)) {
    const url = req.nextUrl.clone(); url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (isAuth && isLogin) {
    const url = req.nextUrl.clone(); url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sections/:path*',
    '/classes/:path*',
    '/admins/:path*',
    '/api/classes/import',
    '/login',
  ],
};
