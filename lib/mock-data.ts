// Mock data for frontend-only development with complete 2-stage KYC workflow

import {
  Profile,
  Loan,
  LoanProduct,
  KYCDocument,
  FraudDetection,
  Payment,
  PaymentSchedule,
  SystemAnalytics,
  Notification,
} from "./types"

// ============================================
// PROFILES (From hardcoded-users.json)
// ============================================

export const mockProfiles: Profile[] = [
  {
    id: "borrower-1",
    email: "borrower@test.com",
    first_name: "John",
    last_name: "Doe",
    phone: "+1234567890",
    role: "borrower",
    kyc_status: "verified",
    kyc_stage1_completed: true,
    kyc_stage1_status: "verified",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "borrower-2",
    email: "newuser@test.com",
    first_name: "Jane",
    last_name: "Smith",
    phone: "+1234567899",
    role: "borrower",
    kyc_status: "pending",
    kyc_stage1_completed: false,
    kyc_stage1_status: "pending",
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
  },
]

// ============================================
// LOAN PRODUCTS
// ============================================

export const mockLoanProducts: LoanProduct[] = [
  {
    id: "prod-001",
    name: "Personal Loan",
    description: "Quick personal loans for any purpose",
    min_amount: 1000,
    max_amount: 50000,
    interest_rate: 8.5,
    duration_months: 12,
    requirements: "Valid ID, Proof of income",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-002",
    name: "Business Loan",
    description: "Loans for small business expansion",
    min_amount: 5000,
    max_amount: 100000,
    interest_rate: 7.5,
    duration_months: 24,
    requirements: "Business registration, Tax returns",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-003",
    name: "Education Loan",
    description: "Finance your education dreams",
    min_amount: 2000,
    max_amount: 75000,
    interest_rate: 6.5,
    duration_months: 48,
    requirements: "Admission letter, Income proof",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-004",
    name: "Emergency Loan",
    description: "Quick cash for emergencies",
    min_amount: 500,
    max_amount: 10000,
    interest_rate: 12.0,
    duration_months: 6,
    requirements: "Valid ID only",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-005",
    name: "Home Improvement Loan",
    description: "Upgrade your living space",
    min_amount: 3000,
    max_amount: 75000,
    interest_rate: 7.0,
    duration_months: 36,
    requirements: "Property documents, Income proof",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-006",
    name: "Debt Consolidation",
    description: "Consolidate multiple debts into one",
    min_amount: 5000,
    max_amount: 100000,
    interest_rate: 6.8,
    duration_months: 60,
    requirements: "Credit report, Income proof",
    created_at: "2024-01-01T00:00:00Z",
  },
]

// ============================================
// LOANS
// ============================================

export const mockLoans: Loan[] = [
  // Active loan for borrower-1 (< $10K - handled by officer)
  {
    id: "loan-001",
    user_id: "borrower-1",
    amount: 5000,
    interest_rate: 8.5,
    duration_months: 12,
    status: "active",
    purpose: "Home renovation",
    monthly_payment: 438.5,
    assigned_to: "officer-1",
    reviewed_by: "officer-1",
    approved_by: "officer-1",
    officer_notes: "All documents verified. Good credit history.",
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-05T10:00:00Z",
    submitted_at: "2024-06-01T10:00:00Z",
    approved_at: "2024-06-05T10:00:00Z",
  },
  // Completed loan for borrower-1
  {
    id: "loan-002",
    user_id: "borrower-1",
    amount: 2000,
    interest_rate: 7.5,
    duration_months: 6,
    status: "completed",
    purpose: "Medical expenses",
    monthly_payment: 340,
    assigned_to: "officer-1",
    reviewed_by: "officer-1",
    approved_by: "officer-1",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-07-01T10:00:00Z",
    submitted_at: "2024-01-01T10:00:00Z",
    approved_at: "2024-01-05T10:00:00Z",
  },
  // Pending loan for officer review (< $10K)
  {
    id: "loan-003",
    user_id: "borrower-1",
    amount: 8000,
    interest_rate: 8.5,
    duration_months: 18,
    status: "pending_loan_officer",
    purpose: "Business equipment",
    monthly_payment: 482.5,
    assigned_to: "officer-1",
    created_at: "2024-10-20T10:00:00Z",
    updated_at: "2024-10-20T10:00:00Z",
    submitted_at: "2024-10-20T10:00:00Z",
  },
  // High-value loan for manager review (≥ $10K)
  {
    id: "loan-004",
    user_id: "borrower-1",
    amount: 15000,
    interest_rate: 7.5,
    duration_months: 24,
    status: "pending_loan_manager",
    purpose: "Business expansion",
    monthly_payment: 702.5,
    assigned_to: "manager-1",
    officer_notes: "Pre-approved by loan officer. Excellent credit score.",
    created_at: "2024-10-25T10:00:00Z",
    updated_at: "2024-10-26T10:00:00Z",
    submitted_at: "2024-10-25T10:00:00Z",
  },
]

