"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Only show the toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Force theme update on mount
  useEffect(() => {
    if (mounted) {
      // Apply the current theme explicitly
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme === "dark" ? "dark" : "light")

      // Log the current theme state
      console.log("Current theme:", theme)
      console.log("HTML classes:", document.documentElement.className)
    }
  }, [mounted, theme])

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-primary/20 bg-secondary/10"
        aria-label="Toggle theme"
      >
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full border-primary/20 bg-secondary/10 hover:bg-primary/20"
      onClick={() => {
        const newTheme = theme === "dark" ? "light" : "dark"
        console.log("Switching theme to:", newTheme)
        setTheme(newTheme)
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
