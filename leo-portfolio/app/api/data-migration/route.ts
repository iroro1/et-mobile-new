import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"
import { getAllProjects } from "@/lib/projects-service"
import { getExperiences } from "@/lib/experiences-service"
import { getSkills } from "@/lib/skills-service"
import { getCourses } from "@/lib/courses-service"
import crypto from "crypto"

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const results = {
      tables: { created: false },
      projects: { count: 0, success: false },
      experiences: { count: 0, success: false },
      skills: { count: 0, success: false },
      courses: { count: 0, success: false },
    }

    // Migrate projects
    try {
      const projects = await getAllProjects()

      // Clear existing projects
      await supabase.from("projects").delete().neq("_id", "0")

      // Insert projects - only include fields that exist in the database schema
      if (projects.length > 0) {
        const formattedProjects = projects.map((project) => ({
          // Generate a valid UUID instead of using the existing _id
          _id: crypto.randomUUID(),
          title: project.title,
          type: project.type,
          desc: project.desc || project.description || "",
          link: project.link || project.demoUrl || null,
          img: project.img || project.image || null,
          premium: project.premium || false,
          tags: Array.isArray(project.tags) ? project.tags : [project.type],
          // Exclude fields that don't exist in the database schema:
          // android, ios, etc.
        }))

        const { error } = await supabase.from("projects").insert(formattedProjects)

        if (!error) {
          results.projects.count = projects.length
          results.projects.success = true
        } else {
          console.error("Error inserting projects:", error)
        }
      }
    } catch (error) {
      console.error("Error migrating projects:", error)
    }

    // Migrate experiences
    try {
      const experiences = await getExperiences()

      // Clear existing experiences
      await supabase.from("experiences").delete().neq("_id", "0")

      // Insert experiences - map camelCase to snake_case
      if (experiences.length > 0) {
        const formattedExperiences = experiences.map((exp) => ({
          // Generate a valid UUID instead of using the existing _id
          _id: crypto.randomUUID(),
          jd: exp.jd,
          company: exp.company,
          date_start: exp.dateStart, // Map dateStart to date_start
          date_end: exp.dateEnd, // Map dateEnd to date_end
          desc: exp.desc,
          tag: exp.tag,
          premium: exp.premium || false,
          link: exp.link || null,
        }))

        const { error } = await supabase.from("experiences").insert(formattedExperiences)

        if (!error) {
          results.experiences.count = experiences.length
          results.experiences.success = true
        } else {
          console.error("Error inserting experiences:", error)
        }
      }
    } catch (error) {
      console.error("Error migrating experiences:", error)
    }

    // Migrate skills
    try {
      const skills = await getSkills()

      // Clear existing skills
      await supabase.from("skills").delete().neq("_id", "0")

      // Insert skills with valid UUIDs
      if (skills.length > 0) {
        const formattedSkills = skills.map((skill) => ({
          ...skill,
          _id: crypto.randomUUID(), // Replace existing ID with a valid UUID
        }))

        const { error } = await supabase.from("skills").insert(formattedSkills)
        if (!error) {
          results.skills.count = skills.length
          results.skills.success = true
        } else {
          console.error("Error inserting skills:", error)
        }
      }
    } catch (error) {
      console.error("Error migrating skills:", error)
    }

    // Migrate courses
    try {
      const courses = await getCourses()

      // Clear existing courses
      await supabase.from("courses").delete().neq("_id", "0")

      // Insert courses with valid UUIDs
      if (courses.length > 0) {
        const formattedCourses = courses.map((course) => ({
          _id: crypto.randomUUID(), // Replace existing ID with a valid UUID
          title: course.title,
          desc: course.desc,
          link: course.link,
          type: course.type,
        }))

        const { error } = await supabase.from("courses").insert(formattedCourses)
        if (!error) {
          results.courses.count = courses.length
          results.courses.success = true
        } else {
          console.error("Error inserting courses:", error)
        }
      }
    } catch (error) {
      console.error("Error migrating courses:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Data migration completed",
      results,
    })
  } catch (error) {
    console.error("Error in data migration:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
