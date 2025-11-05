# FinFlow - Smart Microfinance Platform

*Blockchain-powered microfinance with automated KYC, credit scoring, and fraud detection*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mosesmrimas-projects/v0-microfinance-web-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/X5j7ozDI0vl)

## Overview

FinFlow is a next-generation microfinance platform that combines traditional lending with blockchain technology to provide fast, transparent, and secure loan services. The platform features automated KYC verification, intelligent fraud detection, credit scoring, and multi-role dashboards for borrowers, financial institutions, and administrators.

### Key Features

- **Blockchain Integration**: Immutable customer profiles and transaction records stored on blockchain
- **Smart Contracts**: Automated loan processing, KYC verification, and fraud detection
- **Multi-Role System**: Separate dashboards for borrowers, institutions, and administrators
- **KYC Automation**: Streamlined identity verification with blockchain-backed records
- **Credit Scoring Engine**: Intelligent risk assessment and credit evaluation
- **Fraud Detection**: Real-time fraud monitoring with risk scoring algorithms
- **Payment Gateway Integration**: Support for cards, bank transfers, and cryptocurrency

---

## Architecture

> **Note**: All diagrams below are rendered using Mermaid. If you're viewing this on GitHub, they should display automatically. To generate PNG versions of these diagrams, you can use tools like [mermaid.ink](https://mermaid.ink/) or [Kroki.io](https://kroki.io/).

### 1. System Architecture

The platform is built on a modern microservices architecture with blockchain integration:

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application<br/>Next.js 15 + React]
        MOBILE[Mobile Application<br/>React Native]
    end

    subgraph "Application Layer"
        API[API Gateway<br/>Next.js API Routes]
        AUTH[Authentication<br/>Supabase Auth + Web3]
    end

    subgraph "Business Logic Layer"
        LOAN[Loan Processing<br/>Service]
        KYC_SVC[KYC Service]
        FRAUD_SVC[Fraud Detection<br/>Service]
        CREDIT_SVC[Credit Scoring<br/>Service]
        PAYMENT_SVC[Payment<br/>Processing]
    end

    subgraph "Data Layer"
        DB[(Supabase<br/>PostgreSQL)]
        STORAGE[Supabase<br/>Storage]
        KYC_DB[(KYC Module<br/>External DB)]
    end

    subgraph "Blockchain Layer"
        NETWORK[Blockchain Network<br/>Polygon]
        SC_KYC[KYC Smart<br/>Contract]
        SC_LOAN[Loan Smart<br/>Contract]
        SC_FRAUD[Fraud Detection<br/>Smart Contract]
        SC_PAYMENT[Payment Smart<br/>Contract]
    end

    subgraph "External Services"
        CREDIT_ENGINE[Credit Scoring<br/>Engine]
        PAY_GATEWAY[Payment<br/>Gateway]
        NOTIF[Notification<br/>Service]
    end

    WEB --> API
    MOBILE --> API
    API --> AUTH
    AUTH --> LOAN
    AUTH --> KYC_SVC
    AUTH --> FRAUD_SVC
    AUTH --> PAYMENT_SVC

    LOAN --> DB
    LOAN --> SC_LOAN
    LOAN --> CREDIT_SVC

    KYC_SVC --> DB
    KYC_SVC --> SC_KYC
    KYC_SVC --> KYC_DB
    KYC_SVC --> STORAGE

    FRAUD_SVC --> DB
    FRAUD_SVC --> SC_FRAUD

    PAYMENT_SVC --> DB
    PAYMENT_SVC --> SC_PAYMENT
    PAYMENT_SVC --> PAY_GATEWAY

    CREDIT_SVC --> CREDIT_ENGINE
    CREDIT_SVC --> DB

    SC_KYC --> NETWORK
    SC_LOAN --> NETWORK
    SC_FRAUD --> NETWORK
    SC_PAYMENT --> NETWORK

    LOAN --> NOTIF
    KYC_SVC --> NOTIF
    PAYMENT_SVC --> NOTIF

    style NETWORK fill:#e3f2fd
    style SC_KYC fill:#e3f2fd
    style SC_LOAN fill:#e3f2fd
    style SC_FRAUD fill:#e3f2fd
    style SC_PAYMENT fill:#e3f2fd
    style CREDIT_ENGINE fill:#fff3e0
    style PAY_GATEWAY fill:#fff3e0
    style KYC_DB fill:#f3e5f5
