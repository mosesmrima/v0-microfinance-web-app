"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoansOverview } from "@/components/dashboard/loans-overview"
import { LoanProducts } from "@/components/dashboard/loan-products"
import { UserProfile } from "@/components/dashboard/user-profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getLoansByUserId, getLoanProducts } from "@/lib/mock-store"
import { mockLoans } from "@/lib/mock-data"
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"

export default function DashboardPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    // Redirect non-borrowers to their appropriate dashboards
    if (currentUser.role === "loan_officer") {
      router.push("/loan-officer")
      return
    }
    if (currentUser.role === "md") {
      router.push("/md")
      return
    }
    if (currentUser.role === "finance_director") {
      router.push("/finance-director")
      return
    }
    if (currentUser.role === "admin") {
      router.push("/admin")
      return
    }

    // Redirect to KYC Stage 1 if not completed
    if (!currentUser.kyc_stage1_completed) {
      router.push("/auth/kyc-stage1")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get user's loans
  const userLoans = getLoansByUserId(currentUser.id)
  const loanProducts = getLoanProducts()

  // Determine KYC status banner
  const renderKYCBanner = () => {
    // Stage 1 pending
    if (currentUser.kyc_stage1_status === "pending") {
      return (
        <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">KYC Verification Pending</AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Your identity documents are under review. You'll be notified within 1-2 business days. You can browse loan products but cannot apply yet.
          </AlertDescription>
        </Alert>
      )
    }

    // Stage 1 rejected
    if (currentUser.kyc_stage1_status === "rejected") {
      return (
        <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900 dark:text-red-100">KYC Verification Rejected</AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-200 space-y-2">
            <p>Your identity documents were rejected. Please re-submit with valid documents.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/auth/kyc-stage1")}
              className="mt-2"
            >
              Re-submit Documents
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    // Stage 1 verified
    if (currentUser.kyc_stage1_status === "verified") {
      return (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">KYC Verified</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your identity has been verified! You can now browse and apply for loans.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {currentUser.first_name}!
          </p>
        </div>

        <div className="grid gap-8">
          {/* KYC Status Banner */}
          {renderKYCBanner()}

          {/* User Profile Section */}
          <UserProfile profile={currentUser} />

          {/* Loans Overview */}
          <LoansOverview loans={userLoans} />

          {/* Available Loan Products */}
          <LoanProducts
            products={loanProducts}
            kycVerified={currentUser.kyc_stage1_status === "verified"}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
