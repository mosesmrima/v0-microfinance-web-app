-- Seed Data for FinFlow Microfinance Platform
-- This creates demo users and sample data for testing

-- NOTE: Before running this, you need to create users in Supabase Auth
-- The user_id fields below should match the auth.users.id values

-- ============================================================================
-- DEMO USERS (Replace UUIDs with actual Supabase Auth user IDs)
-- ============================================================================

-- Demo Borrower
INSERT INTO profiles (
    id, user_id, first_name, last_name, email, phone,
    date_of_birth, national_id, address, city, country,
    role, kyc_status, credit_score, blockchain_address
) VALUES (
    'a1b2c3d4-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001', -- Replace with actual auth user ID
    'John',
    'Doe',
    'john.doe@example.com',
    '+1 (555) 123-4567',
    '1990-05-15',
    'ID-123456789',
    '123 Main Street',
    'New York',
    'USA',
    'borrower',
    'verified',
    720,
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1'
);

-- Demo Institution
INSERT INTO profiles (
    id, user_id, first_name, last_name, email, phone,
    role, kyc_status, blockchain_address
) VALUES (
    'a1b2c3d4-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000002', -- Replace with actual auth user ID
    'Jane',
    'Smith',
    'admin@finflow.com',
    '+1 (555) 987-6543',
    'institution',
    'verified',
    '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
);

-- Demo Admin
INSERT INTO profiles (
    id, user_id, first_name, last_name, email, phone,
    role, kyc_status, blockchain_address
) VALUES (
    'a1b2c3d4-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000003', -- Replace with actual auth user ID
    'Admin',
    'User',
    'admin@finflow.com',
    '+1 (555) 555-5555',
    'admin',
    'verified',
    '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'
);

-- Additional Borrowers for testing
INSERT INTO profiles (
    id, user_id, first_name, last_name, email, role, kyc_status, credit_score
) VALUES
    (
        'a1b2c3d4-4444-4444-4444-444444444444',
        '00000000-0000-0000-0000-000000000004',
        'Alice',
        'Johnson',
        'alice.johnson@example.com',
        'borrower',
        'verified',
        680
    ),
    (
        'a1b2c3d4-5555-5555-5555-555555555555',
        '00000000-0000-0000-0000-000000000005',
        'Bob',
        'Williams',
        'bob.williams@example.com',
        'borrower',
        'pending',
        NULL
    );

-- ============================================================================
-- INSTITUTION DATA
-- ============================================================================

INSERT INTO institutions (
    id, profile_id, institution_name, registration_number,
    license_number, address, website, verified
) VALUES (
    'inst-1111-1111-1111-111111111111',
    'a1b2c3d4-2222-2222-2222-222222222222',
    'FinFlow Microfinance',
    'REG-2023-001',
    'LIC-MF-2023-001',
    '456 Financial District, New York, NY 10004',
    'https://finflow.com',
    true
);

-- ============================================================================
-- LOAN PRODUCTS
-- ============================================================================

INSERT INTO loan_products (
    id, institution_id, name, description,
    min_amount, max_amount, min_duration, max_duration,
    interest_rate, processing_fee, features, is_active
) VALUES
    (
        'prod-0001-0001-0001-000000000001',
        'inst-1111-1111-1111-111111111111',
        'Personal Loan',
        'Quick personal loans for any purpose',
        1000.00, 50000.00, 3, 60, 8.5, 2.0,
        '["Fast approval", "Flexible repayment", "No collateral required"]',
        true
    ),
    (
        'prod-0002-0002-0002-000000000002',
        'inst-1111-1111-1111-111111111111',
        'Business Loan',
        'Loans for small business expansion',
        5000.00, 100000.00, 6, 84, 7.5, 1.5,
        '["Business growth", "Competitive rates", "Quick disbursement"]',
        true
    ),
    (
        'prod-0003-0003-0003-000000000003',
        'inst-1111-1111-1111-111111111111',
        'Education Loan',
        'Finance your education dreams',
        2000.00, 75000.00, 12, 120, 6.5, 1.0,
        '["Education focused", "Grace period", "Low interest"]',
        true
    ),
    (
        'prod-0004-0004-0004-000000000004',
        'inst-1111-1111-1111-111111111111',
        'Emergency Loan',
        'Quick cash for emergencies',
        500.00, 10000.00, 1, 12, 12.0, 3.0,
        '["Instant approval", "Same day disbursement", "Minimal documentation"]',
        true
    ),
    (
        'prod-0005-0005-0005-000000000005',
        'inst-1111-1111-1111-111111111111',
        'Home Improvement Loan',
        'Upgrade your living space',
        3000.00, 75000.00, 12, 60, 7.0, 1.5,
        '["Home focused", "Flexible terms", "Competitive rates"]',
        true
    ),
    (
        'prod-0006-0006-0006-000000000006',
        'inst-1111-1111-1111-111111111111',
        'Debt Consolidation',
        'Consolidate multiple debts into one',
        5000.00, 100000.00, 12, 84, 6.8, 1.0,
        '["Simplify payments", "Lower rates", "Improve credit"]',
        true
    );

-- ============================================================================
-- LOAN APPLICATIONS
-- ============================================================================

