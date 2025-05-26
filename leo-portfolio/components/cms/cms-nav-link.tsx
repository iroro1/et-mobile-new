"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface CmsNavLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}

export function CmsNavLink({ href, icon, children }: CmsNavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/10 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  )
}
