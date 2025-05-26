"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/cms/protected-route"

const totpFormSchema = z.object({
  code: z.string().min(6, { message: "Verification code must be at least 6 characters" }),
})

type TotpFormValues = z.infer<typeof totpFormSchema>

export default function MfaSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [isMfaEnabled, setIsMfaEnabled] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  const form = useForm<TotpFormValues>({
    resolver: zodResolver(totpFormSchema),
    defaultValues: {
      code: "",
    },
  })

  useEffect(() => {
    async function checkMfaStatus() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (error) throw error

        setIsMfaEnabled(data.currentLevel === "aal2")
      } catch (error) {
        console.error("Error checking MFA status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkMfaStatus()
  }, [supabase])

  async function setupMfa() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      })

      if (error) throw error

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setIsVerifying(true)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error setting up MFA",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyTotp(values: TotpFormValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.mfa.challenge({
        factorId: "totp",
      })

      if (error) throw error

      const { data, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: "totp",
        code: values.code,
      })

      if (verifyError) throw verifyError

      setIsMfaEnabled(true)
      setIsVerifying(false)

      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function disableMfa() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.unenroll({
        factorId: "totp",
      })

      if (error) throw error

      setIsMfaEnabled(false)

      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error disabling MFA",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div>
        <h1 className="mb-6 text-3xl font-bold">Multi-Factor Authentication</h1>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Enhance your account security by enabling two-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isMfaEnabled ? (
              <div className="space-y-4">
                <Alert className="border-green-500 bg-green-500/10">
                  <Shield className="h-4 w-4 text-green-500" />
                  <AlertTitle>MFA is enabled</AlertTitle>
                  <AlertDescription>Your account is protected with two-factor authentication.</AlertDescription>
                </Alert>

                <p className="text-muted-foreground">
                  You will be required to enter a verification code from your authenticator app when signing in.
                </p>
              </div>
            ) : isVerifying ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-md border p-2">
                    {qrCode && <div dangerouslySetInnerHTML={{ __html: qrCode }} />}
                  </div>

                  {secret && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        If you can't scan the QR code, enter this code manually:
                      </p>
                      <code className="mt-1 block rounded-md bg-secondary/20 p-2 text-sm">{secret}</code>
                    </div>
                  )}
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(verifyTotp)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the 6-digit code" {...field} autoComplete="one-time-code" />
                          </FormControl>
                          <FormDescription>Enter the verification code from your authenticator app.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVerifying(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need
                  to provide a verification code from your authenticator app in addition to your password when signing
                  in.
                </p>

                <div className="flex items-center space-x-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Protect your account</h3>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {isMfaEnabled ? (
              <Button variant="destructive" onClick={disableMfa} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable MFA"
                )}
              </Button>
            ) : !isVerifying ? (
              <Button onClick={setupMfa} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Set Up MFA"
                )}
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
