# FinFlow Backend Architecture

## Overview

FinFlow is a modern microfinance platform built with a hybrid architecture combining:
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Blockchain**: Smart contracts for immutable audit trail
- **Mock APIs**: Intelligent services for credit scoring and KYC verification

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                  │
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
│   Database    │   │                │   │   (Blockchain)  │
│               │   │ • Credit Score │   │                 │
│ • Profiles    │   │ • KYC Verify   │   │ • Loan History  │
│ • Loans       │   │                │   │ • KYC Status    │
│ • Payments    │   │                │   │ • Payments      │
│ • KYC Docs    │   │                │   │                 │
└───────────────┘   └────────────────┘   └─────────────────┘
```

---

## Database Schema

### Core Tables

#### 1. **profiles**
User information and role management
- Links to Supabase Auth (`user_id`)
- Supports multiple roles: borrower, institution, admin
- Tracks KYC status and credit score
- Includes blockchain address for audit trail linking

#### 2. **institutions**
Financial institutions offering loans
- One-to-one with institution profiles
- Tracks verification status
- Stores registration and license info

#### 3. **loan_products**
Loan offerings from institutions
- Configurable terms (amount, duration, interest)
- Feature sets stored as JSONB
- Active/inactive status

#### 4. **loan_applications**
User loan requests
- References user, product, and institution
- Tracks approval workflow
- Stores employment and income data
- Links to blockchain transaction

#### 5. **loans**
Active and historical loans
- Created from approved applications
- Tracks payment progress
- Next payment date calculation
- Outstanding amount updates

#### 6. **payments**
Individual loan payments
- Multiple payment methods supported
- Blockchain transaction hash stored
- On-time/late tracking for credit scoring

#### 7. **kyc_documents**
User verification documents
- Document type enum (ID, address proof, income, selfie)
- Verification workflow with admin approval
- Stores rejection reasons

#### 8. **fraud_detections**
Fraud monitoring for applications
- Risk scoring (0-100)
- Automated flag generation
- Admin review workflow

#### 9. **credit_reports**
User credit score and history
- Credit score (300-850 range)
- Loan statistics
- Payment behavior tracking
- JSONB for detailed factors

---

## Row Level Security (RLS)

### Borrower Access
```sql
-- Can view/edit own profile
-- Can create loan applications
-- Can view own loans and payments
-- Can upload own KYC documents
-- Can view own credit report
```

### Institution Access
```sql
-- Can view borrower profiles
-- Can manage own loan products
-- Can view/update applications for own products
-- Can view payments for own loans
-- Can view fraud detections for own applications
```

### Admin Access
```sql
-- Full access to all tables
-- Can verify KYC documents
-- Can review fraud detections
-- Can approve/reject applications
```

---

## Authentication Flow

### 1. Sign Up
```typescript
// User registers
supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
      role: 'borrower'
    }
  }
})

// Trigger creates profile automatically
// via Supabase trigger on auth.users
```

### 2. Sign In
```typescript
// User logs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure_password'
})

// Session stored in cookies
// RLS policies automatically apply based on auth.uid()
```

### 3. Protected Routes
```typescript
// Middleware checks session
// Redirects to login if not authenticated
// Routes users to correct dashboard based on role
```

---

## Smart Contract Integration

### Purpose
The smart contract provides an **immutable audit trail** without storing personal data.

### What's Stored On-Chain
- User ID (UUID - no PII)
- Loan amounts and terms
- Payment timestamps and amounts
- KYC verification status (boolean)
- Credit score updates (numbers only)

### What's NOT Stored On-Chain
- Names, emails, addresses
- Document images
- National IDs
- Phone numbers
- Any personally identifiable information

### Key Functions

```solidity
// Record KYC verification
recordKYCVerification(userId, verificationLevel)

// Create loan application
createLoanApplication(userId, loanId, amount, duration, rate)

// Approve loan
approveLoan(loanId, institutionId)

// Record payment
recordPayment(loanId, paymentId, amount, onTime)

// Update credit score
updateCreditScore(userId, newScore)
```

### Integration Flow

```typescript
// 1. Save to Supabase (with PII)
const { data } = await supabase.from('loans').insert(loanData)

// 2. Record on blockchain (anonymous)
await contract.createLoanApplication(
  userId, // UUID only
  loanId,
  amount,
  duration,
  interestRate
)

// 3. Save transaction hash to Supabase
await supabase.from('loans').update({
  blockchain_tx_hash: txHash
}).eq('id', loanId)
```

---

## Mock API Services

### Credit Score Service

**Purpose**: Generate intelligent credit scores based on user history

**Algorithm**:
```
Credit Score = Weighted Average of:
- Payment History (35%)
- Credit Utilization (30%)
- Credit Age (15%)
- Credit Mix (10%)
- New Credit (10%)

