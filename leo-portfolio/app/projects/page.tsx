"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectFilter } from "@/components/project-filter"
import { getAllProjects, getProjectsByType } from "@/lib/projects-service"
import { useEffect } from "react"

export default function ProjectsPage() {
  const [activeTag, setActiveTag] = useState("All")
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const allTags = ["All", "Web", "Mobile", "Premium", "AI/ML"]

  useEffect(() => {
    async function loadProjects() {
      setLoading(true)
      try {
        if (activeTag === "All") {
          const allProjects = await getAllProjects()
          setProjects(allProjects)
        } else {
          const filteredProjects = await getProjectsByType(activeTag)
          setProjects(filteredProjects)
        }
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [activeTag])

  const handleTagChange = (tag) => {
    setActiveTag(tag)
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">My Projects</h1>
          <p className="mt-4 text-lg text-muted-foreground">A collection of my work across web and mobile platforms.</p>
        </div>

        <ProjectFilter tags={allTags} activeTag={activeTag} onChange={handleTagChange} />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="hover-card group overflow-hidden border-secondary/10 bg-secondary/5 backdrop-blur-sm"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={project.image || project.img || "/placeholder.svg?height=340&width=600"}
                    alt={project.title}
                    width={600}
                    height={340}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {(project.tags || [project.type]).map((tag) => (
                      <Badge key={tag} variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="mt-2">{project.title}</CardTitle>
                  <CardDescription>{project.description || project.desc}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  {project.link ? (
                    <Button size="sm" asChild>
                      <Link href={project.link} target="_blank">
                        View Project
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
