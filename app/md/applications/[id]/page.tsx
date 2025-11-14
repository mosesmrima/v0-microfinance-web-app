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
  Download,
} from "lucide-react"

export default function LoanOfficerApplicationReviewPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string

  const [officerNotes, setOfficerNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

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
            <Button onClick={() => router.push("/loan-officer/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Check if loan is under $10K (officer's jurisdiction)
  if (loan.amount >= 10000) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Outside Your Jurisdiction</h2>
            <p className="text-muted-foreground mb-6">
              This loan application is $10,000 or more and requires Loan Manager approval.
            </p>
            <Button onClick={() => router.push("/loan-officer/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update loan status
      updateLoan(loanId, {
        status: "approved",
        assigned_to: currentUser.id,
        reviewed_by: currentUser.id,
        approved_by: currentUser.id,
        officer_notes: officerNotes,
        approved_at: new Date().toISOString(),
      })

      // Create notification for borrower
      createNotification({
        user_id: borrower!.id,
        title: "Loan Application Approved",
        message: `Your loan application for $${loan.amount.toLocaleString()} has been approved!`,
        type: "success",
        read: false,
      })

      router.push("/loan-officer/applications")
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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update loan status
      updateLoan(loanId, {
        status: "rejected",
        assigned_to: currentUser.id,
        reviewed_by: currentUser.id,
        officer_notes: officerNotes,
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
      })

      // Create notification for borrower
      createNotification({
        user_id: borrower!.id,
        title: "Loan Application Rejected",
        message: `Your loan application for $${loan.amount.toLocaleString()} has been rejected. Please review the rejection reason.`,
        type: "error",
        read: false,
      })

      router.push("/loan-officer/applications")
    } catch (error) {
      console.error("Error rejecting loan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getDocumentStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      pending: { variant: "default" },
      verified: { variant: "default" },
      rejected: { variant: "destructive" },
    }
    return <Badge variant={config[status]?.variant || "default"}>{status}</Badge>
  }

  const isAlreadyReviewed = loan.status !== "pending_md" && loan.status !== "under_review"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/loan-officer/applications")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  ${loan.amount.toLocaleString()} Loan Application
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
              </CardContent>
            </Card>

            {/* Borrower Information */}
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
                    {getDocumentStatusBadge(borrower.kyc_stage1_status)}
                  </div>
                </div>

                {stage1Documents.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Identity Documents (Stage 1)</h4>
                      <div className="space-y-2">
                        {stage1Documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{formatDocumentType(doc.document_type)}</p>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded {format(new Date(doc.uploaded_at!), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                            {getDocumentStatusBadge(doc.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Income Documents (Stage 2) */}
            {stage2Documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Income Verification Documents (Stage 2)
                  </CardTitle>
                  <CardDescription>Documents submitted for this application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stage2Documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{formatDocumentType(doc.document_type)}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {format(new Date(doc.uploaded_at!), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getDocumentStatusBadge(doc.status)}
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Review Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
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
                      <Label htmlFor="officer-notes">Review Notes (Optional)</Label>
                      <Textarea
                        id="officer-notes"
                        placeholder="Add notes about your review..."
                        value={officerNotes}
                        onChange={(e) => setOfficerNotes(e.target.value)}
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
                            Are you sure you want to approve this ${loan.amount.toLocaleString()}{" "}
                            loan application?
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

                {loan.officer_notes && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-medium mb-1">Previous Notes:</p>
                    <p className="text-sm">{loan.officer_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