```

---

### 2. Loan Application User Flow

Complete workflow from customer query to fund disbursement:

```mermaid
flowchart TD
    START([Customer Queries<br/>Loan Information]) --> BROWSE[Browse Loan Products<br/>on Web/Mobile App]
    BROWSE --> APPLY[Submit Loan<br/>Application]

    APPLY --> BLOCKCHAIN[Create Customer Profile<br/>on Blockchain]
    BLOCKCHAIN --> BLOCK_NOTE[New customer profile added as a block<br/>with unique hash linked to previous block]

    BLOCK_NOTE --> SMART_CONTRACT{Smart Contract<br/>Triggered}

    SMART_CONTRACT --> KYC_CHECK[Verification of Customer<br/>Identity & KYC Checks]
    KYC_CHECK --> KYC_MODULE[(KYC Module<br/>External Database)]

    KYC_MODULE --> KYC_RESULT{KYC Status?}
    KYC_RESULT -->|Verified| CREDIT_CHECK[Check Customer<br/>Credit Score]
    KYC_RESULT -->|Pending/Rejected| KYC_REJECT[Request Additional<br/>Documents]

    KYC_REJECT --> NOTIFY_KYC[Notify Customer]
    NOTIFY_KYC --> END1([End: Pending KYC])

    CREDIT_CHECK --> CREDIT_ENGINE[Credit Scoring<br/>Engine]
    CREDIT_ENGINE --> FRAUD_CHECK[Fraud Detection<br/>Analysis]

    FRAUD_CHECK --> RISK_SCORE{Risk Assessment}
    RISK_SCORE -->|High Risk| FRAUD_REVIEW[Manual Fraud<br/>Review Required]
    RISK_SCORE -->|Low/Medium Risk| THRESHOLD_CHECK

    FRAUD_REVIEW --> ADMIN_FRAUD[Admin Reviews<br/>Fraud Alert]
    ADMIN_FRAUD --> FRAUD_DECISION{Admin Decision}
    FRAUD_DECISION -->|Approve| THRESHOLD_CHECK
    FRAUD_DECISION -->|Reject| REJECT

    THRESHOLD_CHECK{Loan Amount Above<br/>Approval Threshold?}

    THRESHOLD_CHECK -->|Yes - Above $10,000| EXECUTIVE[Forward for Higher<br/>Approval by Executive]
    THRESHOLD_CHECK -->|No - Below $10,000| AUTO_APPROVE[Auto-Approve<br/>Loan]

    EXECUTIVE --> EXEC_REVIEW[Executive Reviews<br/>Application]
    EXEC_REVIEW --> EXEC_DECISION{Executive<br/>Decision?}

    EXEC_DECISION -->|Approve| APPROVE[Loan Approved]
    EXEC_DECISION -->|Reject| REJECT[Loan Rejected]

    AUTO_APPROVE --> APPROVE

    APPROVE --> DISBURSE[Disburse Funds via<br/>Designated Payment Gateway]
    DISBURSE --> BLOCKCHAIN_RECORD[Record Transaction<br/>on Blockchain]
    BLOCKCHAIN_RECORD --> NOTIFY_APPROVE[Notify Customer<br/>& Create Repayment Schedule]
    NOTIFY_APPROVE --> END2([End: Loan Disbursed])

    REJECT --> NOTIFY_REJECT[Notify Customer<br/>with Rejection Reason]
    NOTIFY_REJECT --> END3([End: Loan Rejected])

    style BLOCKCHAIN fill:#e3f2fd
    style SMART_CONTRACT fill:#e3f2fd
    style BLOCKCHAIN_RECORD fill:#e3f2fd
    style BLOCK_NOTE fill:#e1f5fe
    style CREDIT_ENGINE fill:#fff3e0
    style KYC_MODULE fill:#f3e5f5
    style APPROVE fill:#c8e6c9
    style REJECT fill:#ffcdd2
    style DISBURSE fill:#c8e6c9
