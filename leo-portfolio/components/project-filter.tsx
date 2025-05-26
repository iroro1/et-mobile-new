"use client"
import { Badge } from "@/components/ui/badge"

interface ProjectFilterProps {
  tags: string[]
  activeTag: string
  onChange: (tag: string) => void
}

export function ProjectFilter({ tags, activeTag, onChange }: ProjectFilterProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={activeTag === tag ? "secondary" : "outline"}
          className={`cursor-pointer transition-all ${activeTag === tag ? "" : "hover:bg-secondary/20"}`}
          onClick={() => onChange(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
