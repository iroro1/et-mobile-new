import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Only allow the admin email
    if (email !== "ojigboleo@gmail.com") {
      return NextResponse.json(
        { success: false, error: "Only the site administrator can access the CMS" },
        { status: 403 },
      )
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: {
            code: error.code,
            name: error.name,
            status: error.status,
          },
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error: any) {
    console.error("Unexpected login error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred", details: error.message },
      { status: 500 },
    )
  }
}
