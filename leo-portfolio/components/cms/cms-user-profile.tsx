"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function CmsUserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-3 rounded-md border border-secondary/20 bg-secondary/5 p-3">
      <Avatar>
        <AvatarImage src="/images/leo.jpeg" alt="Leo Ojigbo" />
        <AvatarFallback>LO</AvatarFallback>
      </Avatar>
      <div className="overflow-hidden">
        <p className="truncate text-sm font-medium">Leo Ojigbo</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}
