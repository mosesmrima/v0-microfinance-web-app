"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KYCStatus } from "@/components/kyc/kyc-status"
import { KYCDocumentUpload } from "@/components/kyc/kyc-document-upload"
import { KYCDocumentList } from "@/components/kyc/kyc-document-list"
import { mockProfile, mockKYCDocuments } from "@/lib/mock-data"

export default function KYCPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
          <p className="text-muted-foreground mt-2">Complete your identity verification to unlock higher loan limits</p>
        </div>

        <div className="grid gap-8">
          {/* KYC Status */}
          <KYCStatus profile={mockProfile} />

          {/* Document Upload */}
          <KYCDocumentUpload userId={mockProfile.id} />

          {/* Document List */}
          <KYCDocumentList documents={mockKYCDocuments} />
        </div>
      </div>
    </DashboardLayout>
  )
}
