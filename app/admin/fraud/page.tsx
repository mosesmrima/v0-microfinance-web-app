import type { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FraudDetectionStats } from "@/components/fraud/fraud-detection-stats"
import { FraudAlertsList } from "@/components/fraud/fraud-alerts-list"
import { mockFraudAlerts } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Fraud Detection",
  description: "Monitor and review flagged loan applications.",
}

export default function AdminFraudPage() {
  const highRiskCount = mockFraudAlerts.filter((f) => f.risk_score >= 60).length
  const mediumRiskCount = mockFraudAlerts.filter((f) => f.risk_score >= 30 && f.risk_score < 60).length
  const pendingReviewCount = mockFraudAlerts.filter((f) => f.status === "pending").length

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Fraud Detection</h1>
          <p className="text-muted-foreground mt-2">Monitor and review flagged loan applications</p>
        </div>

        <div className="grid gap-8">
          {/* Statistics */}
          <FraudDetectionStats
            highRiskCount={highRiskCount}
            mediumRiskCount={mediumRiskCount}
            pendingReviewCount={pendingReviewCount}
            totalRecords={mockFraudAlerts.length}
          />

          {/* Fraud Alerts */}
          <FraudAlertsList records={mockFraudAlerts} />
        </div>
      </div>
    </DashboardLayout>
  )
}
