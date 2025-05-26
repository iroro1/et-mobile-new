"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    console.log("Protected route check - Path:", pathname)
    console.log("Loading:", isLoading, "User:", user?.email)

    if (!isLoading) {
      if (!user) {
        console.log("No user, redirecting to login")
        // Only redirect if we're not already on the login page
        if (pathname !== "/cms/login") {
          router.push("/cms/login")
        }
      } else if (user.email !== "ojigboleo@gmail.com") {
        console.log("Unauthorized user, redirecting to login")
        // Sign out unauthorized users
        if (pathname !== "/cms/login") {
          router.push("/cms/login?error=unauthorized")
        }
      } else {
        console.log("User is authorized")
        setIsAuthorized(true)
      }
    }
  }, [user, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    // Return null to prevent flash of content
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking authorization...</p>
      </div>
    )
  }

  return <>{children}</>
}
