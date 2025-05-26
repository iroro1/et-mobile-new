"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Award,
  Briefcase,
  Wrench,
  BookOpen,
  Settings,
  Loader2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface TableCount {
  table: string
  count: number
  icon: React.ReactNode
  route: string
  description: string
}

export default function CmsDashboardPage() {
  const [tableCounts, setTableCounts] = useState<TableCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchTableCounts() {
      setIsLoading(true)
      setError(null)

      try {
        // Define the tables we want to count
        const tables = [
          {
            table: "projects",
            icon: <FolderKanban className="h-5 w-5" />,
            route: "/cms/projects",
            description: "Portfolio projects",
          },
          {
            table: "blog_posts",
            icon: <FileText className="h-5 w-5" />,
            route: "/cms/blog",
            description: "Published articles",
          },
          {
            table: "certifications",
            icon: <Award className="h-5 w-5" />,
            route: "/cms/certifications",
            description: "Professional certifications",
          },
          {
            table: "courses",
            icon: <BookOpen className="h-5 w-5" />,
            route: "/cms/courses",
            description: "Completed courses",
          },
          {
            table: "experiences",
            icon: <Briefcase className="h-5 w-5" />,
            route: "/cms/experiences",
            description: "Work experiences",
          },
          {
            table: "skills",
            icon: <Wrench className="h-5 w-5" />,
            route: "/cms/skills",
            description: "Technical skills",
          },
        ]

        // Fetch counts for each table
        const countsWithMetadata = await Promise.all(
          tables.map(async (tableInfo) => {
            const { count, error } = await supabase.from(tableInfo.table).select("*", { count: "exact", head: true })

            if (error) {
              console.error(`Error fetching count for ${tableInfo.table}:`, error)
              return { ...tableInfo, count: 0 }
            }

            return { ...tableInfo, count: count || 0 }
          }),
        )

        setTableCounts(countsWithMetadata)
      } catch (err: any) {
        console.error("Error fetching table counts:", err)
        setError(err.message || "An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTableCounts()
  }, [supabase])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">CMS Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your portfolio content from this dashboard</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tableCounts.map((item) => (
            <Card key={item.table}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.table.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </CardTitle>
                <div className="rounded-full bg-secondary/10 p-2 text-primary">{item.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.count}</div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={item.route}>Manage</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <div className="rounded-full bg-secondary/10 p-2 text-primary">
                <Settings className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">⚙️</div>
              <p className="text-xs text-muted-foreground">Site configuration</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/cms/settings">Configure</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/cms/projects/new">
                <FolderKanban className="mr-2 h-4 w-4" />
                Add New Project
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/cms/blog/new">
                <FileText className="mr-2 h-4 w-4" />
                Add Blog Post
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/cms/certifications/new">
                <Award className="mr-2 h-4 w-4" />
                Add Certification
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/cms/settings/data">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Data Management
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/cms/experiences/new">
                <Briefcase className="mr-2 h-4 w-4" />
                Add Experience
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/cms/skills/new">
                <Wrench className="mr-2 h-4 w-4" />
                Add Skill
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
