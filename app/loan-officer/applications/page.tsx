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
import { getPendingLoansForOfficer, getLoans, getProfileById } from "@/lib/mock-store"
import { Loan } from "@/lib/types"
import { FileText, Search, Eye, Clock, Filter } from "lucide-react"
import { format } from "date-fns"

export default function LoanOfficerApplicationsPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed">("all")

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

  // Get all loans under $10K that are in the officer's queue
  const allOfficerLoans = getLoans().filter((loan) => loan.amount < 10000)
  const pendingLoans = getPendingLoansForOfficer()
  const reviewedLoans = allOfficerLoans.filter(
    (loan) =>
      loan.status === "approved" ||
      loan.status === "rejected" ||
      loan.status === "active" ||
      loan.status === "completed"
  )

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      kyc_stage2_required: { label: "Documents Required", variant: "default" },
      submitted: { label: "Submitted", variant: "default" },
      under_review: { label: "Under Review", variant: "default" },
      pending_loan_officer: { label: "Pending Review", variant: "default" },
      approved: { label: "Approved", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      active: { label: "Active", variant: "default" },
      completed: { label: "Completed", variant: "secondary" },
    }
    return (
      <Badge variant={config[status]?.variant || "default"}>
        {config[status]?.label || status}
      </Badge>
    )
  }

  const renderLoanCard = (loan: Loan) => {
    const borrower = getProfileById(loan.user_id)
    if (!borrower) return null

    const matchesSearch =
      searchTerm === "" ||
      borrower.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.amount.toString().includes(searchTerm)

    if (!matchesSearch) return null

    return (
      <Card key={loan.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                ${loan.amount.toLocaleString()} - {loan.duration_months} months
              </CardTitle>
              <CardDescription>
                Applicant: {borrower.first_name} {borrower.last_name}
              </CardDescription>
              <CardDescription className="text-xs mt-1">
                Application ID: {loan.id}
              </CardDescription>
            </div>
            {getStatusBadge(loan.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Loan Amount</p>
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
            <div>
              <p className="text-sm text-muted-foreground">Purpose</p>
              <p className="text-sm line-clamp-2">{loan.purpose}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Submitted {format(new Date(loan.created_at), "MMM dd, yyyy 'at' h:mm a")}
          </div>

          {loan.officer_notes && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Your Notes:
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{loan.officer_notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/loan-officer/applications/${loan.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Review Application
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
          <h1 className="text-3xl font-bold">Loan Applications</h1>
          <p className="text-muted-foreground mt-2">Review and manage loan applications under $10,000</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by applicant name, amount, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review
              {pendingLoans.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {pendingLoans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed
              {reviewedLoans.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {reviewedLoans.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingLoans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
                  <p className="text-muted-foreground">
                    All applications have been reviewed. Check back later for new submissions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingLoans.map((loan) => renderLoanCard(loan))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedLoans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Reviewed Applications</h3>
                  <p className="text-muted-foreground">
                    Applications you've reviewed will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviewedLoans.map((loan) => renderLoanCard(loan))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
