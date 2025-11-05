export type UserRole = "borrower" | "institution" | "admin"
export type KYCStatus = "pending" | "verified" | "rejected"
export type LoanStatus = "pending" | "approved" | "rejected" | "active" | "completed" | "defaulted"
export type RiskLevel = "low" | "medium" | "high"

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  kyc_status: KYCStatus
  created_at: string
  updated_at: string
}

export interface Loan {
  id: string
  user_id: string
  institution_id?: string
  amount: number
  interest_rate: number
  duration_months: number
  status: LoanStatus
  purpose?: string
  monthly_payment?: number
  created_at: string
  updated_at: string
}

export interface LoanProduct {
  id: string
  institution_id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  interest_rate: number
  duration_months: number
  requirements?: string
  created_at: string
}

export interface KYCDocument {
  id: string
  user_id: string
  document_type: "id" | "proof_of_address" | "income_proof"
  document_url: string
  status: "pending" | "verified" | "rejected"
  rejection_reason?: string
  uploaded_at: string
  verified_at?: string
}

export interface FraudDetection {
  id: string
  loan_id: string
  user_id: string
  risk_score: number
  risk_level: RiskLevel
  flags: string[]
  flagged_at: string
  reviewed_at?: string
  reviewed_by?: string
  action?: "approved" | "rejected" | "manual_review"
}

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

export interface BlockchainTransaction {
  id: string
  user_id: string
  payment_id: string
  transaction_hash: string
  amount: number
  status: "pending" | "confirmed" | "failed"
  blockchain_network: "ethereum" | "off-chain"
  created_at: string
  updated_at: string
}
