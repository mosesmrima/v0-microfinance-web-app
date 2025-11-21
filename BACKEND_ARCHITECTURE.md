# FinFlow Backend Architecture - Simplified

## Overview

FinFlow uses a simple, straightforward backend architecture:
- **Supabase**: PostgreSQL database with basic Row Level Security
- **Blockchain**: Simple event logging for audit trail
- **Mock APIs**: Basic random data generation for demo purposes

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Dashboard  │  │  Auth Pages  │  │  Admin Panel     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌────────────────┐   ┌─────────────────┐
│   Supabase    │   │   Mock APIs    │   │  Smart Contract │
│   Database    │   │                │   │   (Events Only) │
│               │   │ • Random Score │   │                 │
│ • 6 Tables    │   │ • Random Status│   │ • Loan Event    │
│ • Simple RLS  │   │                │   │ • Payment Event │
│               │   │                │   │ • KYC Event     │
└───────────────┘   └────────────────┘   └─────────────────┘
```

---

## Database Schema (6 Tables)

### 1. **profiles**
User accounts and basic info
- `id`, `user_id`, `first_name`, `last_name`, `email`
- `phone`, `role`, `kyc_status`, `credit_score`

### 2. **institutions**
Lending institutions
- `id`, `profile_id`, `institution_name`
- `registration_number`, `verified`

### 3. **loan_products**
Available loan types
- `id`, `institution_id`, `name`, `description`
- `min_amount`, `max_amount`, `min_duration`, `max_duration`
- `interest_rate`, `is_active`

### 4. **loans** (merged applications + active loans)
All loan records from application to completion
- `id`, `user_id`, `product_id`, `institution_id`
- `amount`, `duration_months`, `interest_rate`
- `monthly_payment`, `total_repayment`, `paid_amount`
- `status` (pending/approved/active/completed/rejected/defaulted)

### 5. **payments**
Payment transactions
- `id`, `loan_id`, `user_id`, `amount`
- `payment_method`, `status`, `transaction_reference`

### 6. **kyc_documents**
Identity verification documents
- `id`, `user_id`, `document_type`, `document_url`
- `status` (pending/verified/rejected)

---

## Row Level Security (RLS)

Simple security policies:
- **Users**: Can view/edit their own data
- **Admins**: Full access to everything
- **Public**: Can view active products and verified institutions

---

## Mock Services

### Credit Score Service
```typescript
// Returns random score between 300-850
generateCreditScore(userId: string): Promise<{
  score: number
  rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
}>
```

### KYC Verification Service
```typescript
// Returns random status (80% verified, 15% pending, 5% rejected)
verifyDocument(data: DocumentData): Promise<{
  status: 'verified' | 'pending' | 'rejected'
}>
```

---

## Smart Contract (Audit Trail)

Simple event-only contract for immutable audit log:

```solidity
event KYCVerified(string userId, uint256 timestamp)
event LoanCreated(string loanId, string userId, uint256 amount, uint256 timestamp)
event PaymentMade(string loanId, uint256 amount, uint256 timestamp)
event LoanCompleted(string loanId, uint256 timestamp)
```

**Functions:**
- `recordKYC(userId)` - Emit KYC event
- `recordLoan(loanId, userId, amount)` - Emit loan event
- `recordPayment(loanId, amount)` - Emit payment event
- `recordCompletion(loanId)` - Emit completion event

---

## User Roles

- **Borrower**: Apply for loans, make payments, upload KYC documents
- **Institution**: Manage loan products, approve/reject applications
- **Admin**: Full system access, KYC review, fraud monitoring

---

## Data Flow Examples

### Loan Application Flow
1. User creates loan application → `loans` table (status: pending)
2. Institution reviews → Updates status to approved
3. Loan disbursed → Status changes to active
4. User makes payments → Records in `payments` table
5. Loan paid off → Status changes to completed

### KYC Verification Flow
1. User uploads document → `kyc_documents` table (status: pending)
2. Mock API randomly verifies → Status updates to verified/rejected
3. If all docs verified → Profile `kyc_status` updates to verified

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Blockchain (Optional)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=80001
```

---

## Deployment Steps

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project

2. **Run Migrations**
   ```bash
   # In Supabase SQL Editor
   # Run: supabase/migrations/001_initial_schema.sql
   # Then: supabase/migrations/002_rls_policies.sql
   ```

3. **Add Environment Variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Deploy Contract** (Optional)
   - Deploy `contracts/LoanAuditTrail.sol` to Mumbai testnet
   - Update contract address in `.env.local`

---

## Migration from Mock Data

The app currently uses mock data from `lib/mock-data.ts`. To migrate to Supabase:

1. Run database migrations
2. Update environment variables
3. Replace mock data imports with Supabase queries
4. Use the Supabase client utilities in `lib/supabase/`

---

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Solidity 0.8.20 (Polygon/Ethereum)
- **Auth**: Supabase Auth
