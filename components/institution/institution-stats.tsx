"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, CheckCircle2 } from "lucide-react"
import type { Loan, LoanProduct } from "@/lib/types"

interface InstitutionStatsProps {
  loans: Loan[]
  products: LoanProduct[]
}

export function InstitutionStats({ loans, products }: InstitutionStatsProps) {
  const totalLoansIssued = loans.length
  const totalAmountIssued = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const approvedLoans = loans.filter((l) => l.status === "approved" || l.status === "active").length
  const activeLoans = loans.filter((l) => l.status === "active").length

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Loans Issued</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{totalLoansIssued}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Amount Issued
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">${totalAmountIssued.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Portfolio value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved Loans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{approvedLoans}</p>
          <p className="text-xs text-muted-foreground mt-1">Ready or active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Active Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Loan products</p>
        </CardContent>
      </Card>
    </div>
  )
}
