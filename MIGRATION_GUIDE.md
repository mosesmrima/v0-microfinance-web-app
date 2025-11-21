# FinFlow Microfinance Platform - Backend Migration Guide

This guide walks you through migrating from mock data to a fully functional Supabase backend with blockchain integration.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Setup](#supabase-setup)
4. [Database Migration](#database-migration)
5. [Authentication Setup](#authentication-setup)
6. [Smart Contract Deployment](#smart-contract-deployment)
7. [API Integration](#api-integration)
8. [Testing](#testing)

---

## Architecture Overview

### Current State (Mock Data)
- Static mock data in `/lib/mock-data.ts`
- No authentication
- Frontend-only application
- All pages accessible without login

### Target State (Supabase Backend)
- PostgreSQL database with full schema
- Supabase Auth for user management
- Row Level Security (RLS) for data access control
- Smart contract for immutable audit trail
- Mock APIs for credit scoring and KYC verification

### Data Flow
```
Frontend → Supabase Client → Database (RLS) → Smart Contract (Audit)
                ↓
         Mock APIs (Credit/KYC)
```

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] A Supabase account (free tier works)
- [ ] Basic understanding of PostgreSQL
- [ ] Metamask or similar Web3 wallet (for smart contract)
- [ ] Git for version control

---

## Supabase Setup

### 1. Create a New Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: FinFlow Microfinance
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **API Key (anon public)**: `eyJhbGc...`

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Smart Contract (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=80001 # Polygon Mumbai Testnet

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## Database Migration

### 1. Run Initial Schema Migration

1. Open Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Copy content from `/supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute

This creates:
- All tables (profiles, loans, payments, etc.)
- Enums for status types
- Indexes for performance
- Updated timestamp triggers

### 2. Apply Row Level Security Policies

1. Create another new query in SQL Editor
2. Copy content from `/supabase/migrations/002_rls_policies.sql`
3. Click "Run" to execute

This enables RLS and creates policies for:
- Users can view/edit their own data
- Institutions can manage their loans
- Admins have full access

### 3. Verify Migration

Run this query to check all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- profiles
- institutions
- loan_products
- loan_applications
- loans
- payments
- kyc_documents
- fraud_detections
- credit_reports

---

## Authentication Setup

### 1. Configure Auth Providers

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Enable **Google** or other OAuth providers (optional)

### 2. Create Demo Users

**Option A: Via Dashboard**
1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Create users with these emails:
   - `john.doe@example.com` (Borrower)
   - `jane.smith@finflow.com` (Institution)
   - `admin@finflow.com` (Admin)

**Option B: Via SQL** (after creating auth users)
1. Get user IDs from auth.users table
2. Update `/supabase/seed.sql` with actual user IDs
3. Run seed.sql in SQL Editor

### 3. Update Supabase Client Configuration

Create `/lib/supabase/client.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/types/database.types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
```

Create `/lib/supabase/server.ts`:

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
```

---

## Smart Contract Deployment

### 1. Set Up Development Environment

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init
```

### 2. Configure Hardhat

Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY!] // Add private key to .env
    }
  }
};

export default config;
```

### 3. Compile and Deploy

```bash
# Compile contract
npx hardhat compile

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.ts --network mumbai
```

### 4. Save Contract Address

After deployment, add the contract address to `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address
```

---

## API Integration

### 1. Replace Mock Data with Supabase Queries

**Before (Mock):**
```typescript
import { mockLoans } from '@/lib/mock-data'

const loans = mockLoans
```

**After (Supabase):**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: loans } = await supabase
  .from('loans')
  .select('*')
  .eq('user_id', userId)
```

### 2. Implement Authentication Flow

Update `/app/auth/login/page.tsx`:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error.message)
      return
    }

    router.push('/dashboard')
  }

  // ... rest of component
}
```

### 3. Add Protected Routes

Create `/middleware.ts`:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/institution/:path*']
}
```

### 4. Use Mock APIs for Credit Score and KYC

Example: Credit Score Service
```typescript
import { CreditScoreService } from '@/lib/services/credit-score.service'

// In your component
const creditScore = await CreditScoreService.generateCreditScore(userId, {
  totalLoans: 2,
  completedLoans: 1,
  defaultedLoans: 0,
  // ... other data from database
})
```

Example: KYC Verification
```typescript
import { KYCVerificationService } from '@/lib/services/kyc-verification.service'

const result = await KYCVerificationService.verifyDocument({
  documentType: 'id',
  documentNumber: 'ID-123456',
  imageUrl: uploadedFileUrl,
  userId: user.id,
})

// Save result to database
await supabase.from('kyc_documents').insert({
  user_id: userId,
  document_type: 'id',
  document_url: uploadedFileUrl,
  status: result.status,
  // ...
})
```

---

## Testing

### 1. Test Database Connections

```typescript
// Test basic query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Database test:', { data, error })
```

### 2. Test RLS Policies

```bash
# Login as different users and verify:
# - Borrowers can only see their own data
# - Institutions can see their loans
# - Admins can see everything
```

### 3. Test Smart Contract Integration

```typescript
// Example contract call
import { ethers } from 'ethers'

const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  LoanAuditTrailABI,
  signer
)

const isVerified = await contract.isKYCVerified(userId)
console.log('KYC verified on blockchain:', isVerified)
```

---

## Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] RLS policies applied
- [ ] Demo users created
- [ ] Seed data loaded
- [ ] Smart contract deployed
- [ ] Contract address saved
- [ ] Auth flow implemented
- [ ] Protected routes configured
- [ ] Mock APIs integrated
- [ ] Components updated to use Supabase
- [ ] Testing completed

---

## Troubleshooting

### Common Issues

**Issue: RLS policies blocking queries**
- Solution: Check if user is authenticated
- Verify RLS policies match your use case
- Use service role key for admin operations

**Issue: CORS errors**
- Solution: Add your domain to Supabase allowed origins
- Go to **Authentication** → **URL Configuration**

**Issue: Contract deployment fails**
- Solution: Ensure you have testnet MATIC
- Get free testnet MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)

**Issue: Type errors**
- Solution: Regenerate types from Supabase:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
```

---

## Next Steps

After successful migration:

1. **Add File Upload**: Implement Supabase Storage for KYC documents
2. **Email Notifications**: Set up email templates for loan approvals
3. **Real-time Updates**: Use Supabase Realtime for live payment notifications
4. **Analytics**: Add Supabase Analytics dashboard
5. **Production Deploy**: Deploy to Vercel with production Supabase project

---

## Support

For questions or issues:
- Supabase Docs: https://supabase.com/docs
- Hardhat Docs: https://hardhat.org/docs
- Project Issues: [GitHub Issues]

---

**Last Updated**: November 2025
**Version**: 1.0.0
