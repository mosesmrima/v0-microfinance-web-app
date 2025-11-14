"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import {
  getKYCDocuments,
  getProfileById,
  updateKYCDocument,
  updateProfile,
  createNotification,
  getLoanById,
} from "@/lib/mock-store"
import { KYCDocument } from "@/lib/types"
import { format } from "date-fns"
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  AlertCircle,
  User,
  Clock,
} from "lucide-react"

export default function KYCReviewPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "md") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "md") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const allKYCDocuments = getKYCDocuments()
  const pendingDocuments = allKYCDocuments.filter((doc) => doc.status === "pending")
  const verifiedDocuments = allKYCDocuments.filter((doc) => doc.status === "verified")
  const rejectedDocuments = allKYCDocuments.filter((doc) => doc.status === "rejected")

  const stage1Pending = pendingDocuments.filter((doc) => doc.stage === "stage1")
  const stage2Pending = pendingDocuments.filter((doc) => doc.stage === "stage2")

  const handleVerify = async (document: KYCDocument) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update document status
      updateKYCDocument(document.id, {
        status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: currentUser.id,
      })

      // If this is a Stage 1 document, check if all Stage 1 docs are verified
      if (document.stage === "stage1") {
        const userStage1Docs = allKYCDocuments.filter(
          (doc) => doc.user_id === document.user_id && doc.stage === "stage1"
        )
        const allStage1Verified = userStage1Docs.every(
          (doc) => doc.status === "verified" || doc.id === document.id
        )

        if (allStage1Verified) {
          // Update user's KYC status
          updateProfile(document.user_id, {
            kyc_stage1_status: "verified",
            kyc_status: "verified",
          })

          // Create notification
          createNotification({
            user_id: document.user_id,
            title: "KYC Verification Complete",
            message: "Your identity documents have been verified. You can now apply for loans!",
            type: "success",
            read: false,
          })
        }
      }

      setSelectedDocument(null)
    } catch (error) {
      console.error("Error verifying document:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (document: KYCDocument) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update document status
      updateKYCDocument(document.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
        verified_at: new Date().toISOString(),
        verified_by: currentUser.id,
      })

      // If this is a Stage 1 document, update user's KYC status
      if (document.stage === "stage1") {
        updateProfile(document.user_id, {
          kyc_stage1_status: "rejected",
        })

        // Create notification
        createNotification({
          user_id: document.user_id,
          title: "KYC Document Rejected",
          message: `Your ${document.document_type.replace(/_/g, " ")} document was rejected. Please re-submit with valid documents.`,
          type: "error",
          read: false,
        })
      }

      setSelectedDocument(null)
      setRejectionReason("")
    } catch (error) {
      console.error("Error rejecting document:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const renderDocumentCard = (document: KYCDocument) => {
    const borrower = getProfileById(document.user_id)
    if (!borrower) return null

    let loanInfo = null
    if (document.loan_application_id) {
      const loan = getLoanById(document.loan_application_id)
      if (loan) {
        loanInfo = `For $${loan.amount.toLocaleString()} loan application`
      }
    }

    return (
      <Card
        key={document.id}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedDocument(document)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{formatDocumentType(document.document_type)}</CardTitle>
              <CardDescription>
                Applicant: {borrower.first_name} {borrower.last_name}
              </CardDescription>
              {loanInfo && <CardDescription className="text-xs mt-1">{loanInfo}</CardDescription>}
            </div>
            <Badge>
              {document.stage === "stage1" ? "Identity Verification" : "Income Verification"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Uploaded {format(new Date(document.uploaded_at!), "MMM dd, yyyy 'at' h:mm a")}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDocument(document)
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Review
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">KYC Document Review</h1>
          <p className="text-muted-foreground mt-2">
            Review and verify borrower identity and income documents
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Document List */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="stage1" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stage1">
                  Stage 1 - Identity
                  {stage1Pending.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {stage1Pending.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="stage2">
                  Stage 2 - Income
                  {stage2Pending.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {stage2Pending.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviewed">
                  Reviewed
                  {verifiedDocuments.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {verifiedDocuments.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stage1" className="space-y-4">
                {stage1Pending.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Pending Stage 1 Documents</h3>
                      <p className="text-muted-foreground">
                        All identity documents have been reviewed.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {stage1Pending.map((doc) => renderDocumentCard(doc))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stage2" className="space-y-4">
                {stage2Pending.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Pending Stage 2 Documents</h3>
                      <p className="text-muted-foreground">
                        All income verification documents have been reviewed.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {stage2Pending.map((doc) => renderDocumentCard(doc))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviewed" className="space-y-4">
                {verifiedDocuments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Reviewed Documents</h3>
                      <p className="text-muted-foreground">
                        Documents you've verified will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {verifiedDocuments.slice(0, 10).map((doc) => {
                      const borrower = getProfileById(doc.user_id)
                      if (!borrower) return null

                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{formatDocumentType(doc.document_type)}</p>
                              <p className="text-sm text-muted-foreground">
                                {borrower.first_name} {borrower.last_name}
                              </p>
                            </div>
                          </div>
                          <Badge variant="default">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Review Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Document Review</CardTitle>
                <CardDescription>
                  {selectedDocument ? "Review and verify document" : "Select a document to review"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDocument ? (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Document Type</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDocumentType(selectedDocument.document_type)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Stage</p>
                        <Badge>
                          {selectedDocument.stage === "stage1"
                            ? "Identity Verification"
                            : "Income Verification"}
                        </Badge>
                      </div>

                      {selectedDocument.user_id && (
                        <div>
                          <p className="text-sm font-medium mb-1">Applicant</p>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">
                              {(() => {
                                const borrower = getProfileById(selectedDocument.user_id)
                                return borrower
                                  ? `${borrower.first_name} ${borrower.last_name}`
                                  : "Unknown"
                              })()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-1">Uploaded</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedDocument.uploaded_at!), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>

                      <div className="pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full mb-2">
                          <Download className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Carefully review the document to ensure all information is valid and accurate.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleVerify(selectedDocument)}
                        disabled={isSubmitting}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Processing..." : "Verify Document"}
                      </Button>

                      <div>
                        <Label htmlFor="rejection" className="text-sm">
                          Rejection Reason
                        </Label>
                        <Textarea
                          id="rejection"
                          placeholder="Reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="mb-2"
                        />
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleReject(selectedDocument)}
                          disabled={isSubmitting || !rejectionReason.trim()}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Processing..." : "Reject Document"}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Select a document from the list to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
