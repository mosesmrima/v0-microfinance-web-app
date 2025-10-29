"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

interface FraudDetectionStatsProps {
  highRiskCount: number
  mediumRiskCount: number
  pendingReviewCount: number
  totalRecords: number
}

export function FraudDetectionStats({
  highRiskCount,
  mediumRiskCount,
  pendingReviewCount,
  totalRecords,
}: FraudDetectionStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            High Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Requires immediate review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            Medium Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Pending Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">{pendingReviewCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Total Flagged
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </CardContent>
      </Card>
    </div>
  )
}
