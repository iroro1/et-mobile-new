import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CredlyCertificationCard from "@/components/credly-certification-card"
import CourseCard from "@/components/course-card"
import { getCredlyCertifications } from "@/lib/credly-service"
import { getCourses } from "@/lib/courses-service"

export const revalidate = 3600 // Revalidate this page every hour

export default async function CertificationsPage() {
  const certifications = await getCredlyCertifications()
  const courses = await getCourses()

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl">My Certifications & Courses</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A collection of my professional certifications and completed courses.
          </p>
        </div>

        <Tabs defaultValue="certifications" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="certifications" className="mt-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((certification) => (
                <CredlyCertificationCard key={certification.id} certification={certification} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="courses" className="mt-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
