"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import {
  getLoanById,
  getProfileById,
  getKYCDocumentsByLoanId,
  getKYCDocumentsByUserId,
  updateLoan,
  createNotification,
} from "@/lib/mock-store"
import { format } from "date-fns"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  DollarSign,
  Calendar,
  Percent,
  AlertCircle,
} from "lucide-react"

export default function HighValueLoanReviewPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string

  const [managerNotes, setManagerNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

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

  const loan = getLoanById(loanId)
  const borrower = loan ? getProfileById(loan.user_id) : null
  const stage2Documents = loan ? getKYCDocumentsByLoanId(loanId) : []
  const stage1Documents = borrower
    ? getKYCDocumentsByUserId(borrower.id).filter((doc) => doc.stage === "stage1")
    : []

  if (!loan || !borrower) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
            <Button onClick={() => router.push("/loan-manager/high-value-loans")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loan.amount < 10000) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Not a High-Value Loan</h2>
            <p className="text-muted-foreground mb-6">
              This loan application is under $10,000 and is handled by Loan Officers.
            </p>
            <Button onClick={() => router.push("/loan-manager/high-value-loans")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to High-Value Loans
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      updateLoan(loanId, {
        status: "approved",
        reviewed_by: currentUser.id,
        approved_by: currentUser.id,
        manager_notes: managerNotes,
        approved_at: new Date().toISOString(),
      })

      createNotification({
        user_id: borrower!.id,
        title: "Loan Application Approved",
        message: `Your high-value loan application for $${loan.amount.toLocaleString()} has been approved by the Loan Manager!`,
        type: "success",
        read: false,
      })

      router.push("/loan-manager/high-value-loans")
    } catch (error) {
      console.error("Error approving loan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      updateLoan(loanId, {
        status: "rejected",
        reviewed_by: currentUser.id,
        manager_notes: managerNotes,
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
      })

      createNotification({
        user_id: borrower!.id,
        title: "Loan Application Rejected",
        message: `Your high-value loan application for $${loan.amount.toLocaleString()} has been rejected. Please review the rejection reason.`,
        type: "error",
        read: false,
      })

      router.push("/loan-manager/high-value-loans")
    } catch (error) {
      console.error("Error rejecting loan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAlreadyReviewed =
    loan.status !== "pending_finance_director" && loan.status !== "under_review"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/loan-manager/high-value-loans")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to High-Value Loans
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  ${loan.amount.toLocaleString()} High-Value Loan
                </CardTitle>
                <CardDescription>
                  Submitted {format(new Date(loan.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">${loan.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{loan.duration_months} months</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{loan.interest_rate}%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly</p>
                      <p className="font-medium">${loan.monthly_payment?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Loan Purpose</h4>
                  <p className="text-sm text-muted-foreground">{loan.purpose || "No purpose provided"}</p>
                </div>

                {loan.officer_notes && (
                  <>
                    <Separator />
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Loan Officer Notes
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{loan.officer_notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {borrower.first_name} {borrower.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{borrower.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{borrower.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KYC Stage 1</p>
                    <Badge variant={borrower.kyc_stage1_status === "verified" ? "default" : "secondary"}>
                      {borrower.kyc_stage1_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manager Review</CardTitle>
                <CardDescription>
                  {isAlreadyReviewed
                    ? "This application has been reviewed"
                    : "Make your decision"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAlreadyReviewed ? (
                  <>
                    <div>
                      <Label htmlFor="manager-notes">Review Notes (Optional)</Label>
                      <Textarea
                        id="manager-notes"
                        placeholder="Add notes about your review..."
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {!showApproveConfirm && !showRejectConfirm ? (
                      <>
                        <Button
                          className="w-full"
                          onClick={() => setShowApproveConfirm(true)}
                          disabled={isSubmitting}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Application
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => setShowRejectConfirm(true)}
                          disabled={isSubmitting}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </>
                    ) : null}

                    {showApproveConfirm && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="space-y-3">
                          <p className="font-medium">Confirm Approval</p>
                          <p className="text-sm">
                            Approve this ${loan.amount.toLocaleString()} high-value loan?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleApprove}
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? "Processing..." : "Yes, Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowApproveConfirm(false)}
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {showRejectConfirm && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="space-y-3">
                          <p className="font-medium">Confirm Rejection</p>
                          <div>
                            <Label htmlFor="rejection-reason" className="text-foreground">
                              Rejection Reason (Required)
                            </Label>
                            <Textarea
                              id="rejection-reason"
                              placeholder="Explain why this application is being rejected..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleReject}
                              disabled={isSubmitting || !rejectionReason.trim()}
                              className="flex-1"
                            >
                              {isSubmitting ? "Processing..." : "Yes, Reject"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowRejectConfirm(false)
                                setRejectionReason("")
                              }}
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This application has already been reviewed.
                      <div className="mt-2">
                        <Badge>{loan.status.replace(/_/g, " ")}</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
