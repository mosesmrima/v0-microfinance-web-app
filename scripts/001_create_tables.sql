-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'borrower', -- 'borrower', 'institution', 'admin'
  kyc_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  duration_months INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'
  purpose TEXT,
  monthly_payment DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create loan products table
CREATE TABLE IF NOT EXISTS public.loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  duration_months INTEGER NOT NULL,
  requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'id', 'proof_of_address', 'income_proof'
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  rejection_reason TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

-- Create fraud detection table
CREATE TABLE IF NOT EXISTS public.fraud_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score DECIMAL(5, 2) NOT NULL,
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  flags TEXT[], -- Array of risk flags
  flagged_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  action TEXT -- 'approved', 'rejected', 'manual_review'
);

-- Create loan repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Loans RLS Policies
CREATE POLICY "loans_select_own" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loans_select_institution" ON public.loans FOR SELECT USING (
  auth.uid() = institution_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'institution')
);
CREATE POLICY "loans_select_admin" ON public.loans FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "loans_insert_own" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loans_update_own" ON public.loans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "loans_update_institution" ON public.loans FOR UPDATE USING (
  auth.uid() = institution_id
);

-- Loan Products RLS Policies
CREATE POLICY "loan_products_select_all" ON public.loan_products FOR SELECT USING (true);
CREATE POLICY "loan_products_insert_institution" ON public.loan_products FOR INSERT WITH CHECK (
  auth.uid() = institution_id
);
CREATE POLICY "loan_products_update_institution" ON public.loan_products FOR UPDATE USING (
  auth.uid() = institution_id
);

-- KYC Documents RLS Policies
CREATE POLICY "kyc_documents_select_own" ON public.kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "kyc_documents_select_admin" ON public.kyc_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "kyc_documents_insert_own" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kyc_documents_update_admin" ON public.kyc_documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fraud Detection RLS Policies
CREATE POLICY "fraud_detection_select_admin" ON public.fraud_detection FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "fraud_detection_select_institution" ON public.fraud_detection FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'institution')
);
CREATE POLICY "fraud_detection_insert_admin" ON public.fraud_detection FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "fraud_detection_update_admin" ON public.fraud_detection FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Loan Repayments RLS Policies
CREATE POLICY "loan_repayments_select_own" ON public.loan_repayments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.loans WHERE id = loan_id AND user_id = auth.uid())
);
CREATE POLICY "loan_repayments_select_institution" ON public.loan_repayments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.loans WHERE id = loan_id AND institution_id = auth.uid())
);
CREATE POLICY "loan_repayments_select_admin" ON public.loan_repayments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Audit Logs RLS Policies
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "audit_logs_insert_all" ON public.audit_logs FOR INSERT WITH CHECK (true);
