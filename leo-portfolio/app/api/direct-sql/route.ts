import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ success: false, error: "SQL query is required" }, { status: 400 })
    }

    console.log("Executing SQL:", sql.substring(0, 100) + (sql.length > 100 ? "..." : ""))

    // Use the Supabase REST API directly
    try {
      const apiUrl = `${process.env.SUPABASE_URL}/rest/v1/`
      const response = await fetch(`${apiUrl}sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("SQL execution failed:", errorText)
        return NextResponse.json({ success: false, error: errorText }, { status: 500 })
      }

      // For most DDL statements, the response will be empty
      let data = null
      try {
        data = await response.json()
      } catch (e) {
        // If the response is empty, that's fine for DDL statements
        data = { message: "Query executed successfully" }
      }

      return NextResponse.json({
        success: true,
        data,
      })
    } catch (error: any) {
      console.error("Error executing SQL via REST API:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in direct-sql:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
