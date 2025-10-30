"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KYCReviewTable } from "@/components/admin/kyc-review-table"
import { mockKYCDocuments } from "@/lib/mock-data"

export default function AdminKYCPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">KYC Review</h1>
          <p className="text-muted-foreground mt-2">Review and verify user documents</p>
        </div>

        <KYCReviewTable documents={mockKYCDocuments} />
      </div>
    </DashboardLayout>
  )
}
