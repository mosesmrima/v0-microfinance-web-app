"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoanProduct, Stage2DocumentType, Profile } from "@/lib/types"
import { createLoan, createKYCDocument, getLoanProducts } from "@/lib/mock-store"
import { CheckCircle2, ArrowRight, ArrowLeft, Upload, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoanApplicationWizardProps {
  currentUser: Profile
  onComplete: (loanId: string) => void
}

export function LoanApplicationWizard({ currentUser, onComplete }: LoanApplicationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null)
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("12")
  const [purpose, setPurpose] = useState("")
  const [payslipFile, setPayslipFile] = useState<File | null>(null)
  const [bankStatementFile, setBankStatementFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loanProducts = getLoanProducts()

  // Calculate loan details
  const calculateMonthlyPayment = (principal: number, rate: number, months: number): number => {
    const monthlyRate = rate / 100 / 12
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    return payment
  }

  const loanAmount = parseFloat(amount) || 0
  const loanDuration = parseInt(duration) || 12
  const interestRate = selectedProduct?.interest_rate || 15
  const monthlyPayment = loanAmount > 0 ? calculateMonthlyPayment(loanAmount, interestRate, loanDuration) : 0

  // Validation
  const canProceedStep1 = selectedProduct !== null
  const canProceedStep2 =
    amount &&
    parseFloat(amount) >= (selectedProduct?.min_amount || 0) &&
    parseFloat(amount) <= (selectedProduct?.max_amount || 100000) &&
    purpose.trim().length > 0
  const canProceedStep3 = payslipFile !== null && bankStatementFile !== null

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null
    setter(file)
  }

  const handleSubmit = async () => {
    if (!selectedProduct) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Simulate file upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create loan application
      const newLoan = createLoan({
        user_id: currentUser.id,
        loan_product_id: selectedProduct.id,
        amount: loanAmount,
        duration_months: loanDuration,
        interest_rate: interestRate,
        monthly_payment: monthlyPayment,
        purpose: purpose,
        status: "kyc_stage2_required",
        kyc_stage2_status: "pending",
      })

      // Create KYC Stage 2 documents
      createKYCDocument({
        user_id: currentUser.id,
        stage: "stage2",
        document_type: "payslip",
        document_url: `mock://documents/${payslipFile?.name}`,
        status: "pending",
        loan_application_id: newLoan.id,
      })

      createKYCDocument({
        user_id: currentUser.id,
        stage: "stage2",
        document_type: "bank_statement",
        document_url: `mock://documents/${bankStatementFile?.name}`,
        status: "pending",
        loan_application_id: newLoan.id,
      })

      // Update loan status to submitted
      // Note: In a real app, this would happen after document verification
      // For now, we'll leave it as kyc_stage2_required for the workflow

      onComplete(newLoan.id)
    } catch (err) {
      setError("Failed to submit application. Please try again.")
      console.error("Loan application error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Select a Loan Product</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the loan product that best fits your needs
        </p>
      </div>

      <RadioGroup
        value={selectedProduct?.id || ""}
        onValueChange={(value) => {
          const product = loanProducts.find((p) => p.id === value)
          setSelectedProduct(product || null)
        }}
      >
        <div className="space-y-3">
          {loanProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                selectedProduct?.id === product.id && "border-primary bg-primary/5"
              )}
              onClick={() => setSelectedProduct(product)}
            >
              <RadioGroupItem value={product.id} id={product.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={product.id} className="cursor-pointer">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      <span className="text-muted-foreground">Amount:</span> $
                      {product.min_amount.toLocaleString()} - ${product.max_amount.toLocaleString()}
                    </span>
                    <span>
                      <span className="text-muted-foreground">Rate:</span> {product.interest_rate}%
                    </span>
                    <span>
                      <span className="text-muted-foreground">Term:</span> {product.min_duration}-
                      {product.max_duration} months
                    </span>
                  </div>
                </Label>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Loan Details</h3>
        <p className="text-sm text-muted-foreground mb-4">Enter your loan requirements</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Loan Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={selectedProduct?.min_amount}
            max={selectedProduct?.max_amount}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Range: ${selectedProduct?.min_amount.toLocaleString()} - $
            {selectedProduct?.max_amount.toLocaleString()}
          </p>
        </div>

        <div>
          <Label htmlFor="duration">Loan Duration (months)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="Enter duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min={selectedProduct?.min_duration}
            max={selectedProduct?.max_duration}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Range: {selectedProduct?.min_duration} - {selectedProduct?.max_duration} months
          </p>
        </div>

        <div>
          <Label htmlFor="purpose">Loan Purpose</Label>
          <Textarea
            id="purpose"
            placeholder="Describe how you plan to use the loan"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provide details about your business or investment plans
          </p>
        </div>

        {loanAmount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Loan Summary</p>
                <p className="text-sm">Monthly Payment: ${monthlyPayment.toFixed(2)}</p>
                <p className="text-sm">Total Repayment: ${(monthlyPayment * loanDuration).toFixed(2)}</p>
                <p className="text-sm">Interest Rate: {interestRate}% APR</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Income Verification</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload documents to verify your income (KYC Stage 2)
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          These documents are required for each loan application to verify your current income and
          financial status.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Payslip upload */}
        <div className="border rounded-lg p-4">
          <Label htmlFor="payslip" className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            Recent Payslip (Last 3 months)
          </Label>
          <Input
            id="payslip"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e, setPayslipFile)}
          />
          {payslipFile && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {payslipFile.name}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Accepted formats: PDF, JPG, PNG (max 5MB)
          </p>
        </div>

        {/* Bank statement upload */}
        <div className="border rounded-lg p-4">
          <Label htmlFor="bank-statement" className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            Bank Statement (Last 3 months)
          </Label>
          <Input
            id="bank-statement"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e, setBankStatementFile)}
          />
          {bankStatementFile && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {bankStatementFile.name}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Accepted formats: PDF, JPG, PNG (max 5MB)
          </p>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Review & Submit</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review your application before submitting
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-medium">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">${loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{loanDuration} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-medium">{interestRate}% APR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment:</span>
              <span className="font-medium">${monthlyPayment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Repayment:</span>
              <span className="font-medium">${(monthlyPayment * loanDuration).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loan Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{purpose}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submitted Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Payslip: {payslipFile?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Bank Statement: {bankStatementFile?.name}</span>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            By submitting this application, you confirm that all information provided is accurate and
            agree to the terms and conditions of the loan.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} />
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2) ||
              (currentStep === 3 && !canProceedStep3)
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  )
}
