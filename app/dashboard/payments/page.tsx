"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PaymentOverview } from "@/components/payments/payment-overview"
import { MakePaymentForm } from "@/components/payments/make-payment-form"
import { PaymentHistory } from "@/components/payments/payment-history"
import { mockProfile, mockLoans, mockPayments } from "@/lib/mock-data"

export default function PaymentsPage() {
  const activeLoan = mockLoans.find((l) => l.status === "active")

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={mockProfile} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Loan Payments</h1>
          <p className="text-muted-foreground mt-2">Manage your loan payments and view transaction history</p>
        </div>

        <div className="grid gap-8">
          {/* Payment Overview */}
          <PaymentOverview activeLoan={activeLoan} payments={mockPayments} />

          {/* Make Payment */}
          {activeLoan && <MakePaymentForm loan={activeLoan} userId={mockProfile.id} />}

          {/* Payment History */}
          <PaymentHistory payments={mockPayments} blockchainTxs={[]} />
        </div>
      </main>
    </div>
  )
}
