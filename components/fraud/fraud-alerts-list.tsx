"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2, AlertCircle, Eye } from "lucide-react"
import type { FraudDetection } from "@/lib/types"

interface FraudAlertsListProps {
  records: (FraudDetection & {
    loans?: { amount: number; duration_months: number; interest_rate: number }
    profiles?: { first_name: string; last_name: string; email: string }
  })[]
}

export function FraudAlertsList({ records }: FraudAlertsListProps) {
  const [selectedRecord, setSelectedRecord] = useState<(typeof records)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [action, setAction] = useState<"approved" | "rejected" | "manual_review">()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const riskConfig = {
    low: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    medium: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
    high: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  }

  const handleReview = async () => {
    if (!selectedRecord || !action) return

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSuccess(true)
      setTimeout(() => {
        setIsDialogOpen(false)
        setSelectedRecord(null)
        setAction(undefined)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const pendingRecords = records.filter((r) => !r.reviewed_at)
  const reviewedRecords = records.filter((r) => r.reviewed_at)

  return (
    <div className="space-y-8">
      {/* Pending Review */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRecords.length === 0 ? (
            <p className="text-muted-foreground">No pending fraud alerts.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Loan Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Risk Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Risk Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Flags</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record) => {
                    const config = riskConfig[record.risk_level as keyof typeof riskConfig]
                    const RiskIcon = config.icon

                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-card/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {record.profiles?.first_name} {record.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{record.profiles?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">${record.loans?.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{record.risk_score.toFixed(1)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <RiskIcon className="h-4 w-4" />
                            <Badge className={config.color}>
                              {record.risk_level.charAt(0).toUpperCase() + record.risk_level.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {record.flags.slice(0, 2).map((flag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {flag}
                              </Badge>
                            ))}
                            {record.flags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{record.flags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(record)
                              setIsDialogOpen(true)
                            }}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review History */}
      {reviewedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Risk Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Action Taken</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedRecords.map((record) => {
                    const config = riskConfig[record.risk_level as keyof typeof riskConfig]
                    const RiskIcon = config.icon
                    const actionConfig = {
                      approved: { label: "Approved", color: "bg-green-100 text-green-800" },
                      rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
                      manual_review: { label: "Manual Review", color: "bg-blue-100 text-blue-800" },
                    }
                    const actionLabel = actionConfig[record.action as keyof typeof actionConfig]

                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-card/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {record.profiles?.first_name} {record.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{record.profiles?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <RiskIcon className="h-4 w-4" />
                            <Badge className={config.color}>
                              {record.risk_level.charAt(0).toUpperCase() + record.risk_level.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={actionLabel?.color}>{actionLabel?.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {record.reviewed_at ? new Date(record.reviewed_at).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Fraud Alert</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-semibold text-foreground">
                    {selectedRecord.profiles?.first_name} {selectedRecord.profiles?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.profiles?.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="font-semibold text-foreground">${selectedRecord.loans?.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold text-foreground">{selectedRecord.risk_score.toFixed(1)}/100</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <div className="flex items-center gap-2">
                    <Badge className={riskConfig[selectedRecord.risk_level as keyof typeof riskConfig]?.color}>
                      {selectedRecord.risk_level.charAt(0).toUpperCase() + selectedRecord.risk_level.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Fraud Flags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.flags.map((flag, idx) => (
                    <Badge key={idx} variant="outline">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Action</label>
                <Select value={action} onValueChange={(value: any) => setAction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve Loan</SelectItem>
                    <SelectItem value="rejected">Reject Loan</SelectItem>
                    <SelectItem value="manual_review">Request Manual Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">Review submitted successfully!</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button onClick={handleReview} disabled={isLoading || !action} className="flex-1">
                  {isLoading ? "Processing..." : "Submit Review"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
