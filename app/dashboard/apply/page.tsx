"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanApplicationWizard } from "@/components/loans/LoanApplicationWizard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ApplyPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

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

  // Check if KYC Stage 1 is completed and verified
  const isKYCStage1Verified = currentUser.kyc_stage1_status === "verified"

  const handleApplicationComplete = (loanId: string) => {
    // Redirect to the application detail page
    router.push(`/dashboard/applications/${loanId}`)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Apply for a Loan</h1>
          <p className="text-muted-foreground mt-2">
            Complete the application process to request a loan
          </p>
        </div>

        {/* KYC Status Alert */}
        {!isKYCStage1Verified && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900 dark:text-red-100">
              KYC Verification Required
            </AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200 space-y-2">
              <p>
                Your identity verification (KYC Stage 1) must be completed and approved before you
                can apply for a loan.
              </p>
              <div className="mt-3">
                {currentUser.kyc_stage1_status === "pending" && (
                  <p className="text-sm">
                    Your documents are currently under review. You'll be notified once they're
                    verified.
                  </p>
                )}
                {currentUser.kyc_stage1_status === "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/auth/kyc-stage1")}
                    className="mt-2"
                  >
                    Re-submit Documents
                  </Button>
                )}
                {!currentUser.kyc_stage1_completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/auth/kyc-stage1")}
                    className="mt-2"
                  >
                    Complete KYC Verification
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success message for verified users */}
        {isKYCStage1Verified && (
          <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Ready to Apply
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your identity has been verified. You can now proceed with your loan application.
            </AlertDescription>
          </Alert>
        )}

        {/* Application Wizard */}
        {isKYCStage1Verified ? (
          <LoanApplicationWizard currentUser={currentUser} onComplete={handleApplicationComplete} />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Application Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              Complete your KYC verification to start applying for loans.
            </p>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
