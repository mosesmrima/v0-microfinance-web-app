"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import type { Loan } from "@/lib/types"

interface MakePaymentFormProps {
  loan: Loan
  userId: string
}

export function MakePaymentForm({ loan, userId }: MakePaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "crypto">()
  const [amount, setAmount] = useState(loan.monthly_payment?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMethod || !amount) {
      setError("Please select a payment method and enter an amount")
      return
    }

    const paymentAmount = Number.parseFloat(amount)
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
      setAmount("")
      setPaymentMethod(undefined)

      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
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
              <AlertDescription className="text-green-700">
                Payment processed successfully! Transaction recorded on blockchain.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="mt-1"
              required
            />
            <p className="text-xs text-muted-foreground">Monthly payment: ${loan.monthly_payment?.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="crypto">Cryptocurrency (Blockchain)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "crypto" && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Cryptocurrency payments are recorded on the blockchain for transparency and security.
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-card rounded-lg border border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount:</span>
              <span className="font-semibold">${Number.parseFloat(amount || "0").toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-semibold">{loan.interest_rate}%</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold text-primary">${Number.parseFloat(amount || "0").toFixed(2)}</span>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              "Process Payment"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
