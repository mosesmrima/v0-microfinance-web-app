"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import {
  getFraudAlerts,
  getLoanById,
  getProfileById,
  updateFraudAlert,
  createNotification,
} from "@/lib/mock-store"
import { FraudDetection } from "@/lib/types"
import { format } from "date-fns"
import { AlertTriangle, Eye, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react"

export default function FraudAlertsPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedAlert, setSelectedAlert] = useState<FraudDetection | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const allFraudAlerts = getFraudAlerts()
  const pendingAlerts = allFraudAlerts.filter((alert) => !alert.reviewed_at)
  const reviewedAlerts = allFraudAlerts.filter((alert) => alert.reviewed_at)

  const handleResolve = async (action: "approved" | "rejected" | "manual_review") => {
    if (!selectedAlert) return
    if (!resolutionNotes.trim() && action !== "approved") {
      alert("Please provide resolution notes")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update fraud alert
      updateFraudAlert(selectedAlert.id, {
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser.id,
        action: action,
        resolution_notes: resolutionNotes || "Approved after review",
      })

      // Get loan and borrower info for notification
      const loan = getLoanById(selectedAlert.loan_id)
      if (loan) {
        const title =
          action === "approved"
            ? "Fraud Alert Cleared"
            : action === "rejected"
              ? "Application Flagged as Fraudulent"
              : "Additional Review Required"

        const message =
          action === "approved"
            ? "The fraud alert on your loan application has been cleared and your application is proceeding."
            : action === "rejected"
              ? "Your loan application has been flagged as potentially fraudulent and cannot proceed."
              : "Your loan application requires additional manual review due to fraud concerns."

        createNotification({
          user_id: loan.user_id,
          title: title,
          message: message,
          type: action === "rejected" ? "error" : "info",
          read: false,
        })
      }

      setSelectedAlert(null)
      setResolutionNotes("")
    } catch (error) {
      console.error("Error resolving fraud alert:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRiskLevelBadge = (level: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      low: { variant: "secondary" },
      medium: { variant: "default" },
      high: { variant: "destructive" },
      critical: { variant: "destructive" },
    }
    return <Badge variant={config[level]?.variant || "default"}>{level.toUpperCase()}</Badge>
  }

  const renderAlertCard = (alert: FraudDetection) => {
    const loan = getLoanById(alert.loan_id)
    const borrower = loan ? getProfileById(loan.user_id) : null

    if (!loan || !borrower) return null

    return (
      <Card
        key={alert.id}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedAlert(alert)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Fraud Alert #{alert.id.slice(0, 8)}
              </CardTitle>
              <CardDescription>
                {borrower.first_name} {borrower.last_name} - ${loan.amount.toLocaleString()} loan
              </CardDescription>
            </div>
            {getRiskLevelBadge(alert.risk_level)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Risk Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    alert.risk_score >= 75
                      ? "bg-red-500"
                      : alert.risk_score >= 50
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }`}
                  style={{ width: `${alert.risk_score}%` }}
                />
              </div>
              <span className="text-sm font-medium">{alert.risk_score}/100</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Flags Detected</p>
            <div className="flex flex-wrap gap-1">
              {alert.flags.slice(0, 3).map((flag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {flag}
                </Badge>
              ))}
              {alert.flags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{alert.flags.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Flagged {format(new Date(alert.flagged_at), "MMM dd, yyyy 'at' h:mm a")}
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
            <Eye className="h-4 w-4 mr-2" />
            Review Alert
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Fraud Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Review and investigate flagged loan applications
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Alerts */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Pending Review
                {pendingAlerts.length > 0 && (
                  <Badge className="ml-2" variant="destructive">
                    {pendingAlerts.length}
                  </Badge>
                )}
              </h2>

              {pendingAlerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Pending Fraud Alerts</h3>
                    <p className="text-muted-foreground">
                      All fraud alerts have been reviewed. Great work!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingAlerts.map((alert) => renderAlertCard(alert))}
                </div>
              )}
            </div>

            {/* Reviewed Alerts */}
            {reviewedAlerts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recently Reviewed</h2>
                <div className="space-y-3">
                  {reviewedAlerts.slice(0, 5).map((alert) => {
                    const loan = getLoanById(alert.loan_id)
                    const borrower = loan ? getProfileById(loan.user_id) : null
                    if (!loan || !borrower) return null

                    return (
                      <Card key={alert.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">
                                  {borrower.first_name} {borrower.last_name}
                                </p>
                                {getRiskLevelBadge(alert.risk_level)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                ${loan.amount.toLocaleString()} - {alert.action?.replace(/_/g, " ")}
                              </p>
                            </div>
                            <Badge variant={alert.action === "approved" ? "default" : "secondary"}>
                              {alert.action?.replace(/_/g, " ").toUpperCase()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Review Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Alert Review</CardTitle>
                <CardDescription>
                  {selectedAlert ? "Investigate and resolve alert" : "Select an alert to review"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAlert ? (
                  <>
                    {/* Alert Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Risk Level</p>
                        {getRiskLevelBadge(selectedAlert.risk_level)}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Risk Score</p>
                        <p className="text-2xl font-bold">{selectedAlert.risk_score}/100</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Flags Detected</p>
                        <div className="space-y-1">
                          {selectedAlert.flags.map((flag, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                              <p className="text-sm">{flag}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(() => {
                        const loan = getLoanById(selectedAlert.loan_id)
                        const borrower = loan ? getProfileById(loan.user_id) : null
                        if (!loan || !borrower) return null

                        return (
                          <div>
                            <p className="text-sm font-medium mb-1">Applicant</p>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">
                                {borrower.first_name} {borrower.last_name}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Loan Amount: ${loan.amount.toLocaleString()}
                            </p>
                          </div>
                        )
                      })()}
                    </div>

                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Carefully investigate all flags before making a decision. Document your findings
                        in the resolution notes.
                      </AlertDescription>
                    </Alert>

                    {/* Resolution Form */}
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <Label htmlFor="resolution-notes">Resolution Notes</Label>
                        <Textarea
                          id="resolution-notes"
                          placeholder="Document your investigation and decision rationale..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => handleResolve("approved")}
                          disabled={isSubmitting}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Processing..." : "Clear Alert - Approve"}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleResolve("manual_review")}
                          disabled={isSubmitting || !resolutionNotes.trim()}
                        >
                          Requires Manual Review
                        </Button>

                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleResolve("rejected")}
                          disabled={isSubmitting || !resolutionNotes.trim()}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject as Fraudulent
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Select an alert from the list to review</p>
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