INSERT INTO loan_applications (
    id, user_id, product_id, institution_id,
    amount, duration_months, interest_rate, monthly_payment, total_repayment,
    purpose, employment_status, monthly_income, status, approved_by, approved_at
) VALUES (
    'app-0001-0001-0001-000000000001',
    'a1b2c3d4-1111-1111-1111-111111111111',
    'prod-0001-0001-0001-000000000001',
    'inst-1111-1111-1111-111111111111',
    5000.00, 12, 8.5, 438.50, 5262.00,
    'Home renovation',
    'Full-time employed',
    5000.00,
    'approved',
    'a1b2c3d4-2222-2222-2222-222222222222',
    NOW() - INTERVAL '6 months'
);

-- ============================================================================
-- ACTIVE LOANS
-- ============================================================================

INSERT INTO loans (
    id, application_id, user_id, product_id, institution_id,
    amount, duration_months, interest_rate, monthly_payment, total_repayment,
    paid_amount, outstanding_amount, next_payment_date, start_date, end_date, status
) VALUES (
    'loan-0001-0001-0001-000000000001',
    'app-0001-0001-0001-000000000001',
    'a1b2c3d4-1111-1111-1111-111111111111',
    'prod-0001-0001-0001-000000000001',
    'inst-1111-1111-1111-111111111111',
    5000.00, 12, 8.5, 438.50, 5262.00,
    1315.50, 3946.50,
    CURRENT_DATE + INTERVAL '25 days',
    CURRENT_DATE - INTERVAL '6 months',
    CURRENT_DATE + INTERVAL '6 months',
    'active'
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

INSERT INTO payments (
    id, loan_id, user_id, amount, payment_method, status,
    transaction_reference, payment_date
) VALUES
    (
        'pay-0001-0001-0001-000000000001',
        'loan-0001-0001-0001-000000000001',
        'a1b2c3d4-1111-1111-1111-111111111111',
        438.50, 'card', 'completed',
        'TXN-001-2024-10',
        CURRENT_DATE - INTERVAL '60 days'
    ),
    (
        'pay-0002-0002-0002-000000000002',
        'loan-0001-0001-0001-000000000001',
        'a1b2c3d4-1111-1111-1111-111111111111',
        438.50, 'bank_transfer', 'completed',
        'TXN-002-2024-09',
        CURRENT_DATE - INTERVAL '30 days'
    ),
    (
        'pay-0003-0003-0003-000000000003',
        'loan-0001-0001-0001-000000000001',
        'a1b2c3d4-1111-1111-1111-111111111111',
        438.50, 'crypto', 'completed',
        'TXN-003-2024-08',
        CURRENT_DATE - INTERVAL '5 days'
    );

-- ============================================================================
-- KYC DOCUMENTS
-- ============================================================================

INSERT INTO kyc_documents (
    id, user_id, document_type, document_url, document_number,
    status, verified_by, verified_at
) VALUES
    (
        'doc-0001-0001-0001-000000000001',
        'a1b2c3d4-1111-1111-1111-111111111111',
        'id',
        '/kyc/john-doe/id-document.png',
        'ID-123456789',
        'verified',
        'a1b2c3d4-3333-3333-3333-333333333333',
        NOW() - INTERVAL '3 months'
    ),
    (
        'doc-0002-0002-0002-000000000002',
        'a1b2c3d4-1111-1111-1111-111111111111',
        'proof_of_address',
        '/kyc/john-doe/address-proof.jpg',
        NULL,
        'verified',
        'a1b2c3d4-3333-3333-3333-333333333333',
        NOW() - INTERVAL '3 months'
    ),
    (
        'doc-0003-0003-0003-000000000003',
        'a1b2c3d4-1111-1111-1111-111111111111',
        'income_proof',
        '/kyc/john-doe/income-proof.jpg',
        NULL,
        'verified',
        'a1b2c3d4-3333-3333-3333-333333333333',
        NOW() - INTERVAL '3 months'
    );

-- ============================================================================
-- CREDIT REPORTS
-- ============================================================================

INSERT INTO credit_reports (
    id, user_id, credit_score, total_loans, active_loans, completed_loans,
    defaulted_loans, total_borrowed, total_repaid, on_time_payments, late_payments,
    report_data
) VALUES (
    'credit-0001-0001-0001-000000000001',
    'a1b2c3d4-1111-1111-1111-111111111111',
    720, 2, 1, 1, 0,
    7000.00, 2040.00, 15, 0,
    '{
        "payment_history": 100,
        "credit_utilization": 70,
        "credit_age": 85,
        "credit_mix": 75,
        "recent_inquiries": 2,
        "factors": {
            "positive": ["Excellent payment history", "Long credit history", "Low utilization"],
            "negative": []
        }
    }'
);

-- ============================================================================
-- NOTES
-- ============================================================================

-- To use this seed data:
-- 1. Create users in Supabase Auth dashboard or via API
-- 2. Update the user_id values above with actual auth.users.id
-- 3. Run this seed script in Supabase SQL Editor
-- 4. All passwords should be set during user creation in Supabase Auth

-- Demo credentials (set via Supabase Auth):
-- Borrower: john.doe@example.com / password: Demo123!
-- Institution: jane.smith@finflow.com / password: Demo123!
-- Admin: admin@finflow.com / password: Demo123!
