"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Upload, FileText } from "lucide-react"
import { Stage1DocumentType } from "@/lib/types"
import { createKYCDocument, updateProfile } from "@/lib/mock-store"
import { useAuth } from "@/contexts/AuthContext"

interface KYCStage1WizardProps {
  onComplete: () => void
}

export function KYCStage1Wizard({ onComplete }: KYCStage1WizardProps) {
  const { currentUser, updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [idType, setIdType] = useState<Stage1DocumentType>("national_id")
  const [idFile, setIdFile] = useState<File | null>(null)
  const [residenceFile, setResidenceFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3

  const handleIDTypeSelect = () => {
    setCurrentStep(2)
  }

  const handleIDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        alert("Please upload a JPG, PNG, or PDF file")
        return
      }

      setIDFile(file)
    }
  }

  const handleResidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        alert("Please upload a JPG, PNG, or PDF file")
        return
      }

      setResidenceFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!currentUser) return
    if (!idFile || !residenceFile) {
      alert("Please upload all required documents")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate file upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create KYC documents in localStorage
      // In a real app, we'd upload to a server and get back URLs
      const idDocUrl = `/kyc/${currentUser.id}/${idFile.name}`
      const residenceDocUrl = `/kyc/${currentUser.id}/${residenceFile.name}`

      // Save ID document
      createKYCDocument({
        user_id: currentUser.id,
        stage: "stage1",
        document_type: idType,
        document_url: idDocUrl,
        status: "pending",
      })

      // Save residence document
      createKYCDocument({
        user_id: currentUser.id,
        stage: "stage1",
        document_type: "proof_of_residence",
        document_url: residenceDocUrl,
        status: "pending",
      })

      // Update user profile
      updateProfile(currentUser.id, {
        kyc_stage1_completed: true,
        kyc_stage1_status: "pending",
        kyc_status: "pending",
      })

      // Update current user in context
      updateUser({
        kyc_stage1_completed: true,
        kyc_stage1_status: "pending",
        kyc_status: "pending",
      })

      // Move to success step
      setCurrentStep(3)
    } catch (error) {
      console.error("Error submitting KYC:", error)
      alert("Failed to submit KYC documents. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} />
      </div>

      {/* Step 1: Select ID Type */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select ID Type</CardTitle>
            <CardDescription>
              Choose the type of identification document you will upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={idType} onValueChange={(value) => setIdType(value as Stage1DocumentType)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="national_id" id="national_id" />
                  <Label htmlFor="national_id" className="flex-1 cursor-pointer">
                    <div className="font-medium">National ID</div>
                    <div className="text-sm text-muted-foreground">Government-issued national identification card</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="passport" id="passport" />
                  <Label htmlFor="passport" className="flex-1 cursor-pointer">
                    <div className="font-medium">Passport</div>
                    <div className="text-sm text-muted-foreground">International passport</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="drivers_license" id="drivers_license" />
                  <Label htmlFor="drivers_license" className="flex-1 cursor-pointer">
                    <div className="font-medium">Driver's License</div>
                    <div className="text-sm text-muted-foreground">Valid driver's license</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleIDTypeSelect}>Next: Upload Documents</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Documents */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload Documents</CardTitle>
            <CardDescription>
              Upload your ID document and proof of residence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ID Document Upload */}
            <div>
              <Label className="text-base font-medium">
                {idType === "national_id" && "National ID"}
                {idType === "passport" && "Passport"}
                {idType === "drivers_license" && "Driver's License"}
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a clear photo or scan of your {idType.replace("_", " ")}
              </p>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                {idFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{idFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(idFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIDFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <Label htmlFor="id-upload" className="cursor-pointer">
                      <span className="text-primary font-medium">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      PNG, JPG or PDF (max. 5MB)
                    </p>
                    <input
                      id="id-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      className="hidden"
                      onChange={handleIDUpload}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Proof of Residence Upload */}
            <div>
              <Label className="text-base font-medium">Proof of Residence</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a utility bill, bank statement, or government letter (not older than 3 months)
              </p>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                {residenceFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{residenceFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(residenceFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResidenceFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <Label htmlFor="residence-upload" className="cursor-pointer">
                      <span className="text-primary font-medium">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      PNG, JPG or PDF (max. 5MB)
                    </p>
                    <input
                      id="residence-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      className="hidden"
                      onChange={handleResidenceUpload}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!idFile || !residenceFile || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Documents Submitted!</h3>
                <p className="text-muted-foreground">
                  Your KYC Stage 1 documents have been submitted for review.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Our team will review your documents within 1-2 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>You'll receive a notification once verification is complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>After approval, you can browse and apply for loans</span>
                  </li>
                </ul>
              </div>

              <Button onClick={onComplete} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
