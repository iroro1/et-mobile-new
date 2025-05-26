import Link from "next/link"
import { ExternalLink, BookOpen } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
  course: {
    title: string
    desc: string
    link: string
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="hover-card flex h-full flex-col border-secondary/10 bg-secondary/5 backdrop-blur-sm">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{course.desc}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={course.link} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Certificate
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
