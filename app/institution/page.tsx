"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InstitutionStats } from "@/components/institution/institution-stats"
import { LoanManagementTable } from "@/components/institution/loan-management-table"
import { LoanProductsManager } from "@/components/institution/loan-products-manager"
import { mockLoans, mockLoanProducts } from "@/lib/mock-data"

export default function InstitutionPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Institution Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your loan products and applications</p>
        </div>

        <div className="grid gap-8">
          {/* Statistics */}
          <InstitutionStats loans={mockLoans} products={mockLoanProducts} />

          {/* Loan Products Manager */}
          <LoanProductsManager products={mockLoanProducts} institutionId="inst-001" />

          {/* Loan Management */}
          <LoanManagementTable loans={mockLoans} />
        </div>
      </div>
    </DashboardLayout>
  )
}
