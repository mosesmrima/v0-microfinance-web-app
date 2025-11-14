"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getLoans, getProfiles, getSystemAnalytics, getPayments } from "@/lib/mock-store"
import { Users, DollarSign, TrendingUp, Activity, ArrowRight } from "lucide-react"

export default function AdminDashboard() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const allLoans = getLoans()
  const allUsers = getProfiles()
  const allPayments = getPayments()
  const analytics = getSystemAnalytics()

  // Calculate metrics
  const totalUsers = allUsers.length
  const totalBorrowers = allUsers.filter((u) => u.role === "borrower").length
  const activeLoans = allLoans.filter((l) => l.status === "active").length
  const totalDisbursed = allLoans
    .filter((l) => l.status === "active" || l.status === "completed")
    .reduce((sum, loan) => sum + loan.amount, 0)
  const totalPaid = allPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pendingApplications = allLoans.filter(
    (l) => l.status === "pending_md" || l.status === "pending_finance_director"
  ).length

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {currentUser.first_name}! Monitor system-wide metrics.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">{totalBorrowers} borrowers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalDisbursed / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Across all loans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(totalPaid / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalDisbursed > 0 ? Math.round((totalPaid / totalDisbursed) * 100) : 0}% collection rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access system management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/admin/users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/admin/system")}
              >
                <Activity className="h-4 w-4 mr-2" />
                System Health
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push("/admin")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Loan Status Distribution</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/users")}
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { status: "Active", count: allLoans.filter((l) => l.status === "active").length },
                { status: "Pending", count: pendingApplications },
                {
                  status: "Completed",
                  count: allLoans.filter((l) => l.status === "completed").length,
                },
                {
                  status: "Rejected",
                  count: allLoans.filter((l) => l.status === "rejected").length,
                },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.status}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${allLoans.length > 0 ? (item.count / allLoans.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { role: "Borrowers", count: allUsers.filter((u) => u.role === "borrower").length },
                {
                  role: "Loan Officers (Tier 1)",
                  count: allUsers.filter((u) => u.role === "loan_officer").length,
                },
                {
                  role: "Managing Directors (Tier 2)",
                  count: allUsers.filter((u) => u.role === "md").length,
                },
                {
                  role: "Finance Directors (Tier 3)",
                  count: allUsers.filter((u) => u.role === "finance_director").length,
                },
                { role: "Admins", count: allUsers.filter((u) => u.role === "admin").length },
              ].map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.role}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${totalUsers > 0 ? (item.count / totalUsers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {allLoans.length > 0
                    ? Math.round(
                        (allLoans.filter((l) => l.status === "approved" || l.status === "active")
                          .length /
                          allLoans.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Loan Size</p>
                <p className="text-2xl font-bold">
                  ${allLoans.length > 0 ? Math.round(totalDisbursed / allLoans.length).toLocaleString() : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Default Rate</p>
                <p className="text-2xl font-bold">
                  {allLoans.length > 0
                    ? Math.round(
                        (allLoans.filter((l) => l.status === "defaulted").length / allLoans.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Loans</p>
                <p className="text-2xl font-bold">{allLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
