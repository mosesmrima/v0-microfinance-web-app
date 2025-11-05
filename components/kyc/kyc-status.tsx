"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { Profile } from "@/lib/types"

interface KYCStatusProps {
  profile: Profile | null
}

export function KYCStatus({ profile }: KYCStatusProps) {
  if (!profile) return null

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      description: "Your KYC verification is pending. Please upload required documents.",
      progress: 33,
    },
    verified: {
      icon: CheckCircle2,
      label: "Verified",
      color: "bg-green-100 text-green-800",
      description: "Your identity has been verified. You can now apply for higher loan amounts.",
      progress: 100,
    },
    rejected: {
      icon: AlertCircle,
      label: "Rejected",
      color: "bg-red-100 text-red-800",
      description: "Your KYC verification was rejected. Please resubmit with correct documents.",
      progress: 0,
    },
  }

  const config = statusConfig[profile.kyc_status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-card">
            <StatusIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">KYC Status</h3>
              <Badge className={config.color}>{config.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verification Progress</span>
            <span className="font-semibold text-foreground">{config.progress}%</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Loan Limit</p>
            <p className="text-lg font-semibold text-foreground">
              {profile.kyc_status === "verified" ? "$50,000" : "$5,000"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="text-lg font-semibold text-foreground">
              {profile.kyc_status === "verified" ? "8-12%" : "15-20%"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Loan Duration</p>
            <p className="text-lg font-semibold text-foreground">
              {profile.kyc_status === "verified" ? "Up to 36 months" : "Up to 12 months"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
