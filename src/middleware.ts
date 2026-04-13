import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /dashboard, /account, and /admin routes
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/account') || pathname.startsWith('/admin')) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes require the founder account
  if (pathname.startsWith('/admin') && user?.email !== 'voltgrid@protonmail.com') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Force passwordless users to set a password before accessing dashboard
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/account')) && !pathname.startsWith('/auth')) {
    const hasPassword = user.identities?.some(i => i.provider === 'email') ?? false
    if (!hasPassword) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/set-password'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/admin/:path*', '/auth/set-password'],
}
