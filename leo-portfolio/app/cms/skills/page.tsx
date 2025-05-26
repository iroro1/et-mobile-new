"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Skill {
  _id: string
  title: string
  rating: number
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchSkills()
  }, [])

  async function fetchSkills() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("skills").select("*").order("title", { ascending: true })

      if (error) {
        throw error
      }

      setSkills(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching skills",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteSkill(id: string) {
    try {
      const { error } = await supabase.from("skills").delete().eq("_id", id)

      if (error) {
        throw error
      }

      setSkills(skills.filter((skill) => skill._id !== id))
      toast({
        title: "Skill deleted",
        description: "The skill has been successfully deleted",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting skill",
        description: error.message,
      })
    }
  }

  const filteredSkills = skills.filter((skill) => skill.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Skills</h1>
        <Button asChild>
          <Link href="/cms/skills/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Skill
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Loading skills...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSkills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No skills found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSkills.map((skill) => (
                  <TableRow key={skill._id}>
                    <TableCell className="font-medium">{skill.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-secondary/30">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${(skill.rating / 5) * 100}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm">{skill.rating}/5</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cms/skills/${skill._id}`}>
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
                                This action cannot be undone. This will permanently delete the skill "{skill.title}"
                                from your portfolio.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSkill(skill._id)}
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
