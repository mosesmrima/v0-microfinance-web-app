"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApplicationDetail } from "@/components/loans/ApplicationDetail"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getLoanById, getKYCDocumentsByLoanId } from "@/lib/mock-store"
import { ArrowLeft } from "lucide-react"

export default function ApplicationDetailPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get loan details
  const loan = getLoanById(loanId)

  if (!loan) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The loan application you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push("/dashboard/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Verify that the loan belongs to the current user
  if (loan.user_id !== currentUser.id) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to view this application.
            </p>
            <Button onClick={() => router.push("/dashboard/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Get KYC documents for this loan (Stage 2)
  const documents = getKYCDocumentsByLoanId(loanId)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/applications")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>

        {/* Application detail */}
        <ApplicationDetail loan={loan} documents={documents} />
      </div>
    </DashboardLayout>
  )
}
