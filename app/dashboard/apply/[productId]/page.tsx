"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
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
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Apply for {product.name}</h1>
          <p className="text-muted-foreground mt-2">Complete the form below to apply for this loan product</p>
        </div>

        <LoanApplicationForm product={product} profile={mockProfile} userId={mockProfile.id} />
      </div>
    </DashboardLayout>
  )
}
