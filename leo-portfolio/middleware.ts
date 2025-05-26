import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Allow access to login page and API routes
  if (req.nextUrl.pathname.startsWith("/cms/login") || req.nextUrl.pathname.startsWith("/api/auth")) {
    return res
  }

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If the user is not authenticated and trying to access a protected route
  if (!session && req.nextUrl.pathname.startsWith("/cms")) {
    // Redirect to login page
    const redirectUrl = new URL("/cms/login", req.url)
    console.log("Middleware: Redirecting to login, no session found")
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated but not authorized (not the admin)
  if (session && session.user.email !== "ojigboleo@gmail.com" && req.nextUrl.pathname.startsWith("/cms")) {
    // Sign out and redirect to login page with error
    await supabase.auth.signOut()
    const redirectUrl = new URL("/cms/login?error=unauthorized", req.url)
    console.log("Middleware: Redirecting to login, unauthorized user")
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/cms/:path*", "/api/auth/:path*"],
}
