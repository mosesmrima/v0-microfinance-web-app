// Database types for Supabase - Simplified
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: UserRole
          kyc_status: KYCStatus
          credit_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role?: UserRole
          kyc_status?: KYCStatus
          credit_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: UserRole
          kyc_status?: KYCStatus
          credit_score?: number | null
          created_at?: string
        }
      }
      institutions: {
        Row: {
          id: string
          profile_id: string
          institution_name: string
          registration_number: string
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          institution_name: string
          registration_number: string
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          institution_name?: string
          registration_number?: string
          verified?: boolean
          created_at?: string
        }
      }
      loan_products: {
        Row: {
          id: string
          institution_id: string
          name: string
          description: string
          min_amount: number
          max_amount: number
          min_duration: number
          max_duration: number
          interest_rate: number
          is_active: boolean
          created_at: string
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
          is_active?: boolean
          created_at?: string
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
          is_active?: boolean
          created_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          user_id: string
          product_id: string
          institution_id: string
          amount: number
          duration_months: number
          interest_rate: number
          monthly_payment: number
          total_repayment: number
          paid_amount: number
          status: LoanStatus
          created_at: string
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
          paid_amount?: number
          status?: LoanStatus
          created_at?: string
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
          paid_amount?: number
          status?: LoanStatus
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          loan_id: string
          user_id: string
          amount: number
          payment_method: PaymentMethod
          status: PaymentStatus
          transaction_reference: string
          created_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          user_id: string
          amount: number
          payment_method: PaymentMethod
          status?: PaymentStatus
          transaction_reference: string
          created_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          user_id?: string
          amount?: number
          payment_method?: PaymentMethod
          status?: PaymentStatus
          transaction_reference?: string
          created_at?: string
        }
      }
      kyc_documents: {
        Row: {
          id: string
          user_id: string
          document_type: KYCDocumentType
          document_url: string
          status: DocumentStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: KYCDocumentType
          document_url: string
          status?: DocumentStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: KYCDocumentType
          document_url?: string
          status?: DocumentStatus
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
    }
  }
}
