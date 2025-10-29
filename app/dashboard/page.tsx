"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LoansOverview } from "@/components/dashboard/loans-overview"
import { LoanProducts } from "@/components/dashboard/loan-products"
import { UserProfile } from "@/components/dashboard/user-profile"
import { mockProfile, mockLoans, mockLoanProducts } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={mockProfile} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          {/* User Profile Section */}
          <UserProfile profile={mockProfile} />

          {/* Loans Overview */}
          <LoansOverview loans={mockLoans} />

          {/* Available Loan Products */}
          <LoanProducts products={mockLoanProducts} />
        </div>
      </main>
    </div>
  )
}
