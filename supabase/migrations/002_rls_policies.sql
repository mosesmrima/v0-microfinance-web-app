-- Row Level Security Policies
-- This migration sets up security policies for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Institutions can view borrower profiles (for loan management)
CREATE POLICY "Institutions can view borrower profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'institution'
        )
        AND role = 'borrower'
    );

-- ============================================================================
-- INSTITUTIONS POLICIES
-- ============================================================================

-- Institutions can view their own data
CREATE POLICY "Institutions can view own data"
    ON institutions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = institutions.profile_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Institutions can update their own data
CREATE POLICY "Institutions can update own data"
    ON institutions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = institutions.profile_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all institutions
CREATE POLICY "Admins can view all institutions"
    ON institutions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Everyone can view verified institutions
CREATE POLICY "Anyone can view verified institutions"
    ON institutions FOR SELECT
    USING (verified = true);

-- ============================================================================
-- LOAN PRODUCTS POLICIES
-- ============================================================================

-- Everyone can view active loan products
CREATE POLICY "Anyone can view active loan products"
    ON loan_products FOR SELECT
    USING (is_active = true);

-- Institutions can manage their own products
CREATE POLICY "Institutions can manage own products"
    ON loan_products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM institutions
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE institutions.id = loan_products.institution_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all products
CREATE POLICY "Admins can view all products"
    ON loan_products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- LOAN APPLICATIONS POLICIES
-- ============================================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
    ON loan_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = loan_applications.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Users can create applications
CREATE POLICY "Users can create applications"
    ON loan_applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = loan_applications.user_id
            AND profiles.user_id = auth.uid()
            AND profiles.role = 'borrower'
        )
    );

-- Institutions can view applications for their products
CREATE POLICY "Institutions can view own applications"
    ON loan_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM institutions
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE institutions.id = loan_applications.institution_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Institutions can update applications for their products
CREATE POLICY "Institutions can update own applications"
    ON loan_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM institutions
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE institutions.id = loan_applications.institution_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
    ON loan_applications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- LOANS POLICIES
-- ============================================================================

-- Users can view their own loans
CREATE POLICY "Users can view own loans"
    ON loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = loans.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Institutions can view loans for their products
CREATE POLICY "Institutions can view own loans"
    ON loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM institutions
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE institutions.id = loans.institution_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Institutions can update loans for their products
CREATE POLICY "Institutions can update own loans"
    ON loans FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM institutions
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE institutions.id = loans.institution_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all loans
CREATE POLICY "Admins can view all loans"
    ON loans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = payments.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Users can create payments for their loans
CREATE POLICY "Users can create payments"
    ON payments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = payments.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Institutions can view payments for their loans
CREATE POLICY "Institutions can view payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM loans
            JOIN institutions ON institutions.id = loans.institution_id
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE loans.id = payments.loan_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- KYC DOCUMENTS POLICIES
-- ============================================================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
    ON kyc_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = kyc_documents.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Users can upload documents
CREATE POLICY "Users can upload documents"
    ON kyc_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = kyc_documents.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
    ON kyc_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- FRAUD DETECTIONS POLICIES
-- ============================================================================

-- Admins can view all fraud detections
CREATE POLICY "Admins can view all fraud detections"
    ON fraud_detections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Institutions can view fraud detections for their applications
CREATE POLICY "Institutions can view own fraud detections"
    ON fraud_detections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM loan_applications
            JOIN institutions ON institutions.id = loan_applications.institution_id
            JOIN profiles ON profiles.id = institutions.profile_id
            WHERE loan_applications.id = fraud_detections.loan_application_id
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================================
-- CREDIT REPORTS POLICIES
-- ============================================================================

-- Users can view their own credit reports
CREATE POLICY "Users can view own credit reports"
    ON credit_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = credit_reports.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Institutions can view credit reports (for loan decisions)
CREATE POLICY "Institutions can view credit reports"
    ON credit_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'institution'
        )
    );

-- Admins can view all credit reports
CREATE POLICY "Admins can view all credit reports"
    ON credit_reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
