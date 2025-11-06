"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

/**
 * ProtectedRoute component that checks if user is authenticated and has the right role
 * Usage:
 * <ProtectedRoute allowedRoles={["borrower"]}>
 *   <YourComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAuth()
  const router = useRouter()

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

  // Show nothing while checking authentication
  if (!isAuthenticated || !currentUser) {
    return null
  }

  // Check role permission
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role)) {
      return null
    }
  }

  return <>{children}</>
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
