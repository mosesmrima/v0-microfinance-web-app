"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import {
  getPendingLoansForOfficer,
  getPendingKYCDocuments,
  getAllPaymentSchedules,
  getLoans,
} from "@/lib/mock-store"
import {
  FileText,
  ClipboardCheck,
  Calendar,
  AlertCircle,
  ArrowRight,
  Eye,
  Flag,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function LoanOfficerDashboard() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "loan_officer") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "loan_officer") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get data for dashboard
  const pendingLoans = getPendingLoansForOfficer()
  const pendingKYC = getPendingKYCDocuments()
  const allPaymentSchedules = getAllPaymentSchedules()
  const allLoans = getLoans()

  // Calculate stats for Tier 1 review
  const awaitingReview = pendingLoans.length
  const pendingKYCVerifications = pendingKYC.filter((doc) => doc.stage === "stage2").length
  const overduePayments = allPaymentSchedules.filter(
    (schedule) =>
      schedule.status === "overdue" ||
      (schedule.status === "pending" && new Date(schedule.due_date) < new Date())
  ).length

  // Get recent applications for review
  const recentApplications = allLoans
    .filter((loan) => loan.status === "pending_loan_officer" || loan.status === "under_review")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      pending_loan_officer: { variant: "default" },
      under_review: { variant: "default" },
      pending_md: { variant: "secondary" },
      approved: { variant: "default" },
      rejected: { variant: "destructive" },
    }
    return <Badge variant={config[status]?.variant || "default"}>{status.replace(/_/g, " ")}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Loan Officer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Tier 1 Reviewer - {currentUser.first_name} {currentUser.last_name}
          </p>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <AlertCircle className="inline h-4 w-4 mr-2" />
              You have read-only review access. Escalate applications to MD for approval decisions.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{awaitingReview}</div>
              <p className="text-xs text-muted-foreground">Applications to review</p>
              <Link href="/loan-officer/applications">
                <Button variant="link" className="mt-2 px-0 h-auto">
                  Review Now <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KYC Verifications</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingKYCVerifications}</div>
              <p className="text-xs text-muted-foreground">Stage 2 documents pending</p>
              <Link href="/loan-officer/kyc-review">
                <Button variant="link" className="mt-2 px-0 h-auto">
                  Review KYC <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overduePayments}</div>
              <p className="text-xs text-muted-foreground">Payments past due</p>
              <Link href="/loan-officer/payment-schedules">
                <Button variant="link" className="mt-2 px-0 h-auto">
                  View Schedules <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications for Review</CardTitle>
            <CardDescription>Applications awaiting tier 1 review</CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No applications awaiting review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">
                          ${loan.amount.toLocaleString()} - {loan.purpose || "General Loan"}
                        </h3>
                        {getStatusBadge(loan.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {loan.duration_months} months at {loan.interest_rate}% interest
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {format(new Date(loan.submitted_at || loan.created_at), "PPp")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/loan-officer/applications/${loan.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <Flag className="h-5 w-5" />
              Tier 1 Reviewer Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
            <p>• <strong>Review:</strong> Check application completeness and KYC documentation</p>
            <p>• <strong>Flag Issues:</strong> Note any concerns or missing information</p>
            <p>• <strong>Escalate:</strong> Forward applications to MD for approval decisions</p>
            <p>• <strong>No Approval Authority:</strong> You cannot approve or reject loan applications</p>
            <p>• <strong>Monitor:</strong> Track payment schedules for potential issues</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
