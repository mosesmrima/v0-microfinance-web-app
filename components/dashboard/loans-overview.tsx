"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { Loan } from "@/lib/types"

interface LoansOverviewProps {
  loans: Loan[]
}

export function LoansOverview({ loans }: LoansOverviewProps) {
  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    approved: { icon: CheckCircle2, label: "Approved", color: "bg-blue-100 text-blue-800" },
    rejected: { icon: XCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
    active: { icon: TrendingUp, label: "Active", color: "bg-green-100 text-green-800" },
    completed: { icon: CheckCircle2, label: "Completed", color: "bg-gray-100 text-gray-800" },
    defaulted: { icon: XCircle, label: "Defaulted", color: "bg-red-100 text-red-800" },
  }

  const activeLoan = loans.find((l) => l.status === "active")
  const totalBorrowed = loans.reduce((sum, l) => sum + l.amount, 0)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Borrowed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Borrowed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">${totalBorrowed.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{loans.length} loans</p>
        </CardContent>
      </Card>

      {/* Active Loan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Loan</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoan ? (
            <>
              <p className="text-2xl font-bold text-foreground">${activeLoan.amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeLoan.duration_months} months @ {activeLoan.interest_rate}%
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No active loans</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Payment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoan?.monthly_payment ? (
            <>
              <p className="text-2xl font-bold text-foreground">${activeLoan.monthly_payment.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Due each month</p>
            </>
          ) : (
            <p className="text-muted-foreground">No active loans</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
