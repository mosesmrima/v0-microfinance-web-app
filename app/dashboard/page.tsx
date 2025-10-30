"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoansOverview } from "@/components/dashboard/loans-overview"
import { LoanProducts } from "@/components/dashboard/loan-products"
import { UserProfile } from "@/components/dashboard/user-profile"
import { mockProfile, mockLoans, mockLoanProducts } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {mockProfile.first_name}!</p>
        </div>

        <div className="grid gap-8">
          {/* User Profile Section */}
          <UserProfile profile={mockProfile} />

          {/* Loans Overview */}
          <LoansOverview loans={mockLoans} />

          {/* Available Loan Products */}
          <LoanProducts products={mockLoanProducts} />
        </div>
      </div>
    </DashboardLayout>
  )
}
