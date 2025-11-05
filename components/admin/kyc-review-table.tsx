"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Eye } from "lucide-react"
import type { KYCDocument } from "@/lib/types"

interface KYCReviewTableProps {
  documents: (KYCDocument & { profiles?: { first_name: string; last_name: string; email: string } })[]
}

export function KYCReviewTable({ documents }: KYCReviewTableProps) {
  const [selectedDoc, setSelectedDoc] = useState<(typeof documents)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const documentTypeLabels = {
    id: "Government ID",
    proof_of_address: "Proof of Address",
    income_proof: "Income Proof",
  }

  const handleApprove = async () => {
    if (!selectedDoc) return

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSuccess(true)
      setTimeout(() => {
        setIsDialogOpen(false)
        setSelectedDoc(null)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDoc || !rejectionReason) {
      setError("Please provide a rejection reason")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSuccess(true)
      setTimeout(() => {
        setIsDialogOpen(false)
        setSelectedDoc(null)
        setRejectionReason("")
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending KYC Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground">No pending documents for review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Document Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Uploaded</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const docTypeLabel = documentTypeLabels[doc.document_type as keyof typeof documentTypeLabels]

                  return (
                    <tr key={doc.id} className="border-b border-border hover:bg-card/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {doc.profiles?.first_name} {doc.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{doc.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{docTypeLabel}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDoc(doc)
                            setIsDialogOpen(true)
                          }}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review KYC Document</DialogTitle>
            </DialogHeader>

            {selectedDoc && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-semibold text-foreground">
                    {selectedDoc.profiles?.first_name} {selectedDoc.profiles?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedDoc.profiles?.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Document</p>
                  <p className="font-semibold text-foreground">
                    {documentTypeLabels[selectedDoc.document_type as keyof typeof documentTypeLabels]}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Document Preview</p>
                  <div className="border border-border rounded-lg overflow-hidden bg-card">
                    <img
                      src={selectedDoc.document_url || "/placeholder.svg"}
                      alt="Document"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rejection Reason (if rejecting)</label>
                  <Textarea
                    placeholder="Explain why this document is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">Document processed successfully!</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isLoading || !rejectionReason}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
