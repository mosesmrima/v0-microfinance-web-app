"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/types"

/**
 * Hook that enforces authentication and optionally role-based access
 * Usage in a component:
 *
 * const user = useRequireAuth({ allowedRoles: ["borrower"] })
 *
 * Returns the current user if authenticated and authorized, otherwise redirects
 */
export function useRequireAuth(options?: {
  allowedRoles?: UserRole[]
  redirectTo?: string
}) {
  const { isAuthenticated, currentUser } = useAuth()
  const router = useRouter()
  const { allowedRoles, redirectTo = "/auth/login" } = options || {}

  useEffect(() => {
    // Not authenticated, redirect to login
    if (!isAuthenticated || !currentUser) {
      router.push(redirectTo)
      return
    }

    // Check if user has required role
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(currentUser.role)) {
        // User doesn't have required role, redirect to their appropriate dashboard
        router.push(getRoleDashboard(currentUser.role))
      }
    }
  }, [isAuthenticated, currentUser, allowedRoles, redirectTo, router])

  return currentUser
}

/**
 * Get default dashboard route for each role
 */
function getRoleDashboard(role: UserRole): string {
  const dashboards: Record<UserRole, string> = {
    borrower: "/dashboard",
    loan_officer: "/loan-officer",
    md: "/md",
    finance_director: "/finance-director",
    admin: "/admin",
  }

  return dashboards[role]
}
