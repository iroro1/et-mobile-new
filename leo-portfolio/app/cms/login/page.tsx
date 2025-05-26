"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("ojigboleo@gmail.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [detailedError, setDetailedError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(errorParam === "unauthorized" ? "You are not authorized to access the CMS" : errorParam)
    }
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setDetailedError(null)

    try {
      // Call our API route for login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "Login failed")
        if (data.details) {
          setDetailedError(data.details)
          console.error("Login error details:", data.details)
        }
      } else {
        // Successful login
        console.log("Login successful, redirecting to CMS")
        router.push("/cms")
        router.refresh()
      }
    } catch (err: any) {
      console.error("Login request error:", err)
      setError("An unexpected error occurred. Please try again.")
      setDetailedError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">CMS Login</CardTitle>
          <CardDescription>Enter your credentials to access the content management system.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>

              {detailedError && (
                <div className="mt-2 text-xs">
                  <details>
                    <summary>Technical Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(detailedError, null, 2)}</pre>
                  </details>
                </div>
              )}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              If you're having trouble logging in, please make sure you're using the correct password for the
              administrator account (ojigboleo@gmail.com).
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">Only the site administrator can access the CMS.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
