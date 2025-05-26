import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Test getting the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json(
        {
          success: false,
          error: "Session error",
          details: sessionError,
        },
        { status: 500 },
      )
    }

    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from("projects")
      .select("count(*)", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      session: sessionData,
      databaseTest: {
        success: !testError,
        error: testError,
        data: testData,
      },
      cookies: {
        count: cookies().getAll().length,
        names: cookies()
          .getAll()
          .map((c) => c.name),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
