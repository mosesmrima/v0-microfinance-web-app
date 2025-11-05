"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { Profile } from "@/lib/types"

interface UserProfileProps {
  profile: Profile | null
}

export function UserProfile({ profile }: UserProfileProps) {
  if (!profile) return null

  const kycStatusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    verified: { icon: CheckCircle2, label: "Verified", color: "bg-green-100 text-green-800" },
    rejected: { icon: AlertCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
  }

  const statusConfig = kycStatusConfig[profile.kyc_status as keyof typeof kycStatusConfig] || kycStatusConfig.pending
  const StatusIcon = statusConfig.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-lg font-semibold text-foreground">
              {profile.first_name} {profile.last_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg font-semibold text-foreground">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-lg font-semibold text-foreground">{profile.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">KYC Status</p>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
