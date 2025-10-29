"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react"
import type { Loan } from "@/lib/types"

interface LoanManagementTableProps {
  loans: (Loan & { profiles?: { first_name: string; last_name: string; email: string } })[]
}

export function LoanManagementTable({ loans }: LoanManagementTableProps) {
  const [selectedLoan, setSelectedLoan] = useState<(typeof loans)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    approved: { icon: CheckCircle2, label: "Approved", color: "bg-blue-100 text-blue-800" },
    rejected: { icon: XCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
    active: { icon: CheckCircle2, label: "Active", color: "bg-green-100 text-green-800" },
    completed: { icon: CheckCircle2, label: "Completed", color: "bg-gray-100 text-gray-800" },
    defaulted: { icon: XCircle, label: "Defaulted", color: "bg-red-100 text-red-800" },
  }

  const handleStatusChange = async () => {
    if (!selectedLoan || !newStatus) return

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSuccess(true)
      setTimeout(() => {
        setIsDialogOpen(false)
        setSelectedLoan(null)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <p className="text-muted-foreground">No loan applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Borrower</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Interest Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const config = statusConfig[loan.status as keyof typeof statusConfig] || statusConfig.pending
                  const StatusIcon = config.icon

                  return (
                    <tr key={loan.id} className="border-b border-border hover:bg-card/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {loan.profiles?.first_name} {loan.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{loan.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">${loan.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-foreground">{loan.duration_months} months</td>
                      <td className="py-3 px-4 text-foreground">{loan.interest_rate}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLoan(loan)
                            setNewStatus(loan.status)
                            setIsDialogOpen(true)
                          }}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Loan Status</DialogTitle>
            </DialogHeader>

            {selectedLoan && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Borrower</p>
                  <p className="font-semibold text-foreground">
                    {selectedLoan.profiles?.first_name} {selectedLoan.profiles?.last_name}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="font-semibold text-foreground">${selectedLoan.amount.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="defaulted">Defaulted</SelectItem>
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
                    <AlertDescription className="text-green-700">Status updated successfully!</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button onClick={handleStatusChange} disabled={isLoading} className="flex-1">
                    {isLoading ? "Updating..." : "Update Status"}
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
      </CardContent>
    </Card>
  )
}
