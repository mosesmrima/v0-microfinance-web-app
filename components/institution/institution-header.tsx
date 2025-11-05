"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Profile } from "@/lib/types"

interface InstitutionHeaderProps {
  profile: Profile | null
}

export function InstitutionHeader({ profile }: InstitutionHeaderProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/institution" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold text-foreground">FinFlow</span>
            <span className="text-xs font-semibold text-muted-foreground ml-2">Institution</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {profile?.first_name} {profile?.last_name}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
