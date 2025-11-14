# Backend Migration Plan: Mock Data → Supabase + Blockchain

## Executive Summary

This document outlines the complete migration strategy from the current mock data system to a production-ready backend using:
- **Supabase** (Auth, Database, Storage)
- **Smart Contracts** (Automatic loan approval for < $10K)
- **External APIs** (KYC verification, Credit scoring)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│              (React 18 + App Router + Turbopack)            │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┬──────────────┬─────────────┐
        │                   │              │             │
        ▼                   ▼              ▼             ▼
┌──────────────┐   ┌──────────────┐  ┌─────────┐  ┌──────────┐
│   Supabase   │   │   External   │  │  Web3   │  │ Backend  │
│              │   │     APIs     │  │Provider │  │   APIs   │
│ • Auth       │   │ • KYC API    │  │         │  │ • Custom │
│ • Database   │   │ • Credit API │  │ Ethereum│  │   Logic  │
│ • Storage    │   └──────────────┘  │ /Polygon│  └──────────┘
│ • Realtime   │                      │         │
│ • RLS        │                      │Smart    │
└──────────────┘                      │Contract │
                                      └─────────┘
```

---

## Phase 1: Supabase Setup

### 1.1 Database Schema

Based on `/scripts/001_create_tables.sql`, we need these tables:

```sql
-- Core Tables
✓ profiles (users)
✓ loans
✓ loan_products
✓ kyc_documents
✓ fraud_detection
✓ loan_repayments (payment_schedules)
✓ payments
✓ blockchain_transactions
✓ audit_logs

-- Additional Tables
✓ notifications
✓ system_analytics
```

**Key RLS Policies Needed:**
- Borrowers: Can only view/edit their own data
- Loan Officers: Can view assigned applications (read-only)
- MD: Can approve/reject loans < $10K
- Finance Directors: Can approve/reject loans ≥ $10K
- Admin: Full access to all data

### 1.2 Authentication Setup

**Migration from hardcoded users:**

```typescript
// Current: lib/hardcoded-users.json
{
  "email": "borrower@test.com",
  "password": "borrower123"
}

