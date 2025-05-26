"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ProjectForm } from "@/components/cms/project-form"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function EditProjectPage() {
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const projectId = params.id as string

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("projects").select("*").eq("_id", projectId).single()

        if (error) {
          throw error
        }

        setProject(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching project",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, toast, supabase])

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/cms/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <p>Loading project...</p>
          </div>
        ) : project ? (
          <ProjectForm project={project} isEditing />
        ) : (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            Project not found
          </div>
        )}
      </div>
    </div>
  )
}
