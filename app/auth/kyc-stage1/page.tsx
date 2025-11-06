"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { KYCStage1Wizard } from "@/components/kyc/KYCStage1Wizard"

export default function KYCStage1Page() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    // Redirect to dashboard if not a borrower
    if (currentUser.role !== "borrower") {
      router.push("/dashboard")
      return
    }

    // Redirect to dashboard if Stage 1 already completed
    if (currentUser.kyc_stage1_completed && currentUser.kyc_stage1_status !== "rejected") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  const handleComplete = () => {
    router.push("/dashboard")
  }

  if (!isAuthenticated || !currentUser || currentUser.role !== "borrower") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your KYC Verification</h1>
          <p className="text-muted-foreground">
            Verify your identity to start applying for loans
          </p>
        </div>

        {/* Wizard */}
        <KYCStage1Wizard onComplete={handleComplete} />
      </div>
    </div>
  )
}
