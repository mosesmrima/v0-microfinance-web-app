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
  getPendingFraudAlerts,
  getAllPaymentSchedules,
  getLoans,
} from "@/lib/mock-store"
import {
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { format } from "date-fns"

export default function LoanOfficerDashboard() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "md") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "md") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get data for dashboard
  const pendingLoans = getPendingLoansForOfficer()
  const pendingKYC = getPendingKYCDocuments()
  const pendingFraudAlerts = getPendingFraudAlerts()
  const allPaymentSchedules = getAllPaymentSchedules()
  const allLoans = getLoans()

  // Calculate stats
  const totalPendingApplications = pendingLoans.length
  const pendingKYCVerifications = pendingKYC.filter((doc) => doc.stage === "stage2").length
  const activeFraudAlerts = pendingFraudAlerts.length
  const overduePayments = allPaymentSchedules.filter(
    (schedule) =>
      schedule.status === "overdue" ||
      (schedule.status === "pending" && new Date(schedule.due_date) < new Date())
  ).length

  // Get recent activity
  const recentLoans = allLoans
    .filter((loan) => loan.amount < 10000)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      pending_md: { variant: "default" },
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
          <h1 className="text-3xl font-bold">Loan Officer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {currentUser.first_name}! Here's your overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Loans under $10K requiring review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingKYCVerifications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documents awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeFraudAlerts}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overduePayments}</div>
              <p className="text-xs text-muted-foreground mt-1">Payments past due date</p>
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
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-officer/applications")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Review Applications
                {totalPendingApplications > 0 && (
                  <Badge className="ml-auto" variant="default">
                    {totalPendingApplications}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-officer/kyc-review")}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                KYC Review
                {pendingKYCVerifications > 0 && (
                  <Badge className="ml-auto" variant="default">
                    {pendingKYCVerifications}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-officer/fraud-alerts")}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Fraud Alerts
                {activeFraudAlerts > 0 && (
                  <Badge className="ml-auto" variant="destructive">
                    {activeFraudAlerts}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/loan-officer/payment-schedules")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Payment Schedules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest loan applications in your queue</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/loan-officer/applications")}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLoans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLoans.map((loan) => (
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
                          {loan.purpose || "No purpose specified"}
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
                      onClick={() => router.push(`/loan-officer/applications/${loan.id}`)}
                    >
                      Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
