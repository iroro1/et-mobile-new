import { CalendarDays, Trophy } from "lucide-react"
import { getExperiences } from "@/lib/experiences-service"

export default async function Timeline() {
  const experiences = await getExperiences()

  return (
    <div className="space-y-8">
      {experiences.map((experience, index) => (
        <div key={experience._id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {experience.jd.toLowerCase().includes("cto") ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <CalendarDays className="h-5 w-5" />
              )}
            </div>
            {index < experiences.length - 1 && <div className="mt-2 h-full w-0.5 bg-secondary/30" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {experience.dateStart} - {experience.dateEnd}
              </h3>
              <div className="h-px flex-1 bg-secondary/30" />
            </div>
            <div className="mt-2">
              <h4 className="font-medium">{experience.jd}</h4>
              <p className="text-sm text-muted-foreground">{experience.company}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {experience.desc.split("/n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < experience.desc.split("/n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
