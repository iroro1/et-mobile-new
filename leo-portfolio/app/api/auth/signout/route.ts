import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to login page
  return NextResponse.redirect(new URL("/cms/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
