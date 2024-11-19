import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Force HTTPS in development
  if (process.env.NODE_ENV === 'development' && !req.url.startsWith('https://')) {
    const httpsUrl = req.url.replace('http://', 'https://')
    return NextResponse.redirect(httpsUrl)
  }

  // If user is signed in and the current path is /login or /signup, redirect to /account
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/account', req.url))
  }

  // If user is not signed in and the current path is /account or /pricing, redirect to /login
  if (!session && (req.nextUrl.pathname.startsWith('/account') || req.nextUrl.pathname === '/pricing')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