// ============================================
// KYC DOCUMENTS (2-Stage)
// ============================================

export const mockKYCDocuments: KYCDocument[] = [
  // Stage 1 documents for borrower-1 (verified)
  {
    id: "kyc-001",
    user_id: "borrower-1",
    stage: "stage1",
    document_type: "national_id",
    document_url: "/id-document.png",
    status: "verified",
    uploaded_at: "2024-01-10T10:00:00Z",
    verified_at: "2024-01-12T10:00:00Z",
    verified_by: "officer-1",
  },
  {
    id: "kyc-002",
    user_id: "borrower-1",
    stage: "stage1",
    document_type: "proof_of_residence",
    document_url: "/address-proof.jpg",
    status: "verified",
    uploaded_at: "2024-01-11T10:00:00Z",
    verified_at: "2024-01-13T10:00:00Z",
    verified_by: "officer-1",
  },
  // Stage 2 documents for borrower-1's first loan (verified)
  {
    id: "kyc-003",
    user_id: "borrower-1",
    stage: "stage2",
    document_type: "payslip",
    document_url: "/income-proof.jpg",
    status: "verified",
    loan_application_id: "loan-001",
    uploaded_at: "2024-06-01T10:00:00Z",
    verified_at: "2024-06-02T10:00:00Z",
    verified_by: "officer-1",
  },
  {
    id: "kyc-004",
    user_id: "borrower-1",
    stage: "stage2",
    document_type: "bank_statement",
    document_url: "/bank-statement.pdf",
    status: "verified",
    loan_application_id: "loan-001",
    uploaded_at: "2024-06-01T10:00:00Z",
    verified_at: "2024-06-02T10:00:00Z",
    verified_by: "officer-1",
  },
  // Stage 2 documents for borrower-1's pending loan (pending review)
  {
    id: "kyc-005",
    user_id: "borrower-1",
    stage: "stage2",
    document_type: "payslip",
    document_url: "/payslip-oct.pdf",
    status: "pending",
    loan_application_id: "loan-003",
    uploaded_at: "2024-10-20T10:00:00Z",
  },
  {
    id: "kyc-006",
    user_id: "borrower-1",
    stage: "stage2",
    document_type: "employment_letter",
    document_url: "/employment-letter.pdf",
    status: "pending",
    loan_application_id: "loan-003",
    uploaded_at: "2024-10-20T10:00:00Z",
  },
  // Stage 1 documents for borrower-2 (pending)
  {
    id: "kyc-007",
    user_id: "borrower-2",
    stage: "stage1",
    document_type: "passport",
    document_url: "/passport.jpg",
    status: "pending",
    uploaded_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "kyc-008",
    user_id: "borrower-2",
    stage: "stage1",
    document_type: "proof_of_residence",
    document_url: "/utility-bill.pdf",
    status: "pending",
    uploaded_at: "2024-02-01T10:00:00Z",
  },
]

// ============================================
// FRAUD DETECTION
// ============================================

export const mockFraudAlerts: FraudDetection[] = [
  {
    id: "fraud-001",
    loan_id: "loan-003",
    user_id: "borrower-1",
    risk_score: 35,
    risk_level: "low",
    flags: ["Multiple applications in 6 months"],
    flagged_at: "2024-10-20T10:00:00Z",
  },
  {
    id: "fraud-002",
    loan_id: "loan-004",
    user_id: "borrower-1",
    risk_score: 45,
    risk_level: "medium",
    flags: ["High loan amount", "Multiple active loans"],
    flagged_at: "2024-10-25T10:00:00Z",
  },
]

// ============================================
// PAYMENTS & SCHEDULES
// ============================================

export const mockPayments: Payment[] = [
  {
    id: "pay-001",
    user_id: "borrower-1",
    loan_id: "loan-001",
    amount: 438.5,
    payment_method: "card",
    status: "completed",
    created_at: "2024-10-01T10:00:00Z",
    updated_at: "2024-10-01T10:05:00Z",
  },
  {
    id: "pay-002",
    user_id: "borrower-1",
    loan_id: "loan-001",
    amount: 438.5,
    payment_method: "bank_transfer",
    status: "completed",
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-09-01T10:05:00Z",
  },
  {
    id: "pay-003",
    user_id: "borrower-1",
    loan_id: "loan-001",
    amount: 438.5,
    payment_method: "crypto",
    status: "completed",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-01T10:05:00Z",
  },
]

