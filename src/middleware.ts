import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAuth = !!user;
  const path = req.nextUrl.pathname;
  const protectedPaths = ['/dashboard', '/sections', '/classes'];
  const isProtected = protectedPaths.some(p => path.startsWith(p));
  const isLogin = path === '/login';

  if (!isAuth && isProtected) {
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
  matcher: ['/dashboard/:path*', '/sections/:path*', '/classes/:path*', '/login'],
};
