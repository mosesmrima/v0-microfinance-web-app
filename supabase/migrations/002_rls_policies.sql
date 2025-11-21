-- Row Level Security Policies - Simplified
-- Basic security for essential tables only

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view and update their own profile
CREATE POLICY "Users manage own profile"
    ON profiles FOR ALL
    USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins full access"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- INSTITUTIONS POLICIES
-- ============================================================================

-- Everyone can view verified institutions
CREATE POLICY "View verified institutions"
    ON institutions FOR SELECT
    USING (verified = true OR auth.uid() IS NOT NULL);

-- ============================================================================
-- LOAN PRODUCTS POLICIES
-- ============================================================================

-- Everyone can view active products
CREATE POLICY "View active products"
    ON loan_products FOR SELECT
    USING (is_active = true OR auth.uid() IS NOT NULL);

-- ============================================================================
-- LOANS POLICIES
-- ============================================================================

-- Users can view their own loans
CREATE POLICY "Users view own loans"
    ON loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = loans.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Users can create loans
CREATE POLICY "Users create loans"
    ON loans FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = loans.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Users can view and create their own payments
CREATE POLICY "Users manage own payments"
    ON payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = payments.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- ============================================================================
-- KYC DOCUMENTS POLICIES
-- ============================================================================

-- Users can view and upload their own documents
CREATE POLICY "Users manage own documents"
    ON kyc_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = kyc_documents.user_id
            AND profiles.user_id = auth.uid()
        )
    );

-- Admins can view all documents
CREATE POLICY "Admins view all documents"
    ON kyc_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
