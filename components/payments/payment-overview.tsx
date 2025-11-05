"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Calendar, TrendingUp } from "lucide-react"
import type { Loan } from "@/lib/types"

interface PaymentOverviewProps {
  activeLoan: Loan | null
  payments: any[]
}

export function PaymentOverview({ activeLoan, payments }: PaymentOverviewProps) {
  if (!activeLoan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No active loans. Apply for a loan to start making payments.</p>
        </CardContent>
      </Card>
    )
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingBalance = activeLoan.amount - totalPayments
  const paymentProgress = (totalPayments / activeLoan.amount) * 100
  const monthsElapsed = Math.floor(
    (Date.now() - new Date(activeLoan.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30),
  )
  const nextPaymentDue = new Date(activeLoan.created_at)
  nextPaymentDue.setMonth(nextPaymentDue.getMonth() + monthsElapsed + 1)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">${totalPayments.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">of ${activeLoan.amount.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Remaining Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">${remainingBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{activeLoan.duration_months - monthsElapsed} months left</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Next Payment Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">${activeLoan.monthly_payment?.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{nextPaymentDue.toLocaleDateString()}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Payment Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={paymentProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">{paymentProgress.toFixed(1)}% complete</p>
        </CardContent>
      </Card>
    </div>
  )
}
