"use client"

import { Loan, KYCDocument } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatusTimeline } from "./StatusTimeline"
import { format } from "date-fns"
import { FileText, Download, Calendar, DollarSign, Percent, Clock } from "lucide-react"

interface ApplicationDetailProps {
  loan: Loan
  documents: KYCDocument[]
}

export function ApplicationDetail({ loan, documents }: ApplicationDetailProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      draft: { label: "Draft", variant: "secondary" },
      kyc_stage2_required: { label: "Documents Required", variant: "default" },
      submitted: { label: "Submitted", variant: "default" },
      under_review: { label: "Under Review", variant: "default" },
      pending_loan_officer: { label: "Loan Officer Review", variant: "default" },
      pending_md: { label: "Pending MD Approval", variant: "default" },
      pending_finance_director: { label: "Finance Director Review", variant: "default" },
      approved: { label: "Approved", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      disbursed: { label: "Disbursed", variant: "default" },
      completed: { label: "Completed", variant: "secondary" },
      defaulted: { label: "Defaulted", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: status, variant: "default" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      pending: { label: "Pending", variant: "default" },
      verified: { label: "Verified", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: status, variant: "default" as const }
    return <Badge variant={config.variant} className="ml-2">{config.label}</Badge>
  }

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Filter stage 2 documents related to this loan
  const stage2Documents = documents.filter(
    (doc) => doc.stage === "stage2" && doc.loan_application_id === loan.id
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                ${loan.amount.toLocaleString()} Loan Application
              </CardTitle>
              <CardDescription>
                Applied on {format(new Date(loan.created_at), "MMMM dd, yyyy 'at' h:mm a")}
              </CardDescription>
            </div>
            {getStatusBadge(loan.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loan Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-lg font-semibold">${loan.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{loan.duration_months} months</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-lg font-semibold">{loan.interest_rate}% APR</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-lg font-semibold">${loan.monthly_payment?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Loan Purpose */}
          {loan.purpose && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Loan Purpose</p>
                <p className="text-sm text-muted-foreground">{loan.purpose}</p>
              </div>
            </>
          )}

          {/* Rejection Reason */}
          {loan.rejection_reason && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">{loan.rejection_reason}</p>
              </div>
            </>
          )}

          {/* Officer/Manager Notes */}
          {loan.officer_notes && (
            <>
              <Separator />
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Officer Notes
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{loan.officer_notes}</p>
              </div>
            </>
          )}

          {loan.manager_notes && (
            <>
              <Separator />
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Manager Notes
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200">{loan.manager_notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Track your application progress</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusTimeline currentStatus={loan.status} rejectionReason={loan.rejection_reason} />
        </CardContent>
      </Card>

      {/* Submitted Documents (Stage 2) */}
      {stage2Documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>Income verification documents for this application</CardDescription>
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
                        Uploaded on {format(new Date(doc.created_at!), "MMM dd, yyyy")}
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

      {/* Loan Product Info */}
      {loan.loan_product_id && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Product</CardTitle>
            <CardDescription>Details about the loan product you applied for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Type</p>
                <p className="font-medium">
                  {loan.amount < 5000 ? "Small Business Loan" : "Business Expansion Loan"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Threshold</p>
                <p className="font-medium">
                  {loan.amount >= 10000 ? "Requires Manager Approval" : "Officer Approval"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{format(new Date(loan.updated_at), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
