"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import {
  getPendingLoansForManager,
  getLoans,
  getProfileById,
} from "@/lib/mock-store"
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react"
import { format } from "date-fns"

export default function LoanManagerDashboard() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "finance_director") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "finance_director") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get high-value loans (≥$10K)
  const allHighValueLoans = getLoans().filter((loan) => loan.amount >= 10000)
  const pendingLoans = getPendingLoansForManager()
  const approvedLoans = allHighValueLoans.filter((loan) => loan.status === "approved" || loan.status === "active")
  const rejectedLoans = allHighValueLoans.filter((loan) => loan.status === "rejected")

  // Calculate total values
  const totalPendingValue = pendingLoans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalApprovedValue = approvedLoans.reduce((sum, loan) => sum + loan.amount, 0)

  // Get recent activity
  const recentLoans = allHighValueLoans
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      pending_finance_director: { variant: "default" },
      approved: { variant: "default" },
      rejected: { variant: "destructive" },
      active: { variant: "default" },
      completed: { variant: "secondary" },
    }
    return <Badge variant={config[status]?.variant || "default"}>{status.replace(/_/g, " ")}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Loan Manager Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {currentUser.first_name}! Manage high-value loan applications.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLoans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                High-value loans (≥$10K)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalPendingValue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting your approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvedLoans.filter((loan) => {
                  if (!loan.approved_at) return false
                  const approvedDate = new Date(loan.approved_at)
                  const today = new Date()
                  return (
                    approvedDate.getMonth() === today.getMonth() &&
                    approvedDate.getFullYear() === today.getFullYear()
                  )
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(totalApprovedValue / 1000).toFixed(0)}K total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected This Month</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {rejectedLoans.filter((loan) => {
                  if (!loan.rejected_at) return false
                  const rejectedDate = new Date(loan.rejected_at)
                  const today = new Date()
                  return (
                    rejectedDate.getMonth() === today.getMonth() &&
                    rejectedDate.getFullYear() === today.getFullYear()
                  )
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Applications declined</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-manager/high-value-loans")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Review High-Value Loans
                {pendingLoans.length > 0 && (
                  <Badge className="ml-auto" variant="default">
                    {pendingLoans.length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-manager/approvals")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Approval History
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-manager/approvals")}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent High-Value Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent High-Value Applications</CardTitle>
                <CardDescription>Latest loan applications requiring manager approval</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/loan-manager/high-value-loans")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLoans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent high-value applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLoans.map((loan) => {
                  const borrower = getProfileById(loan.user_id)
                  if (!borrower) return null

                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">${loan.amount.toLocaleString()}</p>
                            {getStatusBadge(loan.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {borrower.first_name} {borrower.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Updated {format(new Date(loan.updated_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/loan-manager/high-value-loans/${loan.id}`)}
                      >
                        Review
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
