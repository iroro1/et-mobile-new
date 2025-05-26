"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CertificationForm } from "@/components/cms/certification-form"

export default function NewCertificationPage() {
  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/cms/certifications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certifications
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Certification</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <CertificationForm />
      </div>
    </div>
  )
}
