"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"

const certificationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  issuer: z.string().min(2, {
    message: "Issuer is required.",
  }),
  issue_date: z.string().min(2, {
    message: "Issue date is required.",
  }),
  expiration_date: z.string().optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  image_url: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal("")),
  url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
})

type CertificationFormValues = z.infer<typeof certificationFormSchema>

interface CertificationFormProps {
  certification?: any
  isEditing?: boolean
}

export function CertificationForm({ certification, isEditing = false }: CertificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const defaultValues: Partial<CertificationFormValues> = {
    name: certification?.name || "",
    issuer: certification?.issuer || "",
    issue_date: certification?.issue_date || "",
    expiration_date: certification?.expiration_date || "",
    description: certification?.description || "",
    image_url: certification?.image_url || "",
    url: certification?.url || "",
  }

  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues,
  })

  async function onSubmit(data: CertificationFormValues) {
    setIsSubmitting(true)

    try {
      if (isEditing && certification?.id) {
        // Update existing certification
        const { error } = await supabase.from("certifications").update(data).eq("id", certification.id)

        if (error) throw error

        toast({
          title: "Certification updated",
          description: "Your certification has been updated successfully.",
        })
      } else {
        // Create new certification
        const { error } = await supabase.from("certifications").insert([{ ...data, id: crypto.randomUUID() }])

        if (error) throw error

        toast({
          title: "Certification created",
          description: "Your new certification has been created successfully.",
        })
      }

      router.push("/cms/certifications")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Certification name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issuer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuer</FormLabel>
              <FormControl>
                <Input placeholder="Organization that issued the certification" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., May 2023" {...field} />
                </FormControl>
                <FormDescription>The date when the certification was issued</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiration_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., May 2026" {...field} />
                </FormControl>
                <FormDescription>Leave blank if the certification doesn't expire</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the certification..." className="min-h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>URL of the certification badge image</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certification URL</FormLabel>
              <FormControl>
                <Input placeholder="https://www.credly.com/badges/..." {...field} />
              </FormControl>
              <FormDescription>Link to view the certification on Credly or issuer's website</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Certification" : "Create Certification"}
        </Button>
      </form>
    </Form>
  )
}
