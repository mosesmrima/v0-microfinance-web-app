"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import {
  getLoansByUserId,
  getPaymentScheduleByLoanId,
  getLoanById,
} from "@/lib/mock-store"
import { format } from "date-fns"
import {
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowRight,
} from "lucide-react"

export default function PaymentsPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "borrower") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "borrower") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get user's loans and payment schedules
  const userLoans = getLoansByUserId(currentUser.id).filter(
    (loan) => loan.status === "active" || loan.status === "completed"
  )

  // Get all payment schedules for user's loans
  const allSchedules = userLoans.flatMap((loan) =>
    getPaymentScheduleByLoanId(loan.id).map(schedule => ({
      ...schedule,
      loan,
    }))
  )

  const today = new Date()

  // Categorize payments
  const upcomingPayments = allSchedules.filter(
    (s) => s.status === "pending" && new Date(s.due_date) >= today
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const overduePayments = allSchedules.filter(
    (s) => (s.status === "pending" && new Date(s.due_date) < today) || s.status === "overdue"
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const paidPayments = allSchedules.filter((s) => s.status === "paid")
    .sort((a, b) => {
      if (!a.paid_date || !b.paid_date) return 0
      return new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime()
    })

  // Calculate totals
  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + (p.amount_due || 0), 0)
  const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount_due || 0), 0)
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0)

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "default" | "secondary" | "destructive" }> = {
      pending: { icon: Clock, variant: "default" },
      paid: { icon: CheckCircle2, variant: "default" },
      overdue: { icon: AlertCircle, variant: "destructive" },
    }

    const { icon: Icon, variant } = config[status] || { icon: Clock, variant: "default" as const }

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const renderPaymentCard = (scheduleWithLoan: any) => {
    const { loan, ...schedule } = scheduleWithLoan
    const isOverdue = (schedule.status === "pending" || schedule.status === "overdue") &&
      new Date(schedule.due_date) < today

    return (
      <Card key={schedule.id} className={isOverdue ? "border-red-200 dark:border-red-900" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">
                Payment #{schedule.installment_number} of {loan.duration_months}
              </CardTitle>
              <CardDescription>
                Loan: ${loan.amount.toLocaleString()} - {loan.purpose || "Personal Loan"}
              </CardDescription>
            </div>
            {getStatusBadge(schedule.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(schedule.due_date), "MMM dd, yyyy")}
              </p>
              {isOverdue && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {Math.floor((today.getTime() - new Date(schedule.due_date).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                  days overdue
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${schedule.amount_due?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Principal</p>
              <p className="font-medium">${schedule.principal_amount?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Interest</p>
              <p className="font-medium">${schedule.interest_amount?.toFixed(2) || "0.00"}</p>
            </div>
          </div>

          {schedule.paid_date && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <div className="text-sm">
                  <p className="font-medium">
                    Paid on {format(new Date(schedule.paid_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {schedule.status === "pending" && !isOverdue && (
            <Button className="w-full" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          )}

          {isOverdue && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Payment Overdue - Please pay immediately</p>
              </div>
              <Button className="w-full mt-2" variant="destructive" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-2">
            Manage your loan payments and view payment history
          </p>
        </div>

        {userLoans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Loans</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active loans with payment schedules yet.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Browse Loan Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalUpcoming.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {upcomingPayments.length} payment{upcomingPayments.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overduePayments.length} overdue payment{overduePayments.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paidPayments.length} completed payment{paidPayments.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Tabs */}
            <Tabs defaultValue={overduePayments.length > 0 ? "overdue" : "upcoming"} className="space-y-6">
              <TabsList>
                {overduePayments.length > 0 && (
                  <TabsTrigger value="overdue">
                    Overdue
                    <Badge className="ml-2" variant="destructive">
                      {overduePayments.length}
                    </Badge>
                  </TabsTrigger>
                )}
                <TabsTrigger value="upcoming">
                  Upcoming
                  {upcomingPayments.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {upcomingPayments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">
                  Payment History
                  {paidPayments.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {paidPayments.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {overduePayments.length > 0 && (
                <TabsContent value="overdue" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {overduePayments.map((schedule) => renderPaymentCard(schedule))}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingPayments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Upcoming Payments</h3>
                      <p className="text-muted-foreground">
                        You're all caught up! No payments due in the near future.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {upcomingPayments.map((schedule) => renderPaymentCard(schedule))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {paidPayments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Payment History</h3>
                      <p className="text-muted-foreground">
                        Your completed payments will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {paidPayments.slice(0, 20).map((schedule) => renderPaymentCard(schedule))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
