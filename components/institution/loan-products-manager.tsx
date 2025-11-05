"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react"
import type { LoanProduct } from "@/lib/types"

interface LoanProductsManagerProps {
  products: LoanProduct[]
  institutionId: string
}

export function LoanProductsManager({ products, institutionId }: LoanProductsManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_amount: "1000",
    max_amount: "50000",
    interest_rate: "12",
    duration_months: "12",
    requirements: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSuccess(true)
      setFormData({
        name: "",
        description: "",
        min_amount: "1000",
        max_amount: "50000",
        interest_rate: "12",
        duration_months: "12",
        requirements: "",
      })

      setTimeout(() => {
        setIsOpen(false)
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Loan Products</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Loan Product</DialogTitle>
            </DialogHeader>

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
                  <AlertDescription className="text-green-700">Product created successfully!</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Quick Business Loan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this loan product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="min_amount">Minimum Amount ($)</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      value={formData.min_amount}
                      onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_amount">Maximum Amount ($)</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      value={formData.max_amount}
                      onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.1"
                      value={formData.interest_rate}
                      onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (Months)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List any specific requirements for this product..."
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No loan products yet. Create one to get started.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Range:</span>
                    <span className="font-semibold">
                      ${product.min_amount.toFixed(0)} - ${product.max_amount.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span className="font-semibold">{product.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{product.duration_months} months</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