// New: Supabase Auth
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'borrower@test.com',
  password: 'borrower123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
      role: 'borrower'
    }
  }
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'borrower@test.com',
  password: 'borrower123'
})
```

**Auth Flow:**
1. User signs up → Creates auth.users record
2. Trigger creates profile in public.profiles
3. Profile includes role for RBAC
4. Frontend stores session in localStorage
5. All API calls include JWT token

### 1.3 Storage Setup

**Structure for KYC Documents:**

```
finflow-kyc-documents/
├── {user_id}/
│   ├── stage1/
│   │   ├── national_id_{timestamp}.pdf
│   │   ├── proof_of_residence_{timestamp}.pdf
│   │   └── passport_{timestamp}.pdf
│   └── stage2/
│       ├── {loan_id}/
│       │   ├── payslip_{timestamp}.pdf
│       │   ├── bank_statement_{timestamp}.pdf
│       │   └── employment_letter_{timestamp}.pdf
```

**Storage Policies:**
```sql
-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Officers, MD, Finance Directors, Admins can view all
CREATE POLICY "Staff can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('loan_officer', 'md', 'finance_director', 'admin')
  )
);
```

---

## Phase 2: Smart Contract Design

### 2.1 Auto-Approval Smart Contract

**Purpose:** Automatically approve loans < $10K based on credit score and KYC status

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LoanAutoApproval {
    struct LoanApplication {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 durationMonths;
        uint256 creditScore;
        bool kycVerified;
        bool autoApproved;
        uint256 timestamp;
    }

    mapping(bytes32 => LoanApplication) public applications;

    uint256 public constant AUTO_APPROVAL_THRESHOLD = 10000 * 10**6; // $10K in USDC
    uint256 public constant MIN_CREDIT_SCORE = 650;

    event LoanApplicationSubmitted(bytes32 indexed loanId, address indexed borrower, uint256 amount);
    event LoanAutoApproved(bytes32 indexed loanId, uint256 amount);
    event LoanRejected(bytes32 indexed loanId, string reason);
    event LoanEscalated(bytes32 indexed loanId, string reason);

    address public mdAddress;
    address public financeDirectorAddress;

    constructor(address _md, address _financeDirector) {
        mdAddress = _md;
        financeDirectorAddress = _financeDirector;
    }

    /**
     * @dev Submit loan application for auto-approval
     * @param loanId Unique loan identifier from backend
     * @param amount Loan amount in USD (6 decimals)
     * @param interestRate Annual interest rate (basis points, e.g., 850 = 8.5%)
     * @param durationMonths Loan duration in months
     * @param creditScore Borrower's credit score
     * @param kycVerified Whether KYC is verified
     */
    function submitLoanApplication(
        bytes32 loanId,
        uint256 amount,
        uint256 interestRate,
        uint256 durationMonths,
        uint256 creditScore,
        bool kycVerified
    ) external returns (bool autoApproved) {
        require(applications[loanId].timestamp == 0, "Application already exists");

        applications[loanId] = LoanApplication({
            borrower: msg.sender,
            amount: amount,
            interestRate: interestRate,
            durationMonths: durationMonths,
            creditScore: creditScore,
            kycVerified: kycVerified,
            autoApproved: false,
            timestamp: block.timestamp
        });

        emit LoanApplicationSubmitted(loanId, msg.sender, amount);

        // Auto-approval logic
        if (amount < AUTO_APPROVAL_THRESHOLD && kycVerified && creditScore >= MIN_CREDIT_SCORE) {
            applications[loanId].autoApproved = true;
            emit LoanAutoApproved(loanId, amount);
            return true;
        } else {
            // Escalate to appropriate tier
            if (!kycVerified) {
                emit LoanRejected(loanId, "KYC not verified");
            } else if (creditScore < MIN_CREDIT_SCORE) {
                emit LoanEscalated(loanId, "Credit score below minimum");
            } else if (amount >= AUTO_APPROVAL_THRESHOLD) {
                emit LoanEscalated(loanId, "Amount exceeds auto-approval threshold");
            }
            return false;
        }
    }

    /**
     * @dev MD manually approves escalated loan
     */
    function mdApprove(bytes32 loanId) external {
        require(msg.sender == mdAddress, "Only MD can approve");
        require(applications[loanId].timestamp > 0, "Application does not exist");
        require(!applications[loanId].autoApproved, "Already auto-approved");

        applications[loanId].autoApproved = true;
        emit LoanAutoApproved(loanId, applications[loanId].amount);
    }

    /**
     * @dev Finance Director manually approves high-value loan
     */
    function financeDirectorApprove(bytes32 loanId) external {
        require(msg.sender == financeDirectorAddress, "Only Finance Director can approve");
        require(applications[loanId].timestamp > 0, "Application does not exist");

        applications[loanId].autoApproved = true;
        emit LoanAutoApproved(loanId, applications[loanId].amount);
    }
}
```

### 2.2 Loan Disbursement Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LoanDisbursement {
    IERC20 public usdcToken; // USDC or stablecoin

    struct Disbursement {
        address borrower;
        uint256 amount;
        uint256 disbursedAt;
        bytes32 loanId;
    }

    mapping(bytes32 => Disbursement) public disbursements;

    event LoanDisbursed(bytes32 indexed loanId, address indexed borrower, uint256 amount);

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }

    function disburseLoan(
        bytes32 loanId,
        address borrower,
        uint256 amount
    ) external {
        require(disbursements[loanId].disbursedAt == 0, "Already disbursed");

        disbursements[loanId] = Disbursement({
            borrower: borrower,
            amount: amount,
            disbursedAt: block.timestamp,
            loanId: loanId
        });

        require(usdcToken.transfer(borrower, amount), "Transfer failed");

        emit LoanDisbursed(loanId, borrower, amount);
    }
}
```

---

## Phase 3: External API Integrations

### 3.1 Placeholder KYC API

**Create:** `/app/api/kyc/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Placeholder KYC verification
// In production: Integrate with Onfido, Jumio, or similar
export async function POST(request: NextRequest) {
  const { documentId, documentType } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch document from storage
  const { data: document } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  // Placeholder verification logic
  // In production: Call actual KYC API
  const verificationResult = await mockKYCVerification(document)

  // Update document status
  await supabase
    .from('kyc_documents')
    .update({
      status: verificationResult.passed ? 'verified' : 'rejected',
      verified_at: new Date().toISOString(),
      rejection_reason: verificationResult.reason
    })
    .eq('id', documentId)

  return NextResponse.json(verificationResult)
}

