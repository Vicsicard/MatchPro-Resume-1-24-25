import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getSession()

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Force HTTPS in development
  if (process.env.NODE_ENV === 'development' && !request.url.startsWith('https://')) {
    const httpsUrl = request.url.replace('http://', 'https://')
    return NextResponse.redirect(httpsUrl)
  }

  // If user is signed in and the current path is /login or /signup, redirect to /account
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // If user is not signed in and the current path is /account or /pricing, redirect to /login
  if (!session && (request.nextUrl.pathname.startsWith('/account') || request.nextUrl.pathname === '/pricing')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
