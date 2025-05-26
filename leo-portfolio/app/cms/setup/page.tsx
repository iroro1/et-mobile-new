"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/cms/protected-route"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    projects: boolean
    blogPosts: boolean
    certifications: boolean
    experiences: boolean
    skills: boolean
    settings: boolean
  }>({
    projects: false,
    blogPosts: false,
    certifications: false,
    experiences: false,
    skills: false,
    settings: false,
  })
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  async function checkDatabaseSetup() {
    setIsLoading(true)
    setError(null)

    try {
      // Check projects table
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("count(*)", { count: "exact", head: true })

      // Check blog posts table
      const { data: blogData, error: blogError } = await supabase
        .from("blog_posts")
        .select("count(*)", { count: "exact", head: true })

      // Check certifications table
      const { data: certData, error: certError } = await supabase
        .from("certifications")
        .select("count(*)", { count: "exact", head: true })

      // Check experiences table
      const { data: expData, error: expError } = await supabase
        .from("experiences")
        .select("count(*)", { count: "exact", head: true })

      // Check skills table
      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("count(*)", { count: "exact", head: true })

      // Check settings table
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("count(*)", { count: "exact", head: true })

      setStatus({
        projects: !projectsError,
        blogPosts: !blogError,
        certifications: !certError,
        experiences: !expError,
        skills: !skillsError,
        settings: !settingsError,
      })

      toast({
        title: "Database check complete",
        description: "Check the status of your database tables below.",
      })
    } catch (err: any) {
      setError(err.message || "An error occurred during setup check.")
      toast({
        variant: "destructive",
        title: "Check failed",
        description: err.message || "An error occurred during setup check.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const allTablesExist = Object.values(status).every(Boolean)

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup Status</CardTitle>
            <CardDescription>Check if all required database tables exist in your Supabase project.</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium">Database Tables</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center justify-between">
                    <span>Projects Table</span>
                    <StatusBadge exists={status.projects} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Blog Posts Table</span>
                    <StatusBadge exists={status.blogPosts} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Certifications Table</span>
                    <StatusBadge exists={status.certifications} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Experiences Table</span>
                    <StatusBadge exists={status.experiences} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Skills Table</span>
                    <StatusBadge exists={status.skills} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Settings Table</span>
                    <StatusBadge exists={status.settings} />
                  </li>
                </ul>
              </div>

              {allTablesExist && (
                <Alert className="bg-green-500/10 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>All tables exist!</AlertTitle>
                  <AlertDescription>
                    Your database is properly set up. You can now use the CMS to manage your content.
                  </AlertDescription>
                </Alert>
              )}

              {!allTablesExist && Object.values(status).some(Boolean) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Some tables are missing</AlertTitle>
                  <AlertDescription>
                    Please run the SQL setup script in the Supabase SQL Editor to create all required tables.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={checkDatabaseSetup} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Database Setup"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

function StatusBadge({ exists }: { exists: boolean }) {
  if (exists) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="mr-1 h-3 w-3" />
        Exists
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <AlertCircle className="mr-1 h-3 w-3" />
      Missing
    </span>
  )
}
