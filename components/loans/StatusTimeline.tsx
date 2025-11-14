"use client"

import { LoanStatus } from "@/lib/types"
import { CheckCircle2, Clock, XCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineStep {
  status: LoanStatus
  label: string
  description: string
}

interface StatusTimelineProps {
  currentStatus: LoanStatus
  rejectionReason?: string
  className?: string
}

export function StatusTimeline({ currentStatus, rejectionReason, className }: StatusTimelineProps) {
  const allSteps: TimelineStep[] = [
    {
      status: "draft",
      label: "Draft",
      description: "Application created",
    },
    {
      status: "kyc_stage2_required",
      label: "Documents Required",
      description: "Upload income verification documents",
    },
    {
      status: "submitted",
      label: "Submitted",
      description: "Application submitted for review",
    },
    {
      status: "under_review",
      label: "Under Review",
      description: "Documents being verified",
    },
    {
      status: "pending_loan_officer",
      label: "Loan Officer Review",
      description: "Tier 1 review and escalation",
    },
    {
      status: "pending_md",
      label: "MD Approval",
      description: "Managing Director approval (Tier 2)",
    },
    {
      status: "pending_finance_director",
      label: "Finance Director Review",
      description: "Finance Director reviewing high-value loan",
    },
    {
      status: "approved",
      label: "Approved",
      description: "Loan application approved",
    },
    {
      status: "disbursed",
      label: "Disbursed",
      description: "Loan disbursed and active",
    },
  ]

  // Determine which steps to show based on loan amount
  const getVisibleSteps = () => {
    // For rejected loans, show all steps up to rejection
    if (currentStatus === "rejected") {
      return allSteps.filter((step) =>
        step.status === "draft" ||
        step.status === "kyc_stage2_required" ||
        step.status === "submitted" ||
        step.status === "under_review"
      )
    }

    // For loans under review by finance director, include finance director step
    if (currentStatus === "pending_finance_director") {
      return allSteps
    }

    // For other loans, exclude finance director review step
    return allSteps.filter((step) => step.status !== "pending_finance_director")
  }

  const visibleSteps = getVisibleSteps()

  const getStepStatus = (step: TimelineStep): "completed" | "current" | "pending" | "rejected" => {
    if (currentStatus === "rejected") {
      const stepIndex = visibleSteps.findIndex((s) => s.status === step.status)
      const currentIndex = visibleSteps.findIndex((s) => s.status === "under_review")

      if (stepIndex < currentIndex) return "completed"
      if (stepIndex === currentIndex) return "rejected"
      return "pending"
    }

    const statusOrder: LoanStatus[] = [
      "draft",
      "kyc_stage2_required",
      "submitted",
      "under_review",
      "pending_loan_officer",
      "pending_md",
      "pending_finance_director",
      "approved",
      "disbursed",
    ]

    const stepIndex = statusOrder.indexOf(step.status)
    const currentIndex = statusOrder.indexOf(currentStatus)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "pending"
  }

  const getStepIcon = (status: "completed" | "current" | "pending" | "rejected") => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "current":
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      {visibleSteps.map((step, index) => {
        const stepStatus = getStepStatus(step)
        const isLast = index === visibleSteps.length - 1

        return (
          <div key={step.status} className="relative">
            {/* Connecting line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[10px] top-8 w-0.5 h-8",
                  stepStatus === "completed" ? "bg-green-600" : "bg-gray-200"
                )}
              />
            )}

            {/* Step content */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">{getStepIcon(stepStatus)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    stepStatus === "completed" && "text-green-900 dark:text-green-100",
                    stepStatus === "current" && "text-blue-900 dark:text-blue-100",
                    stepStatus === "rejected" && "text-red-900 dark:text-red-100",
                    stepStatus === "pending" && "text-gray-500"
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    "text-sm mt-0.5",
                    stepStatus === "completed" && "text-green-700 dark:text-green-300",
                    stepStatus === "current" && "text-blue-700 dark:text-blue-300",
                    stepStatus === "rejected" && "text-red-700 dark:text-red-300",
                    stepStatus === "pending" && "text-gray-400"
                  )}
                >
                  {step.description}
                </p>

                {/* Rejection reason */}
                {stepStatus === "rejected" && rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200">{rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Completed/Defaulted status */}
      {(currentStatus === "completed" || currentStatus === "defaulted") && (
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              {currentStatus === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  currentStatus === "completed"
                    ? "text-green-900 dark:text-green-100"
                    : "text-red-900 dark:text-red-100"
                )}
              >
                {currentStatus === "completed" ? "Loan Completed" : "Loan Defaulted"}
              </p>
              <p
                className={cn(
                  "text-sm mt-0.5",
                  currentStatus === "completed"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                )}
              >
                {currentStatus === "completed"
                  ? "All payments completed successfully"
                  : "Loan payment defaulted"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
