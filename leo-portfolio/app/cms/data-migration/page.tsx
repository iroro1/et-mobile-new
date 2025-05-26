"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Database, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function DataMigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  async function runDataMigration() {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/data-migration")
      const data = await response.json()

      setResult(data)

      if (data.success) {
        toast({
          title: "Data Migration Successful",
          description: "All data has been successfully migrated to the database.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Data Migration Failed",
          description: data.error || "An error occurred during data migration.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Data Migration Failed",
        description: error.message || "An error occurred during data migration.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/cms/settings/data">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Data Management
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Data Migration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migrate Static Data to Database</CardTitle>
          <CardDescription>
            Transfer all projects, experiences, skills, and courses data from static files to the Supabase database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This process will migrate all your static data from the code files to your Supabase database. This is useful
            when you've set up a new database and want to populate it with your existing data.
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span>Projects, blog posts, certifications, experiences, skills, and courses will be migrated.</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Existing data in the database will be replaced.</span>
            </div>
          </div>

          {result && (
            <Alert
              className={`mt-6 ${result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
            >
              <AlertTitle>{result.success ? "Migration Successful" : "Migration Failed"}</AlertTitle>
              <AlertDescription>
                {result.success ? (
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Projects: {result.results?.projects?.count || 0} migrated</p>
                    <p>Experiences: {result.results?.experiences?.count || 0} migrated</p>
                    <p>Skills: {result.results?.skills?.count || 0} migrated</p>
                    <p>Courses: {result.results?.courses?.count || 0} migrated</p>
                  </div>
                ) : (
                  result.error
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runDataMigration} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Run Data Migration
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
