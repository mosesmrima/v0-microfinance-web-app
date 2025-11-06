"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/types"

/**
 * Redirects users to their role-specific dashboard
 * Use this component when user lands on /dashboard
 * but should be redirected based on their role
 */
export function RoleBasedRedirect() {
  const { isAuthenticated, currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    // Redirect to role-specific dashboard
    const dashboardRoute = getRoleDashboard(currentUser.role)
    router.push(dashboardRoute)
  }, [isAuthenticated, currentUser, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

/**
 * Get default dashboard route for each role
 */
function getRoleDashboard(role: UserRole): string {
  const dashboards: Record<UserRole, string> = {
    borrower: "/dashboard",
    loan_officer: "/loan-officer",
    loan_manager: "/loan-manager",
    admin: "/admin",
  }

  return dashboards[role]
}