Range: 300-850
```

**Usage**:
```typescript
const result = await CreditScoreService.generateCreditScore(userId, {
  totalLoans: 2,
  completedLoans: 1,
  onTimePayments: 12,
  latePayments: 0,
  // ... other factors
})

// Returns: { score, factors, rating, recommendations }
```

**Features**:
- Deterministic for same inputs
- Realistic score distribution
- Personalized recommendations
- Factor breakdown

### KYC Verification Service

**Purpose**: Simulate AI-powered document verification

**Process**:
1. Receive document image URL and type
2. Simulate processing delay (1-3 seconds)
3. Generate verification confidence (0-100)
4. Determine status: verified, pending, or rejected
5. Provide specific feedback and recommendations

**Usage**:
```typescript
const result = await KYCVerificationService.verifyDocument({
  documentType: 'id',
  documentNumber: 'ID-123456',
  imageUrl: uploadedUrl,
  userId: userId
})

// Returns: { status, confidence, issues, verifiedFields, recommendations }
```

**Features**:
- Smart random outcomes based on document type
- Realistic issue detection
- Liveness check for selfies
- Face matching between ID and selfie
- Batch verification support

---

## Data Flow Examples

### Loan Application Flow

```
1. User fills application form
   ↓
2. Frontend validates input
   ↓
3. Check KYC status (must be verified)
   ↓
4. Calculate monthly payment and total
   ↓
5. Insert into loan_applications table
   ↓
6. Run fraud detection
   ↓
7. If low risk: auto-approve
   If high risk: flag for review
   ↓
8. Record on blockchain
   ↓
9. Notify user and institution
```

### Payment Flow

```
1. User initiates payment
   ↓
2. Process payment via gateway
   ↓
3. Insert into payments table
   ↓
4. Update loan paid_amount
   ↓
5. Recalculate outstanding_amount
   ↓
6. Update next_payment_date
   ↓
7. Record on blockchain
   ↓
8. Update credit score if late
   ↓
9. Send confirmation email
```

### KYC Verification Flow

```
1. User uploads document
   ↓
2. Upload to Supabase Storage
   ↓
3. Call KYC verification service
   ↓
4. Save result to kyc_documents
   ↓
5. If auto-verified: update profile KYC status
   If needs review: notify admin
   ↓
6. Record on blockchain when verified
   ↓
7. Notify user of status
```

---

## Security Measures

### 1. Row Level Security (RLS)
- Database-level access control
- Automatic filtering based on auth context
- Prevents data leaks between users

### 2. Auth Policies
- JWT-based authentication
- Secure session management
- Automatic token refresh

### 3. Environment Variables
- API keys never exposed to client
- Service role key kept server-side only
- Smart contract addresses configurable

### 4. Data Encryption
- TLS/SSL for all connections
- Encrypted at rest in Supabase
- No plain-text sensitive data

### 5. Blockchain Privacy
- No PII on blockchain
- Anonymous identifiers only
- Public audit trail without privacy breach

---

## Performance Optimizations

### Database Indexes
```sql
-- User lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Loan queries
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_next_payment_date ON loans(next_payment_date);

-- Payment history
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
```

### Query Patterns
```typescript
// ✅ Good: Select specific columns
const { data } = await supabase
  .from('loans')
  .select('id, amount, status')
  .eq('user_id', userId)

// ❌ Bad: Select everything
const { data } = await supabase
  .from('loans')
  .select('*')
```

### Caching Strategy
- Client-side caching for static data (loan products)
- SWR for real-time data (active loans)
- Stale-while-revalidate for credit scores

---

## Monitoring and Logging

### Application Logs
- Authentication events
- Failed API calls
- Permission denials
- Error stack traces

### Business Metrics
- Loan application rate
- Approval rate
- Default rate
- Average processing time
- User growth

### Performance Metrics
- Query response times
- API latency
- Page load times
- Database connection pool

---

## Future Enhancements

### Planned Features
1. **Real-time Notifications**
   - Supabase Realtime for live updates
   - Payment reminders
   - Loan status changes

2. **Advanced Analytics**
   - Supabase Analytics integration
   - Custom dashboards
   - Reporting engine

3. **File Storage**
   - Supabase Storage for documents
   - Image optimization
   - CDN integration

4. **Email Integration**
   - Supabase Auth email templates
   - Transactional emails
   - Marketing campaigns

5. **Mobile App**
   - React Native with Supabase
   - Biometric authentication
   - Push notifications

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Server Components

### Backend
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (planned)
- **Real-time**: Supabase Realtime (planned)

### Blockchain
- **Platform**: Ethereum/Polygon
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Network**: Polygon Mumbai (testnet)

### Development
- **Package Manager**: npm
- **Version Control**: Git
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions (planned)

---

## Contact

For questions or contributions:
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **License**: MIT

---

**Last Updated**: November 2025
