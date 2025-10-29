"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Clock, Download } from "lucide-react"
import type { KYCDocument } from "@/lib/types"

interface KYCDocumentListProps {
  documents: KYCDocument[]
}

export function KYCDocumentList({ documents }: KYCDocumentListProps) {
  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    verified: { icon: CheckCircle2, label: "Verified", color: "bg-green-100 text-green-800" },
    rejected: { icon: AlertCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
  }

  const documentTypeLabels = {
    id: "Government ID",
    proof_of_address: "Proof of Address",
    income_proof: "Income Proof",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground">No documents submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const statusConfig_ = statusConfig[doc.status as keyof typeof statusConfig]
              const StatusIcon = statusConfig_.icon
              const docTypeLabel = documentTypeLabels[doc.document_type as keyof typeof documentTypeLabels]

              return (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{docTypeLabel}</h4>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusConfig_.color}>{statusConfig_.label}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                    {doc.rejection_reason && (
                      <p className="text-xs text-red-600 mt-2">Reason: {doc.rejection_reason}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.document_url, "_blank")}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    View
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
