"use client"

import { InstitutionHeader } from "@/components/institution/institution-header"
import { InstitutionStats } from "@/components/institution/institution-stats"
import { LoanManagementTable } from "@/components/institution/loan-management-table"
import { LoanProductsManager } from "@/components/institution/loan-products-manager"
import { mockInstitutionProfile, mockLoans, mockLoanProducts } from "@/lib/mock-data"

export default function InstitutionPage() {
  return (
    <div className="min-h-screen bg-background">
      <InstitutionHeader profile={mockInstitutionProfile} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          {/* Statistics */}
          <InstitutionStats loans={mockLoans} products={mockLoanProducts} />

          {/* Loan Products Manager */}
          <LoanProductsManager products={mockLoanProducts} institutionId="inst-001" />

          {/* Loan Management */}
          <LoanManagementTable loans={mockLoans} />
        </div>
      </main>
    </div>
  )
}
