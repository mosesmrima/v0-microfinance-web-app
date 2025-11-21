// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'borrower' | 'institution' | 'admin'
export type KYCStatus = 'pending' | 'verified' | 'rejected'
export type KYCDocumentType = 'id' | 'proof_of_address' | 'income_proof' | 'selfie'
export type DocumentStatus = 'pending' | 'verified' | 'rejected'
export type LoanStatus = 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'defaulted'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type PaymentMethod = 'card' | 'bank_transfer' | 'crypto' | 'mobile_money'
export type FraudStatus = 'pending' | 'reviewed' | 'cleared' | 'flagged'
export type FraudAction = 'approved' | 'rejected' | 'manual_review'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string // References auth.users
          first_name: string
          last_name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          national_id: string | null
          address: string | null
          city: string | null
          country: string | null
          role: UserRole
          kyc_status: KYCStatus
          credit_score: number | null
          blockchain_address: string | null // For smart contract linking
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          national_id?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          role?: UserRole
          kyc_status?: KYCStatus
          credit_score?: number | null
          blockchain_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          national_id?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          role?: UserRole
          kyc_status?: KYCStatus
          credit_score?: number | null
          blockchain_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      institutions: {
        Row: {
          id: string
          profile_id: string // References profiles
          institution_name: string
          registration_number: string
          license_number: string | null
          address: string
          website: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          institution_name: string
          registration_number: string
          license_number?: string | null
          address: string
          website?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          institution_name?: string
          registration_number?: string
          license_number?: string | null
          address?: string
          website?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      loan_products: {
        Row: {
          id: string
          institution_id: string // References institutions
          name: string
          description: string
          min_amount: number
          max_amount: number
          min_duration: number // months
          max_duration: number // months
          interest_rate: number // percentage
          processing_fee: number // percentage
          features: string[] // JSON array
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          name: string
          description: string
          min_amount: number
          max_amount: number
          min_duration: number
          max_duration: number
          interest_rate: number
          processing_fee?: number
          features?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          description?: string
          min_amount?: number
          max_amount?: number
          min_duration?: number
          max_duration?: number
          interest_rate?: number
          processing_fee?: number
          features?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      loan_applications: {
        Row: {
          id: string
          user_id: string // References profiles
          product_id: string // References loan_products
          institution_id: string // References institutions
          amount: number
          duration_months: number
          interest_rate: number
          monthly_payment: number
          total_repayment: number
          purpose: string
          employment_status: string
          monthly_income: number
          status: LoanStatus
          approved_by: string | null // References profiles (admin/institution)
          approved_at: string | null
          rejection_reason: string | null
          blockchain_tx_hash: string | null // Smart contract transaction
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          institution_id: string
          amount: number
          duration_months: number
          interest_rate: number
          monthly_payment: number
          total_repayment: number
          purpose: string
          employment_status: string
          monthly_income: number
          status?: LoanStatus
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          institution_id?: string
          amount?: number
          duration_months?: number
          interest_rate?: number
          monthly_payment?: number
          total_repayment?: number
          purpose?: string
          employment_status?: string
          monthly_income?: number
          status?: LoanStatus
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          application_id: string // References loan_applications
          user_id: string
          product_id: string
          institution_id: string
          amount: number
          duration_months: number
          interest_rate: number
          monthly_payment: number
          total_repayment: number
          paid_amount: number
          outstanding_amount: number
          next_payment_date: string
          start_date: string
          end_date: string
          status: LoanStatus
          blockchain_tx_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          user_id: string
          product_id: string
          institution_id: string
          amount: number
          duration_months: number
          interest_rate: number
          monthly_payment: number
          total_repayment: number
          paid_amount?: number
          outstanding_amount: number
          next_payment_date: string
          start_date: string
          end_date: string
          status?: LoanStatus
          blockchain_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          user_id?: string
          product_id?: string
          institution_id?: string
          amount?: number
          duration_months?: number
          interest_rate?: number
          monthly_payment?: number
          total_repayment?: number
          paid_amount?: number
          outstanding_amount?: number
          next_payment_date?: string
          start_date?: string
          end_date?: string
          status?: LoanStatus
          blockchain_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          loan_id: string // References loans
          user_id: string
          amount: number
          payment_method: PaymentMethod
          status: PaymentStatus
          transaction_reference: string
          blockchain_tx_hash: string | null
          payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          user_id: string
          amount: number
          payment_method: PaymentMethod
          status?: PaymentStatus
          transaction_reference: string
          blockchain_tx_hash?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          user_id?: string
          amount?: number
          payment_method?: PaymentMethod
          status?: PaymentStatus
          transaction_reference?: string
          blockchain_tx_hash?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      kyc_documents: {
        Row: {
          id: string
          user_id: string
          document_type: KYCDocumentType
          document_url: string
          document_number: string | null
          status: DocumentStatus
          verified_by: string | null // References profiles (admin)
          verified_at: string | null
          rejection_reason: string | null
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: KYCDocumentType
          document_url: string
          document_number?: string | null
          status?: DocumentStatus
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: KYCDocumentType
          document_url?: string
          document_number?: string | null
          status?: DocumentStatus
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      fraud_detections: {
        Row: {
          id: string
          loan_application_id: string // References loan_applications
          user_id: string
          risk_score: number
          risk_level: RiskLevel
          flags: string[] // JSON array
          status: FraudStatus
          action: FraudAction | null
          reviewed_by: string | null // References profiles (admin)
          reviewed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          loan_application_id: string
          user_id: string
          risk_score: number
          risk_level: RiskLevel
          flags: string[]
          status?: FraudStatus
          action?: FraudAction | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          loan_application_id?: string
          user_id?: string
          risk_score?: number
          risk_level?: RiskLevel
          flags?: string[]
          status?: FraudStatus
          action?: FraudAction | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_reports: {
        Row: {
          id: string
          user_id: string
          credit_score: number
          total_loans: number
          active_loans: number
          completed_loans: number
          defaulted_loans: number
          total_borrowed: number
          total_repaid: number
          on_time_payments: number
          late_payments: number
          report_data: Json // Detailed credit report
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credit_score: number
          total_loans: number
          active_loans: number
          completed_loans: number
          defaulted_loans: number
          total_borrowed: number
          total_repaid: number
          on_time_payments: number
          late_payments: number
          report_data?: Json
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credit_score?: number
          total_loans?: number
          active_loans?: number
          completed_loans?: number
          defaulted_loans?: number
          total_borrowed?: number
          total_repaid?: number
          on_time_payments?: number
          late_payments?: number
          report_data?: Json
          generated_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      kyc_status: KYCStatus
      kyc_document_type: KYCDocumentType
      document_status: DocumentStatus
      loan_status: LoanStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      fraud_status: FraudStatus
      fraud_action: FraudAction
      risk_level: RiskLevel
    }
  }
}
