"use client"

import { LoanApplicationForm } from "@/components/dashboard/loan-application-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { mockLoanProducts, mockProfile } from "@/lib/mock-data"
import { useParams } from "next/navigation"

export default function ApplyPage() {
  const params = useParams()
  const productId = params.productId as string

  const product = mockLoanProducts.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Product not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Apply for {product.name}</h1>
          <p className="text-muted-foreground mt-2">Complete the form below to apply for this loan product</p>
        </div>

        <LoanApplicationForm product={product} profile={mockProfile} userId={mockProfile.id} />
      </main>
    </div>
  )
}
