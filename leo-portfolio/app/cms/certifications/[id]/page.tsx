"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CertificationForm } from "@/components/cms/certification-form"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function EditCertificationPage() {
  const [certification, setCertification] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const certificationId = params.id as string

  useEffect(() => {
    async function fetchCertification() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("certifications").select("*").eq("id", certificationId).single()

        if (error) {
          throw error
        }

        setCertification(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching certification",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (certificationId) {
      fetchCertification()
    }
  }, [certificationId, toast, supabase])

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/cms/certifications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certifications
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Certification</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <p>Loading certification...</p>
          </div>
        ) : certification ? (
          <CertificationForm certification={certification} isEditing />
        ) : (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            Certification not found
          </div>
        )}
      </div>
    </div>
  )
}
