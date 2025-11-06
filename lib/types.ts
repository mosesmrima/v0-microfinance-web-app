// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = "borrower" | "loan_officer" | "loan_manager" | "admin"
export type KYCStatus = "pending" | "verified" | "rejected"
export type RiskLevel = "low" | "medium" | "high"

// ============================================
// KYC TYPES
// ============================================

export type KYCStage = "stage1" | "stage2"

// Stage 1: Identity verification (one-time, doesn't change)
export type Stage1DocumentType =
  | "national_id"
  | "passport"
  | "drivers_license"
  | "proof_of_residence"

// Stage 2: Income verification (per loan application, can expire)
export type Stage2DocumentType =
  | "payslip"
  | "bank_statement"
  | "employment_letter"
  | "tax_return"

export type DocumentType = Stage1DocumentType | Stage2DocumentType

// ============================================
// LOAN TYPES
// ============================================

export type LoanStatus =
  | "draft"                    // User filling application
  | "kyc_stage2_required"      // Waiting for income documents
  | "submitted"                // Application submitted
  | "under_review"             // Being reviewed
  | "fraud_check"              // Fraud detection in progress
  | "pending_loan_officer"     // Waiting for loan officer (< $10K)
  | "pending_loan_manager"     // Waiting for loan manager (≥ $10K)
  | "approved"                 // Approved, ready to disburse
  | "rejected"                 // Rejected
  | "active"                   // Loan disbursed, payments ongoing
  | "completed"                // Fully paid
  | "defaulted"                // Payment default

// ============================================
// PROFILE INTERFACE
// ============================================

export interface Profile {
  id: string
  email: string
  password?: string  // For hardcoded auth only
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  kyc_status: KYCStatus
  kyc_stage1_completed: boolean
  kyc_stage1_status: KYCStatus
  created_at: string
  updated_at: string
}

// ============================================
// LOAN INTERFACES
// ============================================

export interface Loan {
  id: string
  user_id: string
  amount: number
  interest_rate: number
  duration_months: number
  status: LoanStatus
  purpose?: string
  monthly_payment?: number

  // Approval tracking
  assigned_to?: string  // loan_officer or loan_manager ID
  reviewed_by?: string  // Who reviewed it
  approved_by?: string  // Who approved it
  rejection_reason?: string
  officer_notes?: string
  manager_notes?: string

  // Timestamps
  created_at: string
  updated_at: string
  submitted_at?: string
  approved_at?: string
  rejected_at?: string
}

export interface LoanProduct {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  interest_rate: number
  min_duration: number
  max_duration: number
  requirements?: string
  created_at: string
}

// ============================================
// KYC DOCUMENT INTERFACE
// ============================================

export interface KYCDocument {
  id: string
  user_id: string
  stage: KYCStage
  document_type: DocumentType
  document_url: string
  status: "pending" | "verified" | "rejected"
  rejection_reason?: string
  uploaded_at: string
  verified_at?: string
  verified_by?: string  // ID of officer who verified
  loan_application_id?: string  // Links stage2 docs to specific loan
  expires_at?: string  // Stage 2 docs may expire
}

// ============================================
// FRAUD DETECTION INTERFACE
// ============================================

export interface FraudDetection {
  id: string
  loan_id: string
  user_id: string
  risk_score: number  // 0-100
  risk_level: RiskLevel
  flags: string[]
  flagged_at: string
  reviewed_at?: string
  reviewed_by?: string
  action?: "approved" | "rejected" | "manual_review"
  resolution_notes?: string
}

// ============================================
// PAYMENT INTERFACES
// ============================================

export interface Payment {
  id: string
  user_id: string
  loan_id: string
  amount: number
  payment_method: "card" | "bank_transfer" | "crypto"
  status: "pending" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface PaymentSchedule {
  id: string
  loan_id: string
  user_id: string
  installment_number: number
  due_date: string
  amount: number
  principal: number
  interest: number
  status: "pending" | "paid" | "overdue" | "partial"
  paid_amount?: number
  paid_date?: string
  late_fee?: number
}

export interface BlockchainTransaction {
  id: string
  user_id: string
  payment_id: string
  transaction_hash: string
  amount: number
  status: "pending" | "confirmed" | "failed"
  blockchain_network: "ethereum" | "polygon" | "off-chain"
  created_at: string
  updated_at: string
}

// ============================================
// ANALYTICS INTERFACE
// ============================================

export interface SystemAnalytics {
  // User statistics
  total_users: number
  total_borrowers: number
  total_loan_officers: number
  total_loan_managers: number
  total_admins: number

  // Loan statistics
  total_loans: number
  total_disbursement_amount: number
  total_active_loans: number
  total_completed_loans: number
  total_defaulted_loans: number
  average_loan_amount: number

  // Approval metrics
  approval_rate: number  // Percentage
  kyc_approval_rate: number  // Percentage
  fraud_detection_rate: number  // Percentage
  average_processing_days: number

  // Current status
  pending_applications: number
  pending_kyc_reviews: number
  active_fraud_alerts: number

  last_updated: string
}

// ============================================
// NOTIFICATION INTERFACE
// ============================================

export interface Notification {
  id: string
  user_id: string
  type: "application_status" | "kyc_status" | "payment_due" | "fraud_alert" | "new_application" | "system"
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
}

// ============================================
// UTILITY TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