```

---

### 3. Database Schema

Core database structure with Row-Level Security (RLS):

```mermaid
erDiagram
    PROFILES ||--o{ LOANS : "applies for"
    PROFILES ||--o{ KYC_DOCUMENTS : "uploads"
    PROFILES ||--o{ LOAN_PRODUCTS : "creates (institutions)"
    LOANS ||--o{ LOAN_REPAYMENTS : "has"
    LOANS ||--o{ FRAUD_DETECTION : "flagged for"
    LOANS ||--o{ PAYMENTS : "receives"
    PAYMENTS ||--o{ BLOCKCHAIN_TRANSACTIONS : "recorded as"

    PROFILES {
        uuid id PK
        text email
        text first_name
        text last_name
        text phone
        text role "borrower|institution|admin"
        text kyc_status "pending|verified|rejected"
        timestamp created_at
        timestamp updated_at
    }

    LOANS {
        uuid id PK
        uuid user_id FK
        uuid institution_id FK
        decimal amount
        decimal interest_rate
        int duration_months
        text status "pending|approved|rejected|active|completed|defaulted"
        text purpose
        decimal monthly_payment
        timestamp created_at
        timestamp updated_at
    }

    LOAN_PRODUCTS {
        uuid id PK
        uuid institution_id FK
        text name
        text description
        decimal min_amount
        decimal max_amount
        decimal interest_rate
        int duration_months
        text requirements
        timestamp created_at
    }

    KYC_DOCUMENTS {
        uuid id PK
        uuid user_id FK
        text document_type "id|proof_of_address|income_proof"
        text document_url
        text status "pending|verified|rejected"
        text rejection_reason
        timestamp uploaded_at
        timestamp verified_at
    }

    FRAUD_DETECTION {
        uuid id PK
        uuid loan_id FK
        uuid user_id FK
        decimal risk_score
        text risk_level "low|medium|high"
        text[] flags
        timestamp flagged_at
        timestamp reviewed_at
        uuid reviewed_by FK
        text action "approved|rejected|manual_review"
    }

    LOAN_REPAYMENTS {
        uuid id PK
        uuid loan_id FK
        decimal amount
        date due_date
        date paid_date
        text status "pending|paid|overdue"
        timestamp created_at
    }

    PAYMENTS {
        uuid id PK
        uuid user_id FK
        uuid loan_id FK
        decimal amount
        text payment_method "card|bank_transfer|crypto"
        text status "pending|completed|failed"
        timestamp created_at
        timestamp updated_at
    }

    BLOCKCHAIN_TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid payment_id FK
        text transaction_hash
        decimal amount
        text status "pending|confirmed|failed"
        text blockchain_network "ethereum|polygon|off-chain"
        timestamp created_at
        timestamp updated_at
    }
```

---

### 4. Multi-Role Dashboard Flow

Role-based access control and dashboard features:

```mermaid
flowchart LR
    LOGIN[User Login] --> AUTH{Authenticate & Get Role}

    AUTH -->|Borrower| B_DASH[Borrower Dashboard]
    AUTH -->|Institution| I_DASH[Institution Dashboard]
    AUTH -->|Admin| A_DASH[Admin Dashboard]

    B_DASH --> B1[View Profile & KYC]
    B_DASH --> B2[Browse Loans]
    B_DASH --> B3[Apply for Loans]
    B_DASH --> B4[Make Payments]

    B1 --> B1A[Pending: $5K limit]
    B1 --> B1B[Verified: $50K limit]
    B4 --> B4A[Card/Bank/Crypto]

    I_DASH --> I1[View Statistics]
    I_DASH --> I2[Manage Products]
    I_DASH --> I3[Review Applications]
    I_DASH --> I4[Approve/Reject]

    A_DASH --> A1[KYC Review]
    A_DASH --> A2[Fraud Detection]
    A_DASH --> A3[User Management]
    A_DASH --> A4[Audit Logs]

    A1 --> A1A{Verify or Reject}
    A2 --> A2A{Take Action}
```

---

### 5. Blockchain Integration Flow

Customer profile creation and transaction recording on blockchain:

```mermaid
sequenceDiagram
    participant User as Customer
    participant WebApp as Web/Mobile App
    participant API as API Gateway
    participant Auth as Authentication
    participant DB as Supabase DB
    participant Wallet as Web3 Wallet
    participant BC as Blockchain Network
    participant SC as Smart Contract
    participant Block as New Block

    Note over User,Block: 1. Customer Profile Creation

    User->>WebApp: Submit Loan Application
    WebApp->>API: POST /api/loans/apply
    API->>Auth: Verify User Session
    Auth-->>API: User Authenticated

    API->>DB: Check Existing Profile

    alt Profile Doesn't Exist on Blockchain
        API->>Wallet: Request Wallet Connection
        Wallet->>User: Prompt for Signature
        User->>Wallet: Approve & Sign
        Wallet-->>API: Wallet Address + Signature

        API->>SC: createCustomerProfile(address, hash)
        SC->>BC: Validate Transaction
        BC->>Block: Create New Block

        Note over Block: New customer profile added as a block<br/>comprised of unique hash carrying<br/>the hash of the previous block

        Block-->>BC: Block Added to Chain
        BC-->>SC: Transaction Confirmed
        SC-->>API: Profile Created (tx_hash)
        API->>DB: Store Profile with Blockchain Reference
    end

    Note over User,Block: 2. KYC Verification on Blockchain

    User->>WebApp: Upload KYC Documents
    WebApp->>API: POST /api/kyc/upload
    API->>DB: Store Document URLs
    API->>SC: initiateKYCVerification(userHash)

    SC->>SC: Execute KYC Checks
    Note over SC: Verification of customer identity<br/>and KYC checks executed

    SC-->>API: KYC Status (pending/verified)
    API->>DB: Update KYC Status
    API-->>WebApp: KYC Submitted
    WebApp-->>User: Verification in Progress

    Note over User,Block: 3. Credit Score & Fraud Check

    API->>SC: checkCreditScore(userHash)
    SC->>SC: Retrieve Credit Score from Engine
    SC->>SC: Run Fraud Detection Analysis

    alt High Risk Detected
        SC-->>API: Risk Score: High
        API->>DB: Create Fraud Alert
        API-->>WebApp: Manual Review Required
    else Low/Medium Risk
        SC-->>API: Risk Score: Low/Medium
        API->>SC: Proceed with Approval Logic
    end

    Note over User,Block: 4. Loan Approval & Smart Contract

    SC->>SC: Check Loan Amount Threshold

    alt Amount > Threshold
        SC-->>API: Requires Executive Approval
        API->>DB: Update Status: pending_approval
        API-->>WebApp: Forwarded for Higher Approval
    else Amount <= Threshold
        SC->>SC: Auto-Approve Loan
        SC-->>API: Loan Approved
        API->>DB: Update Status: approved
        API-->>WebApp: Loan Approved
    end

    Note over User,Block: 5. Fund Disbursement via Payment Gateway

    API->>SC: disburseFunds(loanId, amount, gateway)
    SC->>BC: Create Payment Transaction
    BC->>Block: Add Payment Block
    Block-->>BC: Transaction Recorded
    BC-->>SC: Payment Confirmed (tx_hash)

    SC-->>API: Disbursement Complete
    API->>DB: Record Payment with tx_hash
    API-->>WebApp: Funds Disbursed
    WebApp-->>User: Loan Approved & Funds Sent

    Note over User,Block: 6. Repayment Recording

    User->>WebApp: Make Loan Payment
    WebApp->>API: POST /api/payments
    API->>Wallet: Initiate Payment Transaction
    Wallet->>User: Confirm Payment
    User->>Wallet: Approve
    Wallet->>BC: Submit Payment Transaction
    BC->>Block: Add Repayment Block
    Block-->>BC: Transaction Confirmed
    BC-->>API: Payment Confirmed (tx_hash)
    API->>DB: Update Repayment Status
    API->>SC: recordRepayment(loanId, amount, tx_hash)
    SC-->>API: Repayment Recorded
    API-->>WebApp: Payment Successful
    WebApp-->>User: Payment Confirmed on Blockchain
```

---

### 6. Component Architecture

Frontend and backend component structure:

```mermaid
graph TB
    FRONTEND[Next.js Frontend]
    PAGES[App Pages]
    COMPONENTS[React Components]
    BACKEND[Backend Services]
    API[API Routes]
    DB[(Supabase Database)]
    STORAGE[File Storage]
    BLOCKCHAIN[Blockchain Network]
    SMART_CONTRACTS[Smart Contracts]
    EXTERNAL[External Services]

    FRONTEND --> PAGES
    FRONTEND --> COMPONENTS

    PAGES --> DASHBOARD[Dashboard Pages]
    PAGES --> AUTH[Auth Pages]
    PAGES --> ADMIN[Admin Pages]

    COMPONENTS --> DASH_COMP[Dashboard Components]
    COMPONENTS --> KYC_COMP[KYC Components]
    COMPONENTS --> PAY_COMP[Payment Components]
    COMPONENTS --> UI[UI Components]

    BACKEND --> API
    BACKEND --> DB
    BACKEND --> STORAGE

    API --> API_LOANS[Loans API]
    API --> API_KYC[KYC API]
    API --> API_PAYMENTS[Payments API]
    API --> API_FRAUD[Fraud API]

    DB --> PROFILES[User Profiles]
    DB --> LOANS[Loans]
    DB --> DOCUMENTS[KYC Documents]

    API_LOANS --> DB
    API_KYC --> DB
    API_KYC --> STORAGE
    API_PAYMENTS --> DB
    API_FRAUD --> DB

    API_LOANS --> SMART_CONTRACTS
    API_KYC --> SMART_CONTRACTS
    API_PAYMENTS --> SMART_CONTRACTS

    SMART_CONTRACTS --> BLOCKCHAIN

    API --> EXTERNAL
    EXTERNAL --> CREDIT[Credit Scoring]
    EXTERNAL --> GATEWAY[Payment Gateway]
    EXTERNAL --> NOTIFY[Notifications]
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.1.6 (App Router with Turbopack)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 4 + Radix UI components
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Hooks
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Web3 wallet integration
- **Storage**: Supabase Storage (for KYC documents)
- **API**: Next.js API Routes

### Blockchain
- **Network**: Polygon (EVM-compatible)
- **Smart Contracts**: Solidity
- **Web3 Integration**: ethers.js / web3.js
- **Wallet Support**: MetaMask, WalletConnect

### External Services
- **Payment Gateway**: Stripe / PayPal (sandbox)
- **Credit Scoring**: External API integration
- **Notifications**: Email/SMS service
- **Analytics**: Vercel Analytics

---

## Development

### Prerequisites
- Node.js 18+ or Bun
- Supabase account (for database)
- Polygon testnet wallet (for blockchain features)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd v0-microfinance-web-app-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   NEXT_PUBLIC_BLOCKCHAIN_NETWORK=polygon_mumbai
   NEXT_PUBLIC_SMART_CONTRACT_ADDRESS=your_contract_address
   ```

4. **Run database migrations**
   Execute SQL scripts in `/scripts/` folder in Supabase SQL Editor:
   - `001_create_tables.sql`
   - `002_create_triggers.sql`
   - `003_create_payment_tables.sql`

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open application**
   Navigate to `http://localhost:3000`

### Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Database Schema

The application uses Supabase (PostgreSQL) with Row-Level Security (RLS) enabled on all tables. Key tables include:

- **profiles**: User information with role-based access (borrower, institution, admin)
- **loans**: Loan applications and tracking
- **loan_products**: Available loan products from institutions
- **kyc_documents**: Identity verification documents
- **fraud_detection**: Fraud alerts and risk scoring
- **loan_repayments**: Payment schedules
- **payments**: Payment transactions
- **blockchain_transactions**: On-chain transaction records
- **audit_logs**: System audit trail

All tables have comprehensive RLS policies to ensure data security and privacy.

---

## Smart Contracts

### Deployed Contracts (Polygon Mumbai Testnet)

1. **KYC Contract**: Manages identity verification on-chain
2. **Loan Contract**: Handles loan agreements and approvals
3. **Fraud Detection Contract**: Automated fraud scoring
4. **Payment Contract**: Records loan repayments

### Contract Functions

See `/contracts/` directory for Solidity smart contract code (to be added).

---

## Multi-Role System

The platform supports three user roles with distinct permissions:

### 1. Borrower
- Apply for loans
- Upload KYC documents
- View loan status and payment history
- Make payments (card, bank transfer, crypto)

### 2. Institution
- Create and manage loan products
- Review loan applications
- Approve/reject applications
- Monitor portfolio performance

### 3. Admin
- Review and approve KYC documents
- Monitor fraud detection alerts
- Manage users and permissions
- Access system audit logs

---

## Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **Blockchain Immutability**: Tamper-proof transaction records
- **Smart Contract Automation**: Reduces human error and fraud
- **Multi-signature Approvals**: Executive approval for high-value loans
- **Fraud Detection**: Real-time risk scoring and monitoring
- **Audit Logs**: Complete system activity tracking
- **Data Encryption**: End-to-end encryption for sensitive data

---

## Deployment

### Vercel Deployment

The application is deployed on Vercel and auto-syncs with v0.app.

**Production URL**: [https://vercel.com/mosesmrimas-projects/v0-microfinance-web-app](https://vercel.com/mosesmrimas-projects/v0-microfinance-web-app)

**Continue building**: [https://v0.app/chat/projects/X5j7ozDI0vl](https://v0.app/chat/projects/X5j7ozDI0vl)

### Environment Variables (Vercel)

Configure in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Blockchain contract addresses
- Payment gateway API keys

---

## Contributing

This project is actively developed. For contributions:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Ensure tests pass (when implemented)

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues, questions, or feature requests, please open an issue in the GitHub repository.