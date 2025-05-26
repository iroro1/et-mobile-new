import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// IMPORTANT: Remove this route before deploying to production
export async function GET() {
  // Only allow this in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Create a temporary session for the admin user
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "ojigboleo@gmail.com",
    // This is a temporary password, change it immediately after logging in
    password: "temporary-password-123",
  })

  if (error) {
    // If the user doesn't exist, create it
    if (error.message.includes("Invalid login credentials")) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: "ojigboleo@gmail.com",
        password: "temporary-password-123",
      })

      if (signUpError) {
        return NextResponse.json({ error: signUpError.message }, { status: 500 })
      }

      // Sign in with the newly created user
      await supabase.auth.signInWithPassword({
        email: "ojigboleo@gmail.com",
        password: "temporary-password-123",
      })
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.redirect(new URL("/cms", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
