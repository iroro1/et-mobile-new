import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CertificationCardProps {
  certification: {
    title: string
    organization: string
    description: string
    link: string
  }
}

export default function CertificationCard({ certification }: CertificationCardProps) {
  return (
    <Card className="hover-card flex h-full flex-col border-secondary/10 bg-secondary/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">{certification.title}</CardTitle>
        <CardDescription>{certification.organization}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{certification.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={certification.link} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Certificate
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
