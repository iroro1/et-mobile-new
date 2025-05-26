"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Pencil, Trash2, ExternalLink, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface Certification {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiration_date?: string
  url: string
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchCertifications()
  }, [])

  async function fetchCertifications() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("issue_date", { ascending: false })

      if (error) {
        throw error
      }

      setCertifications(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching certifications",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteCertification(id: string) {
    try {
      const { error } = await supabase.from("certifications").delete().eq("id", id)

      if (error) {
        throw error
      }

      setCertifications(certifications.filter((cert) => cert.id !== id))
      toast({
        title: "Certification deleted",
        description: "The certification has been successfully deleted",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting certification",
        description: error.message,
      })
    }
  }

  async function refreshCredlyCertifications() {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/credly-scraper")
      if (!response.ok) {
        throw new Error(`Failed to refresh certifications: ${response.statusText}`)
      }

      const data = await response.json()

      toast({
        title: "Certifications refreshed",
        description: `Successfully refreshed ${data.badges?.length || 0} certifications from Credly.`,
      })

      // Refresh the list
      fetchCertifications()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error refreshing certifications",
        description: error.message,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Certifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshCredlyCertifications} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh from Credly
              </>
            )}
          </Button>
          <Button asChild>
            <Link href="/cms/certifications/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Certification
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search certifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Loading certifications...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No certifications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.name}</TableCell>
                    <TableCell>{cert.issuer}</TableCell>
                    <TableCell>{cert.issue_date}</TableCell>
                    <TableCell>{cert.expiration_date || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cms/certifications/${cert.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={cert.url} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the certification "
                                {cert.name}" from your portfolio.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCertification(cert.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
