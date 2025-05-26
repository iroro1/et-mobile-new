"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface Experience {
  _id: string
  jd: string
  company: string
  date_start: string
  date_end: string
  desc: string
  tag: string
  premium?: boolean
  link?: string
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchExperiences()
  }, [])

  async function fetchExperiences() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("experiences").select("*").order("date_start", { ascending: false })

      if (error) {
        throw error
      }

      setExperiences(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching experiences",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteExperience(id: string) {
    try {
      const { error } = await supabase.from("experiences").delete().eq("_id", id)

      if (error) {
        throw error
      }

      setExperiences(experiences.filter((exp) => exp._id !== id))
      toast({
        title: "Experience deleted",
        description: "The experience has been successfully deleted",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting experience",
        description: error.message,
      })
    }
  }

  const filteredExperiences = experiences.filter(
    (exp) =>
      exp.jd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.company.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Experiences</h1>
        <Button asChild>
          <Link href="/cms/experiences/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Experience
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search experiences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No experiences found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExperiences.map((exp) => (
                  <TableRow key={exp._id}>
                    <TableCell className="font-medium">{exp.jd}</TableCell>
                    <TableCell>{exp.company}</TableCell>
                    <TableCell>
                      {exp.date_start} - {exp.date_end}
                    </TableCell>
                    <TableCell>
                      {exp.premium ? (
                        <Badge className="bg-primary">Featured</Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cms/experiences/${exp._id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the experience "{exp.jd} at{" "}
                                {exp.company}" from your portfolio.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteExperience(exp._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
