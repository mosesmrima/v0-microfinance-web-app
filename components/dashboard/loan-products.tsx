"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LoanProduct } from "@/lib/types"

interface LoanProductsProps {
  products: LoanProduct[]
}

export function LoanProducts({ products }: LoanProductsProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Loan Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No loan products available at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Available Loan Products</h2>
        <p className="text-muted-foreground mt-1">Choose from our range of loan products</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{product.description}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${product.min_amount.toFixed(0)} - ${product.max_amount.toFixed(0)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="text-sm font-semibold text-foreground">{product.interest_rate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-semibold text-foreground">{product.min_duration}-{product.max_duration} months</p>
                  </div>
                </div>

                {product.requirements && (
                  <div>
                    <p className="text-xs text-muted-foreground">Requirements</p>
                    <p className="text-sm text-foreground">{product.requirements}</p>
                  </div>
                )}
              </div>

              <Link href="/dashboard/apply" className="mt-auto">
                <Button className="w-full gap-2">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