async function mockKYCVerification(document: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock verification logic
  // 90% pass rate for simulation
  const passed = Math.random() > 0.1

  return {
    passed,
    reason: passed ? null : 'Document quality insufficient',
    confidence: passed ? 0.95 : 0.45,
    extractedData: {
      name: 'John Doe',
      dateOfBirth: '1990-01-01',
      documentNumber: 'AB123456'
    }
  }
}
```

### 3.2 Placeholder Credit Score API

**Create:** `/app/api/credit-score/check/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Placeholder credit score check
// In production: Integrate with Experian, Equifax, or similar
export async function POST(request: NextRequest) {
  const { userId } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Placeholder credit check
  const creditResult = await mockCreditScoreCheck(profile)

  // Store credit score in database
  await supabase
    .from('profiles')
    .update({
      credit_score: creditResult.score,
      credit_score_updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  return NextResponse.json(creditResult)
}

async function mockCreditScoreCheck(profile: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Mock credit score (300-850 range)
  // Generate based on user ID for consistency
  const hash = profile.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  const score = 550 + (hash % 300) // Score between 550-850

  return {
    score,
    range: score >= 700 ? 'good' : score >= 650 ? 'fair' : 'poor',
    factors: [
      { factor: 'Payment history', impact: 'positive' },
      { factor: 'Credit utilization', impact: 'neutral' },
      { factor: 'Length of credit history', impact: score >= 700 ? 'positive' : 'negative' }
    ],
    lastUpdated: new Date().toISOString()
  }
}
```

---

## Phase 4: Migration Strategy

### 4.1 Create Supabase Client Utilities

**File:** `/lib/supabase/client.ts`

```typescript
import { createClientComponentClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/database.types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
```

**File:** `/lib/supabase/server.ts`

```typescript
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'

export const createClient = () => {
  return createServerComponentClient<Database>({
    cookies
  })
}
```

### 4.2 Replace Mock Store Functions

**Current:** `lib/mock-store.ts`
**New:** `lib/supabase/queries.ts`

```typescript
import { createClient } from './client'
import { Loan, Profile, LoanProduct } from '@/lib/types'

export async function getLoans(): Promise<Loan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLoansByUserId(userId: string): Promise<Loan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPendingLoansForOfficer(): Promise<Loan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('status', 'pending_loan_officer')
    .order('submitted_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ... more query functions
```

### 4.3 Update Auth Context

**File:** `/contexts/AuthContext.tsx`

```typescript
"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    setLoading(false)

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data as Profile)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!session,
        loading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## Phase 5: Web3 Integration

### 5.1 Web3 Provider Setup

**File:** `/lib/web3/provider.ts`

```typescript
import { ethers } from 'ethers'

let provider: ethers.providers.Web3Provider | null = null

export function getWeb3Provider() {
  if (typeof window === 'undefined') return null

  if (!provider && window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum)
  }

  return provider
}

export async function connectWallet(): Promise<string> {
  const provider = getWeb3Provider()
  if (!provider) throw new Error('No Web3 provider found')

  await provider.send('eth_requestAccounts', [])
  const signer = provider.getSigner()
  return await signer.getAddress()
}
```

### 5.2 Smart Contract Interaction

**File:** `/lib/web3/contracts.ts`

```typescript
import { ethers } from 'ethers'
import { getWeb3Provider } from './provider'
import LoanAutoApprovalABI from './abis/LoanAutoApproval.json'

const LOAN_AUTO_APPROVAL_ADDRESS = process.env.NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS!

export async function submitLoanToBlockchain(
  loanId: string,
  amount: number,
  interestRate: number,
  durationMonths: number,
  creditScore: number,
  kycVerified: boolean
) {
  const provider = getWeb3Provider()
  if (!provider) throw new Error('No Web3 provider')

  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    LOAN_AUTO_APPROVAL_ADDRESS,
    LoanAutoApprovalABI,
    signer
  )

  // Convert loan ID to bytes32
  const loanIdBytes = ethers.utils.formatBytes32String(loanId)

  // Convert amount to 6 decimals (USDC format)
  const amountInUnits = ethers.utils.parseUnits(amount.toString(), 6)

  // Submit transaction
  const tx = await contract.submitLoanApplication(
    loanIdBytes,
    amountInUnits,
    interestRate * 100, // Convert to basis points
    durationMonths,
    creditScore,
    kycVerified
  )

  const receipt = await tx.wait()

  // Check if auto-approved
  const autoApprovedEvent = receipt.events?.find(
    (e: any) => e.event === 'LoanAutoApproved'
  )

  return {
    transactionHash: receipt.transactionHash,
    autoApproved: !!autoApprovedEvent,
    blockNumber: receipt.blockNumber
  }
}
```

---

## Phase 6: Implementation Roadmap

### Week 1: Supabase Foundation
- [ ] Create Supabase project
- [ ] Run database migrations (001, 002, 003 SQL scripts)
- [ ] Set up RLS policies
- [ ] Create storage buckets
- [ ] Set up authentication
- [ ] Test basic CRUD operations

### Week 2: API Layer
- [ ] Create Supabase client utilities
- [ ] Implement query functions (replace mock-store)
- [ ] Create placeholder KYC API
- [ ] Create placeholder credit score API
- [ ] Test API endpoints

### Week 3: Smart Contract Development
- [ ] Write LoanAutoApproval contract
- [ ] Write LoanDisbursement contract
- [ ] Write tests for contracts
- [ ] Deploy to testnet (Polygon Mumbai or Sepolia)
- [ ] Verify contracts on block explorer

### Week 4: Frontend Migration (Auth)
- [ ] Update AuthContext to use Supabase
- [ ] Migrate login page
- [ ] Migrate signup page
- [ ] Test authentication flow
- [ ] Handle session persistence

### Week 5: Frontend Migration (Data)
- [ ] Update dashboard to use Supabase queries
- [ ] Migrate loan applications flow
- [ ] Migrate KYC upload to Supabase Storage
- [ ] Update payment schedules
- [ ] Test all data flows

### Week 6: Web3 Integration
- [ ] Set up Web3 provider
- [ ] Integrate smart contract calls
- [ ] Add wallet connection
- [ ] Test auto-approval flow
- [ ] Handle blockchain transactions

### Week 7: Testing & Refinement
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation

### Week 8: Production Deployment
- [ ] Deploy smart contracts to mainnet
- [ ] Configure production Supabase
- [ ] Set up monitoring
- [ ] Deploy frontend
- [ ] Smoke tests

---

## Environment Variables Needed

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Server-side only

# Blockchain
NEXT_PUBLIC_CHAIN_ID=137 # Polygon Mainnet or 80001 Mumbai Testnet
NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DISBURSEMENT_CONTRACT_ADDRESS=0x...

# APIs
KYC_API_KEY=xxx # For production KYC service
CREDIT_API_KEY=xxx # For production credit bureau

# Optional
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
NEXT_PUBLIC_ENABLE_AUTO_APPROVAL=true
```

---

## Success Metrics

- ✅ All users migrated from hardcoded to Supabase Auth
- ✅ All mock data queries replaced with Supabase queries
- ✅ KYC documents stored in Supabase Storage
- ✅ Smart contract deployed and functional
- ✅ Auto-approval working for loans < $10K
- ✅ Placeholder APIs responding correctly
- ✅ Zero data loss during migration
- ✅ All RLS policies enforced
- ✅ End-to-end loan application flow working

---

## Next Steps

1. **Review this plan** and confirm approach
2. **Set up Supabase project** (I can guide you)
3. **Start with Phase 1** (Database setup)
4. **Incremental migration** (one feature at a time)
5. **Continuous testing** throughout

---

## Questions to Address

1. Which blockchain network? (Polygon recommended for low fees)
2. Which stablecoin for loans? (USDC recommended)
3. KYC provider preference? (Onfido, Jumio, Persona?)
4. Credit bureau? (Experian, Equifax, or local provider?)
5. Timeline constraints?

---

**Status**: Ready to begin implementation
**Next Action**: Create Supabase project and run initial migrations
