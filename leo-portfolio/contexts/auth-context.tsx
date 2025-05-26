"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    console.log("Auth provider mounted")

    async function getSession() {
      console.log("Getting session")
      try {
        const { data, error } = await supabase.auth.getSession()
        console.log("Session data:", data)

        if (error) {
          console.error("Error getting session:", error)
        } else if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
          console.log("User set:", data.session.user)
        } else {
          console.log("No session found")
        }
      } catch (err) {
        console.error("Unexpected error getting session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    console.log("Signing in with:", email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in result:", data, error)

      if (!error && data.user) {
        setUser(data.user)
        setSession(data.session)
      }

      return { error }
    } catch (err) {
      console.error("Unexpected error during sign in:", err)
      return { error: err }
    }
  }

  const signOut = async () => {
    console.log("Signing out")
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    router.push("/cms/login")
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
