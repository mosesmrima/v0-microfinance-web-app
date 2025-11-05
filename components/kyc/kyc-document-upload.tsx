"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"

interface KYCDocumentUploadProps {
  userId: string
}

export function KYCDocumentUpload({ userId }: KYCDocumentUploadProps) {
  const [documentType, setDocumentType] = useState<"id" | "proof_of_address" | "income_proof">()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !documentType) {
      setError("Please select a document type and file")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setFile(null)
      setDocumentType(undefined)

      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Document uploaded successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Government ID (Passport, Driver's License, etc.)</SelectItem>
                <SelectItem value="proof_of_address">Proof of Address (Utility Bill, Bank Statement)</SelectItem>
                <SelectItem value="income_proof">Income Proof (Pay Stub, Tax Return)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, PDF up to 5MB</p>
                  </div>
                </div>
              </label>
            </div>
            {file && <p className="text-sm text-green-600 font-semibold">Selected: {file.name}</p>}
          </div>

          <Button type="submit" disabled={isLoading || !file || !documentType} className="w-full">
            {isLoading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
