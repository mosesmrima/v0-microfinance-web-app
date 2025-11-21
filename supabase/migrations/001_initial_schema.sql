-- FinFlow Microfinance Platform - Initial Schema
-- This migration creates the core database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE user_role AS ENUM ('borrower', 'institution', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE kyc_document_type AS ENUM ('id', 'proof_of_address', 'income_proof', 'selfie');
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'active', 'completed', 'rejected', 'defaulted');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'crypto', 'mobile_money');
CREATE TYPE fraud_status AS ENUM ('pending', 'reviewed', 'cleared', 'flagged');
CREATE TYPE fraud_action AS ENUM ('approved', 'rejected', 'manual_review');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    national_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    role user_role NOT NULL DEFAULT 'borrower',
    kyc_status kyc_status NOT NULL DEFAULT 'pending',
    credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 850),
    blockchain_address VARCHAR(255) UNIQUE, -- For smart contract linking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_blockchain_address ON profiles(blockchain_address);

-- ============================================================================
-- INSTITUTIONS TABLE
-- ============================================================================
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    license_number VARCHAR(100),
    address TEXT NOT NULL,
    website VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_institutions_profile_id ON institutions(profile_id);
CREATE INDEX idx_institutions_verified ON institutions(verified);

-- ============================================================================
-- LOAN PRODUCTS TABLE
-- ============================================================================
CREATE TABLE loan_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL CHECK (min_amount > 0),
    max_amount DECIMAL(15, 2) NOT NULL CHECK (max_amount >= min_amount),
    min_duration INTEGER NOT NULL CHECK (min_duration > 0), -- months
    max_duration INTEGER NOT NULL CHECK (max_duration >= min_duration), -- months
    interest_rate DECIMAL(5, 2) NOT NULL CHECK (interest_rate >= 0),
    processing_fee DECIMAL(5, 2) DEFAULT 0 CHECK (processing_fee >= 0),
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loan_products_institution_id ON loan_products(institution_id);
CREATE INDEX idx_loan_products_is_active ON loan_products(is_active);

-- ============================================================================
-- LOAN APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES loan_products(id) ON DELETE RESTRICT,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    duration_months INTEGER NOT NULL CHECK (duration_months > 0),
    interest_rate DECIMAL(5, 2) NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    total_repayment DECIMAL(15, 2) NOT NULL,
    purpose TEXT NOT NULL,
    employment_status VARCHAR(100) NOT NULL,
    monthly_income DECIMAL(15, 2) NOT NULL CHECK (monthly_income > 0),
    status loan_status NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    blockchain_tx_hash VARCHAR(255), -- Smart contract transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_product_id ON loan_applications(product_id);
CREATE INDEX idx_loan_applications_institution_id ON loan_applications(institution_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_created_at ON loan_applications(created_at DESC);

-- ============================================================================
-- LOANS TABLE (Active loans)
-- ============================================================================
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES loan_products(id) ON DELETE RESTRICT,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    total_repayment DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    next_payment_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status loan_status NOT NULL DEFAULT 'active',
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_application_id ON loans(application_id);
CREATE INDEX idx_loans_institution_id ON loans(institution_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_next_payment_date ON loans(next_payment_date);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_reference VARCHAR(255) NOT NULL UNIQUE,
    blockchain_tx_hash VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_transaction_reference ON payments(transaction_reference);

-- ============================================================================
-- KYC DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type kyc_document_type NOT NULL,
    document_url TEXT NOT NULL,
    document_number VARCHAR(100),
    status document_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, document_type) -- One document per type per user
);

CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX idx_kyc_documents_uploaded_at ON kyc_documents(uploaded_at DESC);

-- ============================================================================
-- FRAUD DETECTIONS TABLE
-- ============================================================================
CREATE TABLE fraud_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level NOT NULL,
    flags JSONB DEFAULT '[]'::jsonb,
    status fraud_status NOT NULL DEFAULT 'pending',
    action fraud_action,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fraud_detections_loan_application_id ON fraud_detections(loan_application_id);
CREATE INDEX idx_fraud_detections_user_id ON fraud_detections(user_id);
CREATE INDEX idx_fraud_detections_status ON fraud_detections(status);
CREATE INDEX idx_fraud_detections_risk_level ON fraud_detections(risk_level);

-- ============================================================================
-- CREDIT REPORTS TABLE
-- ============================================================================
CREATE TABLE credit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    credit_score INTEGER NOT NULL CHECK (credit_score >= 300 AND credit_score <= 850),
    total_loans INTEGER DEFAULT 0,
    active_loans INTEGER DEFAULT 0,
    completed_loans INTEGER DEFAULT 0,
    defaulted_loans INTEGER DEFAULT 0,
    total_borrowed DECIMAL(15, 2) DEFAULT 0,
    total_repaid DECIMAL(15, 2) DEFAULT 0,
    on_time_payments INTEGER DEFAULT 0,
    late_payments INTEGER DEFAULT 0,
    report_data JSONB DEFAULT '{}'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX idx_credit_reports_generated_at ON credit_reports(generated_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_detections_updated_at BEFORE UPDATE ON fraud_detections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