export const mockPaymentSchedules: PaymentSchedule[] = [
  // For loan-001 (12 months)
  {
    id: "schedule-001",
    loan_id: "loan-001",
    user_id: "borrower-1",
    installment_number: 1,
    due_date: "2024-07-01",
    amount: 438.5,
    principal: 400,
    interest: 38.5,
    status: "paid",
    paid_amount: 438.5,
    paid_date: "2024-06-28",
  },
  {
    id: "schedule-002",
    loan_id: "loan-001",
    user_id: "borrower-1",
    installment_number: 2,
    due_date: "2024-08-01",
    amount: 438.5,
    principal: 403,
    interest: 35.5,
    status: "paid",
    paid_amount: 438.5,
    paid_date: "2024-08-01",
  },
  {
    id: "schedule-003",
    loan_id: "loan-001",
    user_id: "borrower-1",
    installment_number: 3,
    due_date: "2024-09-01",
    amount: 438.5,
    principal: 406,
    interest: 32.5,
    status: "paid",
    paid_amount: 438.5,
    paid_date: "2024-09-01",
  },
  {
    id: "schedule-004",
    loan_id: "loan-001",
    user_id: "borrower-1",
    installment_number: 4,
    due_date: "2024-10-01",
    amount: 438.5,
    principal: 409,
    interest: 29.5,
    status: "paid",
    paid_amount: 438.5,
    paid_date: "2024-10-01",
  },
  {
    id: "schedule-005",
    loan_id: "loan-001",
    user_id: "borrower-1",
    installment_number: 5,
    due_date: "2024-11-01",
    amount: 438.5,
    principal: 412,
    interest: 26.5,
    status: "pending",
  },
  {
    id: "schedule-006",
    loan_id: "loan-001",
    user_id: "borrower-1",
    installment_number: 6,
    due_date: "2024-12-01",
    amount: 438.5,
    principal: 415,
    interest: 23.5,
    status: "pending",
  },
]

// ============================================
// SYSTEM ANALYTICS
// ============================================

export const mockSystemAnalytics: SystemAnalytics = {
  total_users: 1256,
  total_borrowers: 1200,
  total_loan_officers: 45,
  total_loan_managers: 10,
  total_admins: 1,
  total_loans: 2840,
  total_disbursement_amount: 28500000,
  total_active_loans: 1856,
  total_completed_loans: 920,
  total_defaulted_loans: 64,
  average_loan_amount: 10035,
  approval_rate: 76.5,
  kyc_approval_rate: 89.3,
  fraud_detection_rate: 3.2,
  average_processing_days: 2.5,
  pending_applications: 127,
  pending_kyc_reviews: 89,
  active_fraud_alerts: 12,
  last_updated: "2024-10-30T10:00:00Z",
}

// ============================================
// NOTIFICATIONS
// ============================================

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    user_id: "borrower-1",
    type: "application_status",
    title: "Loan Application Approved",
    message: "Your personal loan application of $5,000 has been approved!",
    read: false,
    created_at: "2024-06-05T10:00:00Z",
    action_url: "/dashboard/applications/loan-001",
  },
  {
    id: "notif-002",
    user_id: "borrower-1",
    type: "payment_due",
    title: "Payment Due Soon",
    message: "Your next payment of $438.50 is due on November 1st.",
    read: false,
    created_at: "2024-10-25T10:00:00Z",
    action_url: "/dashboard/payments",
  },
  {
    id: "notif-003",
    user_id: "officer-1",
    type: "new_application",
    title: "New Loan Application",
    message: "A new loan application of $8,000 requires your review.",
    read: false,
    created_at: "2024-10-20T10:00:00Z",
    action_url: "/loan-officer/applications/loan-003",
  },
  {
    id: "notif-004",
    user_id: "officer-1",
    type: "fraud_alert",
    title: "Fraud Alert",
    message: "Medium risk detected on loan application #loan-004.",
    read: false,
    created_at: "2024-10-25T10:00:00Z",
    action_url: "/loan-officer/fraud-alerts",
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getMockProfileById(id: string): Profile | undefined {
  return mockProfiles.find((p) => p.id === id)
}

export function getMockLoansByUserId(userId: string): Loan[] {
  return mockLoans.filter((l) => l.user_id === userId)
}

export function getMockKYCDocumentsByUserId(userId: string): KYCDocument[] {
  return mockKYCDocuments.filter((d) => d.user_id === userId)
}

export function getMockKYCDocumentsByStage(stage: "stage1" | "stage2"): KYCDocument[] {
  return mockKYCDocuments.filter((d) => d.stage === stage)
}

export function getMockPaymentScheduleByLoanId(loanId: string): PaymentSchedule[] {
  return mockPaymentSchedules.filter((s) => s.loan_id === loanId)
}

export function getMockNotificationsByUserId(userId: string): Notification[] {
  return mockNotifications.filter((n) => n.user_id === userId)
}
