"use client"

import { useState } from "react"
import { Loader2, RefreshCw, Database, Table, Code } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function DataManagementPage() {
  const [isLoadingMigration, setIsLoadingMigration] = useState(false)
  const [isLoadingCredly, setIsLoadingCredly] = useState(false)
  const [isLoadingSetup, setIsLoadingSetup] = useState(false)
  const [isLoadingSql, setIsLoadingSql] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [credlyResult, setCredlyResult] = useState<any>(null)
  const [setupResult, setSetupResult] = useState<any>(null)
  const [sqlResult, setSqlResult] = useState<any>(null)
  const [sqlQuery, setSqlQuery] = useState<string>("")
  const { toast } = useToast()

  async function setupDatabase() {
    setIsLoadingSetup(true)
    setSetupResult(null)

    try {
      const response = await fetch("/api/setup-db")
      const data = await response.json()

      setSetupResult(data)

      if (data.success) {
        toast({
          title: "Database Setup Successful",
          description: "Database tables have been created successfully.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Database Setup Failed",
          description: data.error || "An error occurred during database setup.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Database Setup Failed",
        description: error.message || "An error occurred during database setup.",
      })
    } finally {
      setIsLoadingSetup(false)
    }
  }

  async function runDataMigration() {
    setIsLoadingMigration(true)
    setMigrationResult(null)

    try {
      const response = await fetch("/api/data-migration")
      const data = await response.json()

      setMigrationResult(data)

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
      setIsLoadingMigration(false)
    }
  }

  async function runCredlyScraper() {
    setIsLoadingCredly(true)
    setCredlyResult(null)

    try {
      const response = await fetch("/api/credly-scraper")
      const data = await response.json()

      setCredlyResult(data)

      if (data.success) {
        toast({
          title: "Credly Scraper Successful",
          description: `Successfully scraped ${data.badges?.length || 0} badges from Credly.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Credly Scraper Failed",
          description: data.error || "An error occurred during Credly scraping.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Credly Scraper Failed",
        description: error.message || "An error occurred during Credly scraping.",
      })
    } finally {
      setIsLoadingCredly(false)
    }
  }

  async function executeDirectSql() {
    if (!sqlQuery.trim()) {
      toast({
        variant: "destructive",
        title: "SQL Required",
        description: "Please enter an SQL query to execute.",
      })
      return
    }

    setIsLoadingSql(true)
    setSqlResult(null)

    try {
      const response = await fetch("/api/direct-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sqlQuery }),
      })
      const data = await response.json()

      setSqlResult(data)

      if (data.success) {
        toast({
          title: "SQL Executed Successfully",
          description: "The SQL query was executed successfully.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "SQL Execution Failed",
          description: data.error || "An error occurred during SQL execution.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "SQL Execution Failed",
        description: error.message || "An error occurred during SQL execution.",
      })
    } finally {
      setIsLoadingSql(false)
    }
  }

  // Example SQL for creating certifications table
  const exampleSql = `
-- Create certifications table
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
);

-- Create trigger for updating the updated_at timestamp
DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_certifications_updated_at
BEFORE UPDATE ON certifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
  `.trim()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Data Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Create all required database tables.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This will create all the necessary database tables if they don't already exist. Run this first before
              attempting data migration or Credly scraping.
            </p>

            {setupResult && (
              <Alert
                className={`mt-4 ${setupResult.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
              >
                <AlertTitle>{setupResult.success ? "Setup Successful" : "Setup Failed"}</AlertTitle>
                <AlertDescription>
                  {setupResult.success ? (
                    <div>
                      <p>Database tables have been created successfully.</p>
                      {setupResult.results && (
                        <div className="mt-2">
                          <p>Tables created: {setupResult.results.tables.join(", ")}</p>
                          {setupResult.results.errors.length > 0 && (
                            <p>
                              Errors: {setupResult.results.errors.map((e: any) => `${e.table}: ${e.error}`).join("; ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    setupResult.error
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={setupDatabase} disabled={isLoadingSetup}>
              {isLoadingSetup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Table className="mr-2 h-4 w-4" />
                  Setup Database Tables
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Migration</CardTitle>
            <CardDescription>Migrate all current data from static files to the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This will transfer all projects, experiences, skills, and courses data from the static files to the
              Supabase database.
            </p>

            {migrationResult && (
              <Alert
                className={`mt-4 ${migrationResult.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
              >
                <AlertTitle>{migrationResult.success ? "Migration Successful" : "Migration Failed"}</AlertTitle>
                <AlertDescription>
                  {migrationResult.success ? (
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Projects: {migrationResult.results.projects.count} migrated</p>
                      <p>Experiences: {migrationResult.results.experiences.count} migrated</p>
                      <p>Skills: {migrationResult.results.skills.count} migrated</p>
                      <p>Courses: {migrationResult.results.courses.count} migrated</p>
                    </div>
                  ) : (
                    migrationResult.error
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={runDataMigration} disabled={isLoadingMigration}>
              {isLoadingMigration ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrating...
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

        <Card>
          <CardHeader>
            <CardTitle>Credly Scraper</CardTitle>
            <CardDescription>Scrape certifications from your Credly profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This will scrape all certification badges from your Credly profile at
              https://www.credly.com/users/leo-ojigbo/badges and store them in the database.
            </p>

            {credlyResult && (
              <Alert
                className={`mt-4 ${credlyResult.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
              >
                <AlertTitle>{credlyResult.success ? "Scraping Successful" : "Scraping Failed"}</AlertTitle>
                <AlertDescription>
                  {credlyResult.success
                    ? `Successfully scraped ${credlyResult.badges?.length || 0} badges from Credly.`
                    : credlyResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={runCredlyScraper} disabled={isLoadingCredly}>
              {isLoadingCredly ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Credly Scraper
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct SQL Execution</CardTitle>
            <CardDescription>Execute SQL queries directly against the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use this to execute custom SQL queries for database setup, data manipulation, or troubleshooting.
            </p>

            <Textarea
              placeholder="Enter SQL query here..."
              className="min-h-32 font-mono text-sm"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
            />

            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => setSqlQuery(exampleSql)} className="text-xs">
                Load Example (Create Certifications Table)
              </Button>
            </div>

            {sqlResult && (
              <Alert
                className={`mt-4 ${sqlResult.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
              >
                <AlertTitle>{sqlResult.success ? "SQL Executed Successfully" : "SQL Execution Failed"}</AlertTitle>
                <AlertDescription>
                  {sqlResult.success ? (
                    <div>
                      <p>Query executed successfully.</p>
                      {sqlResult.data && (
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-secondary/20 p-2 text-xs">
                          {JSON.stringify(sqlResult.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    sqlResult.error
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={executeDirectSql} disabled={isLoadingSql}>
              {isLoadingSql ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-4 w-4" />
                  Execute SQL
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
