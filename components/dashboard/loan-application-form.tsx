"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { LoanProduct, Profile } from "@/lib/types"

interface LoanApplicationFormProps {
  product: LoanProduct
  profile: Profile | null
  userId: string
}

export function LoanApplicationForm({ product, profile, userId }: LoanApplicationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    amount: product.min_amount.toString(),
    duration_months: product.max_duration ? product.max_duration.toString() : "12",
    purpose: "",
  })

  const monthlyPayment = calculateMonthlyPayment(
    Number.parseFloat(formData.amount),
    product.interest_rate,
    Number.parseInt(formData.duration_months),
  )

  function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / months
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Application Submitted</h3>
              <p className="text-sm text-green-700">
                Your loan application has been submitted successfully. Redirecting...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Application Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Applicant Info */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Applicant Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input value={profile?.first_name || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={profile?.last_name || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile?.email || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={profile?.phone || ""} disabled className="mt-1" />
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Loan Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="amount">Loan Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min={product.min_amount}
                  max={product.max_amount}
                  step="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Range: ${product.min_amount.toFixed(0)} - ${product.max_amount.toFixed(0)}
                </p>
              </div>
              <div>
                <Label htmlFor="duration">Duration (Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={product.min_duration}
                  max={product.max_duration}
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="space-y-3 p-4 bg-card rounded-lg border border-border">
            <h3 className="font-semibold text-foreground">Loan Summary</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount:</span>
                <span className="font-semibold">${Number.parseFloat(formData.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-semibold">{product.interest_rate}% per annum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{formData.duration_months} months</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground">Monthly Payment:</span>
                <span className="font-bold text-primary">${monthlyPayment.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label htmlFor="purpose">Loan Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of this loan..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
