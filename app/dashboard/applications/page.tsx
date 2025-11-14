"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getLoansByUserId } from "@/lib/mock-store"
import { Loan, LoanStatus } from "@/lib/types"
import { format } from "date-fns"
import { Eye, FileText } from "lucide-react"

export default function ApplicationsPage() {
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

  const applications = getLoansByUserId(currentUser.id)

  const getStatusBadge = (status: LoanStatus) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      kyc_stage2_required: { label: "Documents Required", variant: "default" as const },
      submitted: { label: "Submitted", variant: "default" as const },
      under_review: { label: "Under Review", variant: "default" as const },
      pending_loan_officer: { label: "Loan Officer Review", variant: "default" as const },
      pending_md: { label: "Pending MD Approval", variant: "default" as const },
      pending_finance_director: { label: "Finance Director Review", variant: "default" as const },
      approved: { label: "Approved", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
      disbursed: { label: "Disbursed", variant: "default" as const },
      completed: { label: "Completed", variant: "secondary" as const },
      defaulted: { label: "Defaulted", variant: "destructive" as const },
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-2">Track your loan applications</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't applied for any loans yet.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Browse Loan Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((loan) => (
              <Card key={loan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        ${loan.amount.toLocaleString()} Loan
                      </CardTitle>
                      <CardDescription>
                        Applied on {format(new Date(loan.created_at), "MMM dd, yyyy")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">${loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{loan.duration_months} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="font-medium">${loan.monthly_payment?.toFixed(2)}</p>
                    </div>
                  </div>

                  {loan.purpose && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="text-sm">{loan.purpose}</p>
                    </div>
                  )}

                  {loan.rejection_reason && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {loan.rejection_reason}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/applications/${loan.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
