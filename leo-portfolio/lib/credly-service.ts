import { getSupabaseServerClient } from "@/lib/supabase"

export interface CredlyCertification {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiration_date?: string
  description: string
  image_url: string
  url: string
}

export async function getCredlyCertifications(): Promise<CredlyCertification[]> {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.from("certifications").select("*").order("issue_date", { ascending: false })

    if (error) {
      console.error("Error fetching certifications:", error)
      return []
    }

    // If we got data but it's empty, run the scraper to populate the database
    if (!data || data.length === 0) {
      console.log("No certifications found in database, running scraper...")
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/credly-scraper`)
        if (!response.ok) {
          throw new Error(`Failed to run scraper: ${response.statusText}`)
        }

        // Fetch the data again after scraper has run
        const { data: refreshedData, error: refreshError } = await supabase
          .from("certifications")
          .select("*")
          .order("issue_date", { ascending: false })

        if (refreshError) {
          throw refreshError
        }

        return refreshedData || []
      } catch (scraperError) {
        console.error("Error running scraper:", scraperError)
        return []
      }
    }

    return data
  } catch (error) {
    console.error("Error in getCredlyCertifications:", error)
    return []
  }
}
