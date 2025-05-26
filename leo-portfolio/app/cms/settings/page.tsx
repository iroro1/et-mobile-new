"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, Shield } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"

const generalSettingsSchema = z.object({
  siteTitle: z.string().min(1, { message: "Site title is required" }),
  siteDescription: z.string().min(1, { message: "Site description is required" }),
  ownerName: z.string().min(1, { message: "Owner name is required" }),
  ownerEmail: z.string().email({ message: "Please enter a valid email" }),
  ownerTitle: z.string().min(1, { message: "Owner title is required" }),
})

const socialSettingsSchema = z.object({
  github: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
  linkedin: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
  twitter: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
  instagram: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
  facebook: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
})

const seoSettingsSchema = z.object({
  metaTitle: z.string().min(1, { message: "Meta title is required" }),
  metaDescription: z.string().min(1, { message: "Meta description is required" }),
  ogImage: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
  googleAnalyticsId: z.string().optional(),
})

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>
type SocialSettingsValues = z.infer<typeof socialSettingsSchema>
type SeoSettingsValues = z.infer<typeof seoSettingsSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteTitle: "Leo Ojigbo | Full Stack Engineer",
      siteDescription: "Portfolio of Leo Ojigbo, a Full Stack Engineer specializing in web and mobile development.",
      ownerName: "Leo Ojigbo",
      ownerEmail: "ojigboleo@gmail.com",
      ownerTitle: "Full Stack Engineer",
    },
  })

  const socialForm = useForm<SocialSettingsValues>({
    resolver: zodResolver(socialSettingsSchema),
    defaultValues: {
      github: "https://github.com/iroro1",
      linkedin: "https://www.linkedin.com/in/iroro1/",
      twitter: "https://x.com/LeoOjigbo",
      instagram: "",
      facebook: "",
    },
  })

  const seoForm = useForm<SeoSettingsValues>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      metaTitle: "Leo Ojigbo | Full Stack Engineer",
      metaDescription: "Portfolio of Leo Ojigbo, a Full Stack Engineer specializing in web and mobile development.",
      ogImage: "",
      googleAnalyticsId: "G-Z5Y0KBTS3B",
    },
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        // Load general settings
        const { data: generalData, error: generalError } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "general")
          .single()

        if (generalData && !generalError) {
          generalForm.reset(generalData.value)
        }

        // Load social settings
        const { data: socialData, error: socialError } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "social")
          .single()

        if (socialData && !socialError) {
          socialForm.reset(socialData.value)
        }

        // Load SEO settings
        const { data: seoData, error: seoError } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "seo")
          .single()

        if (seoData && !seoError) {
          seoForm.reset(seoData.value)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [generalForm, socialForm, seoForm, supabase])

  async function onSubmitGeneral(data: GeneralSettingsValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("settings").upsert({ key: "general", value: data }, { onConflict: "key" })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "General settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmitSocial(data: SocialSettingsValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("settings").upsert({ key: "social", value: data }, { onConflict: "key" })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Social media settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmitSeo(data: SeoSettingsValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("settings").upsert({ key: "seo", value: data }, { onConflict: "key" })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "SEO settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account with two-factor authentication.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/cms/settings/mfa">Manage MFA</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your site's general information.</CardDescription>
            </CardHeader>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="siteTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>The title of your portfolio website.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>A brief description of your portfolio website.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="ownerTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Professional Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>E.g., "Full Stack Engineer", "Web Developer"</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
              <CardDescription>Manage your social media links.</CardDescription>
            </CardHeader>
            <Form {...socialForm}>
              <form onSubmit={socialForm.handleSubmit(onSubmitSocial)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={socialForm.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://github.com/username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={socialForm.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://linkedin.com/in/username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={socialForm.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter/X</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://x.com/username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={socialForm.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://instagram.com/username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={socialForm.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://facebook.com/username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Manage your site's search engine optimization settings.</CardDescription>
            </CardHeader>
            <Form {...seoForm}>
              <form onSubmit={seoForm.handleSubmit(onSubmitSeo)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={seoForm.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>The title that appears in search engine results.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={seoForm.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of your site that appears in search engine results.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={seoForm.control}
                    name="ogImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Graph Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormDescription>
                          The image that appears when your site is shared on social media.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={seoForm.control}
                    name="googleAnalyticsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Analytics ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="G-XXXXXXXXXX" value="G-Z5Y0KBTS3B" />
                        </FormControl>
                        <FormDescription>Your Google Analytics measurement ID.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
