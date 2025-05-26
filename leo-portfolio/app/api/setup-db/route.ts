import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const results = {
      tables: [],
      errors: [],
    }

    // Create tables directly using individual queries
    const createTablesQueries = [
      {
        name: "update_function",
        sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `,
      },
      {
        name: "projects",
        sql: `
        CREATE TABLE IF NOT EXISTS projects (
          _id UUID PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          desc TEXT,
          link TEXT,
          img TEXT,
          premium BOOLEAN DEFAULT FALSE,
          tags TEXT[],
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
      {
        name: "blog_posts",
        sql: `
        CREATE TABLE IF NOT EXISTS blog_posts (
          id UUID PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          url TEXT NOT NULL,
          date TEXT NOT NULL,
          image TEXT,
          excerpt TEXT,
          category TEXT NOT NULL,
          platform TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
      {
        name: "certifications",
        sql: `
        CREATE TABLE IF NOT EXISTS certifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          issuer TEXT NOT NULL,
          issue_date TEXT NOT NULL,
          expiration_date TEXT,
          description TEXT,
          image_url TEXT,
          url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
      {
        name: "experiences",
        sql: `
        CREATE TABLE IF NOT EXISTS experiences (
          _id UUID PRIMARY KEY,
          jd TEXT NOT NULL,
          company TEXT NOT NULL,
          date_start TEXT NOT NULL,
          date_end TEXT NOT NULL,
          desc TEXT,
          tag TEXT,
          premium BOOLEAN DEFAULT FALSE,
          link TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
      {
        name: "skills",
        sql: `
        CREATE TABLE IF NOT EXISTS skills (
          _id UUID PRIMARY KEY,
          title TEXT NOT NULL,
          rating INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
      {
        name: "courses",
        sql: `
        CREATE TABLE IF NOT EXISTS courses (
          _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          desc TEXT NOT NULL,
          link TEXT NOT NULL,
          type TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
      {
        name: "settings",
        sql: `
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT NOT NULL UNIQUE,
          value JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      },
    ]

    // Execute each query directly using the Supabase client
    for (const query of createTablesQueries) {
      try {
        // Use the Supabase REST API directly
        const apiUrl = `${process.env.SUPABASE_URL}/rest/v1/`
        const response = await fetch(`${apiUrl}sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ query: query.sql }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error creating ${query.name}:`, errorText)
          results.errors.push({ table: query.name, error: errorText })
        } else {
          console.log(`Successfully created ${query.name}`)
          results.tables.push(query.name)
        }
      } catch (err: any) {
        console.error(`Exception creating ${query.name}:`, err)
        results.errors.push({ table: query.name, error: err.message })
      }
    }

    // Create triggers after tables are created
    const createTriggersQueries = [
      {
        name: "project_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
        CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
      {
        name: "blog_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
        CREATE TRIGGER update_blog_posts_updated_at
        BEFORE UPDATE ON blog_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
      {
        name: "cert_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
        CREATE TRIGGER update_certifications_updated_at
        BEFORE UPDATE ON certifications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
      {
        name: "exp_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
        CREATE TRIGGER update_experiences_updated_at
        BEFORE UPDATE ON experiences
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
      {
        name: "skills_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
        CREATE TRIGGER update_skills_updated_at
        BEFORE UPDATE ON skills
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
      {
        name: "courses_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
        CREATE TRIGGER update_courses_updated_at
        BEFORE UPDATE ON courses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
      {
        name: "settings_trigger",
        sql: `
        DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
        CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        `,
      },
    ]

    // Execute each trigger query
    for (const query of createTriggersQueries) {
      try {
        // Use the Supabase REST API directly
        const apiUrl = `${process.env.SUPABASE_URL}/rest/v1/`
        const response = await fetch(`${apiUrl}sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ query: query.sql }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error creating ${query.name}:`, errorText)
          results.errors.push({ table: query.name, error: errorText })
        } else {
          console.log(`Successfully created ${query.name}`)
          results.tables.push(query.name)
        }
      } catch (err: any) {
        console.error(`Exception creating ${query.name}:`, err)
        results.errors.push({ table: query.name, error: err.message })
      }
    }

    // Verify tables were created by checking if we can select from them
    const tablesToCheck = ["projects", "blog_posts", "certifications", "experiences", "skills", "courses", "settings"]

    const tableStatus = []
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1)
        tableStatus.push({
          table,
          exists: !error,
          error: error ? error.message : null,
        })
      } catch (err: any) {
        tableStatus.push({
          table,
          exists: false,
          error: err.message,
        })
      }
    }

    console.log("Table status:", tableStatus)

    return NextResponse.json({
      success: results.errors.length === 0 || results.tables.length > 0,
      message:
        results.errors.length === 0
          ? "Database tables created successfully"
          : results.tables.length > 0
            ? "Some tables created successfully"
            : "Failed to create tables",
      results,
      tableStatus,
    })
  } catch (error: any) {
    console.error("Error in setup-db:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
