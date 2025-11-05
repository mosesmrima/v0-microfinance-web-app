"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, ExternalLink } from "lucide-react"

interface PaymentHistoryProps {
  payments: any[]
  blockchainTxs: any[]
}

export function PaymentHistory({ payments, blockchainTxs }: PaymentHistoryProps) {
  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    completed: { icon: CheckCircle2, label: "Completed", color: "bg-green-100 text-green-800" },
    failed: { icon: Clock, label: "Failed", color: "bg-red-100 text-red-800" },
  }

  const paymentMethodLabels = {
    card: "Credit/Debit Card",
    bank_transfer: "Bank Transfer",
    crypto: "Cryptocurrency",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">No payments made yet.</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const statusConfig_ = statusConfig[payment.status as keyof typeof statusConfig]
              const StatusIcon = statusConfig_.icon
              const methodLabel = paymentMethodLabels[payment.payment_method as keyof typeof paymentMethodLabels]
              const blockchainTx = blockchainTxs.find((tx) => tx.payment_id === payment.id)

              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-4 w-4" />
                      <h4 className="font-semibold text-foreground">${payment.amount.toFixed(2)}</h4>
                      <Badge className={statusConfig_.color}>{statusConfig_.label}</Badge>
                    </div>
                    <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                      <p>Method: {methodLabel}</p>
                      <p>Date: {new Date(payment.created_at).toLocaleDateString()}</p>
                      {blockchainTx && (
                        <p className="text-blue-600 font-semibold">
                          Blockchain: {blockchainTx.blockchain_network.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  {blockchainTx && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // In a real app, this would link to a blockchain explorer
                        navigator.clipboard.writeText(blockchainTx.transaction_hash)
                      }}
                      className="gap-2"
                      title={blockchainTx.transaction_hash}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden sm:inline">TX Hash</span>
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
