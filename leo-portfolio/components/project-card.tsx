import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/projects-service"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const tags = Array.isArray(project.tags) ? project.tags : project.type.split("/").map((t) => t.trim())

  return (
    <Card className="hover-card group overflow-hidden border-secondary/10 bg-secondary/5 backdrop-blur-sm">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={project.image || project.img || "/placeholder.svg?height=340&width=600"}
          alt={project.title}
          width={600}
          height={340}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="mt-2">{project.title}</CardTitle>
        <CardDescription>{project.description || project.desc}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${project.slug || project.title.toLowerCase().replace(/\s+/g, "-")}`}>
            View Details
          </Link>
        </Button>
        {project.link && (
          <Button size="sm" asChild>
            <Link href={project.link} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Live Demo
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
