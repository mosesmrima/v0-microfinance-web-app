"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { getLoans, getProfileById } from "@/lib/mock-store"
import { format } from "date-fns"
import { FileText, CheckCircle2, XCircle, Eye } from "lucide-react"

export default function ApprovalsPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "loan_manager") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "loan_manager") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const allHighValueLoans = getLoans().filter((loan) => loan.amount >= 10000)
  const approvedLoans = allHighValueLoans.filter((loan) => loan.status === "approved" || loan.status === "active")
  const rejectedLoans = allHighValueLoans.filter((loan) => loan.status === "rejected")

  // Calculate totals
  const totalApprovedValue = approvedLoans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalRejectedValue = rejectedLoans.reduce((sum, loan) => sum + loan.amount, 0)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Approval History</h1>
          <p className="text-muted-foreground mt-2">
            View your complete loan review history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedLoans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(totalApprovedValue / 1000).toFixed(0)}K total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedLoans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(totalRejectedValue / 1000).toFixed(0)}K total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvedLoans.length + rejectedLoans.length > 0
                  ? Math.round(
                      (approvedLoans.length / (approvedLoans.length + rejectedLoans.length)) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {approvedLoans.length + rejectedLoans.length} total reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Approval History Tabs */}
        <Tabs defaultValue="approved" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approved">
              Approved
              {approvedLoans.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {approvedLoans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              {rejectedLoans.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {rejectedLoans.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="space-y-4">
            {approvedLoans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Approved Loans</h3>
                  <p className="text-muted-foreground">
                    Loans you've approved will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {approvedLoans
                  .sort((a, b) => {
                    if (!a.approved_at || !b.approved_at) return 0
                    return new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime()
                  })
                  .map((loan) => {
                    const borrower = getProfileById(loan.user_id)
                    if (!borrower) return null

                    return (
                      <Card key={loan.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-medium text-lg">
                                  ${loan.amount.toLocaleString()}
                                </p>
                                <Badge variant="default">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {borrower.first_name} {borrower.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Approved on {loan.approved_at && format(new Date(loan.approved_at), "MMMM dd, yyyy")}
                              </p>
                              {loan.manager_notes && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded">
                                  {loan.manager_notes}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/loan-manager/high-value-loans/${loan.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedLoans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Rejected Loans</h3>
                  <p className="text-muted-foreground">
                    Loans you've rejected will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rejectedLoans
                  .sort((a, b) => {
                    if (!a.rejected_at || !b.rejected_at) return 0
                    return new Date(b.rejected_at).getTime() - new Date(a.rejected_at).getTime()
                  })
                  .map((loan) => {
                    const borrower = getProfileById(loan.user_id)
                    if (!borrower) return null

                    return (
                      <Card key={loan.id} className="border-red-200 dark:border-red-900">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-medium text-lg">
                                  ${loan.amount.toLocaleString()}
                                </p>
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejected
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {borrower.first_name} {borrower.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Rejected on {loan.rejected_at && format(new Date(loan.rejected_at), "MMMM dd, yyyy")}
                              </p>
                              {loan.rejection_reason && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                    Reason:
                                  </p>
                                  <p className="text-sm text-red-800 dark:text-red-200">
                                    {loan.rejection_reason}
                                  </p>
                                </div>
                              )}
                              {loan.manager_notes && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded">
                                  {loan.manager_notes}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/loan-manager/high-value-loans/${loan.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
