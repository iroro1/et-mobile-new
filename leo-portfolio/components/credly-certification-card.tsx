import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Calendar, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CredlyCertification } from "@/lib/credly-service"

interface CredlyCertificationCardProps {
  certification: CredlyCertification
}

export default function CredlyCertificationCard({ certification }: CredlyCertificationCardProps) {
  const isExpired = certification.expiration_date && new Date(certification.expiration_date) < new Date()

  return (
    <Card className="hover-card flex h-full flex-col border-secondary/10 bg-secondary/5 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="w-16 h-16 overflow-hidden rounded-md">
          <Image
            src={certification.image_url || "/placeholder.svg?height=64&width=64"}
            alt={certification.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <CardTitle className="text-xl">{certification.name}</CardTitle>
          <CardDescription>{certification.issuer}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {certification.issue_date}
          </div>
          {certification.expiration_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              Expires: {certification.expiration_date}
            </div>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground line-clamp-4">{certification.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={certification.url} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on {certification.issuer}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
