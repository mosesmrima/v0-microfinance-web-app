"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import {
  getAllPaymentSchedules,
  getLoanById,
  getProfileById,
} from "@/lib/mock-store"
import { PaymentSchedule } from "@/lib/types"
import { format } from "date-fns"
import {
  Calendar,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"

export default function PaymentSchedulesPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

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

  const allSchedules = getAllPaymentSchedules()
  const today = new Date()

  // Filter schedules by status
  const upcomingSchedules = allSchedules.filter(
    (schedule) =>
      schedule.status === "pending" && new Date(schedule.due_date) >= today
  )

  const overdueSchedules = allSchedules.filter(
    (schedule) =>
      (schedule.status === "pending" && new Date(schedule.due_date) < today) ||
      schedule.status === "overdue"
  )

  const paidSchedules = allSchedules.filter((schedule) => schedule.status === "paid")

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "default" | "secondary" | "destructive" }> = {
      pending: { icon: Clock, variant: "default" },
      paid: { icon: CheckCircle2, variant: "default" },
      overdue: { icon: AlertCircle, variant: "destructive" },
      partial: { icon: AlertCircle, variant: "default" },
    }

    const { icon: Icon, variant } = config[status] || {
      icon: Clock,
      variant: "default" as const,
    }

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const renderScheduleCard = (schedule: PaymentSchedule) => {
    const loan = getLoanById(schedule.loan_id)
    const borrower = loan ? getProfileById(loan.user_id) : null

    if (!loan || !borrower) return null

    const matchesSearch =
      searchTerm === "" ||
      borrower.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return null

    const isOverdue =
      (schedule.status === "pending" || schedule.status === "overdue") &&
      new Date(schedule.due_date) < today

    return (
      <Card key={schedule.id} className={isOverdue ? "border-red-200 dark:border-red-900" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {borrower.first_name} {borrower.last_name}
              </CardTitle>
              <CardDescription>
                Loan #{loan.id.slice(0, 8)} - Installment #{schedule.installment_number}
              </CardDescription>
            </div>
            {getStatusBadge(schedule.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <div>
              <p className="text-sm text-muted-foreground">Principal</p>
              <p className="font-medium">${schedule.principal_amount?.toFixed(2) || "0.00"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Interest</p>
              <p className="font-medium">${schedule.interest_amount?.toFixed(2) || "0.00"}</p>
            </div>
          </div>

          {schedule.paid_date && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">
                    Paid on {format(new Date(schedule.paid_date), "MMM dd, yyyy")}
                  </p>
                  {schedule.amount_paid && (
                    <p className="text-xs">Amount: ${schedule.amount_paid?.toFixed(2) || "0.00"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isOverdue && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Payment Overdue - Contact Borrower</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/loan-officer/applications/${loan.id}`)}
            >
              View Loan Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payment Schedules</h1>
          <p className="text-muted-foreground mt-2">
            Monitor borrower payment schedules and track overdue payments
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueSchedules.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSchedules.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled for this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {paidSchedules.filter((s) => {
                  if (!s.paid_date) return false
                  const paidDate = new Date(s.paid_date)
                  return (
                    paidDate.getMonth() === today.getMonth() &&
                    paidDate.getFullYear() === today.getFullYear()
                  )
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">On-time payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by borrower name or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedules Tabs */}
        <Tabs defaultValue="overdue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overdue">
              Overdue
              {overdueSchedules.length > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {overdueSchedules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingSchedules.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {upcomingSchedules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid
              {paidSchedules.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {paidSchedules.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="space-y-4">
            {overdueSchedules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Overdue Payments</h3>
                  <p className="text-muted-foreground">
                    All payments are up to date. Great work!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {overdueSchedules.map((schedule) => renderScheduleCard(schedule))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSchedules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Payments</h3>
                  <p className="text-muted-foreground">
                    No payments scheduled for the near future.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingSchedules
                  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                  .map((schedule) => renderScheduleCard(schedule))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paidSchedules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Paid Payments</h3>
                  <p className="text-muted-foreground">
                    Paid payments will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {paidSchedules
                  .sort((a, b) => {
                    if (!a.paid_date || !b.paid_date) return 0
                    return new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime()
                  })
                  .slice(0, 20)
                  .map((schedule) => renderScheduleCard(schedule))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
