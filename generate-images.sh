#!/bin/bash

# Script to generate PNG images from Mermaid diagrams using mermaid.ink API

set -e

echo "Creating images directory..."
mkdir -p docs/images

echo ""
echo "Generating diagram images..."
echo ""

# Diagram 1: System Architecture
echo "1/6 Generating System Architecture..."
MERMAID1=$(cat <<'DIAGRAM1'
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
DIAGRAM1
)

ENCODED1=$(echo -n "$MERMAID1" | base64 -w 0 | sed 's/+/-/g; s/\//_/g; s/=//g')
curl -s -o docs/images/01-system-architecture.png "https://mermaid.ink/img/$ENCODED1?type=png&width=2400&bgColor=white"
echo "✓ Saved: docs/images/01-system-architecture.png (High Quality, 2400px width)"

# Diagram 2: Loan Flow
echo "2/6 Generating Loan Application Flow..."
MERMAID2=$(cat <<'DIAGRAM2'
flowchart TD
    START([Customer Applies for Loan]) --> BLOCKCHAIN[Create Profile on Blockchain]
    BLOCKCHAIN --> NOTE[Profile added as new block with unique hash]

    NOTE --> SMART{Smart Contract Triggered}
    SMART --> KYC[KYC Verification]

    KYC --> KYC_CHECK{KYC Status?}
    KYC_CHECK -->|Verified| CREDIT[Credit Score Check]
    KYC_CHECK -->|Rejected| KYC_END([Request Documents])

    CREDIT --> FRAUD[Fraud Detection]
    FRAUD --> RISK{Risk Level?}

    RISK -->|High| MANUAL[Manual Review]
    RISK -->|Low/Medium| THRESHOLD{Amount Check}

    MANUAL --> ADMIN{Admin Decision}
    ADMIN -->|Approve| THRESHOLD
    ADMIN -->|Reject| REJECT

    THRESHOLD -->|Above $10K| EXEC[Executive Approval]
    THRESHOLD -->|Below $10K| APPROVE[Auto-Approve]

    EXEC --> EXEC_DEC{Executive Decision}
    EXEC_DEC -->|Approve| APPROVE
    EXEC_DEC -->|Reject| REJECT

    APPROVE --> DISBURSE[Disburse Funds]
    DISBURSE --> RECORD[Record on Blockchain]
    RECORD --> SUCCESS([Loan Disbursed])

    REJECT --> NOTIFY([Notify Customer])
DIAGRAM2
)

ENCODED2=$(echo -n "$MERMAID2" | base64 -w 0 | sed 's/+/-/g; s/\//_/g; s/=//g')
curl -s -o docs/images/02-loan-flow.png "https://mermaid.ink/img/$ENCODED2?type=png&width=2400&bgColor=white"
echo "✓ Saved: docs/images/02-loan-flow.png (High Quality, 2400px width)"

# Diagram 3: Database Schema
echo "3/6 Generating Database Schema..."
MERMAID3=$(cat <<'DIAGRAM3'
erDiagram
    PROFILES ||--o{ LOANS : has
    LOANS ||--o{ PAYMENTS : receives
    PAYMENTS ||--o{ BLOCKCHAIN_TX : records

    PROFILES {
        uuid id
        text email
        text role
        text kyc_status
    }

    LOANS {
        uuid id
        uuid user_id
        decimal amount
        text status
    }

    PAYMENTS {
        uuid id
        uuid loan_id
        decimal amount
        text method
    }

    BLOCKCHAIN_TX {
        uuid id
        uuid payment_id
        text tx_hash
        text network
    }
DIAGRAM3
)

ENCODED3=$(echo -n "$MERMAID3" | base64 -w 0 | sed 's/+/-/g; s/\//_/g; s/=//g')
curl -s -o docs/images/03-database-schema.png "https://mermaid.ink/img/$ENCODED3?type=png&width=2400&bgColor=white"
echo "✓ Saved: docs/images/03-database-schema.png (High Quality, 2400px width)"

# Diagram 4: Multi-Role Dashboard
echo "4/6 Generating Multi-Role Dashboard..."
MERMAID4=$(cat <<'DIAGRAM4'
flowchart TD
    LOGIN[User Login] --> AUTH{Get Role}

    AUTH -->|Borrower| B[Borrower Dashboard]
    AUTH -->|Institution| I[Institution Dashboard]
    AUTH -->|Admin| A[Admin Dashboard]

    B --> B1[Apply for Loans]
    B --> B2[Make Payments]
    B --> B3[Upload KYC]

    I --> I1[Manage Products]
    I --> I2[Review Applications]

    A --> A1[Review KYC]
    A --> A2[Monitor Fraud]
DIAGRAM4
)

ENCODED4=$(echo -n "$MERMAID4" | base64 -w 0 | sed 's/+/-/g; s/\//_/g; s/=//g')
curl -s -o docs/images/04-multi-role-dashboard.png "https://mermaid.ink/img/$ENCODED4?type=png&width=2400&bgColor=white"
echo "✓ Saved: docs/images/04-multi-role-dashboard.png (High Quality, 2400px width)"

# Diagram 5: Blockchain Integration
echo "5/6 Generating Blockchain Integration Flow..."
MERMAID5=$(cat <<'DIAGRAM5'
sequenceDiagram
    participant User
    participant App
    participant API
    participant DB
    participant SC as Smart Contract
    participant BC as Blockchain

    Note over User,BC: Profile Creation
    User->>App: Submit Application
    App->>API: Create Loan Request
    API->>SC: createCustomerProfile
    SC->>BC: Add Block
    BC-->>SC: Block Created
    SC-->>API: Profile Created
    API->>DB: Store Reference

    Note over User,BC: KYC Verification
    User->>App: Upload Documents
    App->>API: Submit KYC
    API->>SC: initiateKYCVerification
    SC->>SC: Execute Checks
    SC-->>API: KYC Status
    API->>DB: Update Status

    Note over User,BC: Loan Processing
    API->>SC: checkCreditScore
    SC->>SC: Fraud Detection

    alt High Risk
        SC-->>API: Manual Review
    else Low Risk
        SC->>SC: Check Threshold
        alt High Amount
            SC-->>API: Executive Approval
        else Low Amount
            SC-->>API: Auto-Approve
        end
    end

    Note over User,BC: Disbursement
    API->>SC: disburseFunds
    SC->>BC: Create Payment Block
    BC-->>SC: Payment Confirmed
    SC-->>API: Complete
    API->>DB: Record Payment
    API-->>App: Success
    App-->>User: Funds Disbursed
DIAGRAM5
)

ENCODED5=$(echo -n "$MERMAID5" | base64 -w 0 | sed 's/+/-/g; s/\//_/g; s/=//g')
curl -s -o docs/images/05-blockchain-integration.png "https://mermaid.ink/img/$ENCODED5?type=png&width=2400&bgColor=white"
echo "✓ Saved: docs/images/05-blockchain-integration.png (High Quality, 2400px width)"

# Diagram 6: Component Architecture
echo "6/6 Generating Component Architecture..."
MERMAID6=$(cat <<'DIAGRAM6'
graph TB
    USER[User] --> FRONTEND[Next.js Frontend]
    FRONTEND --> API[API Routes]
    API --> DB[(Supabase DB)]
    API --> BLOCKCHAIN[Blockchain Network]
    API --> EXTERNAL[External Services]

    FRONTEND -.-> PAGES[Pages]
    FRONTEND -.-> COMPONENTS[Components]

    API -.-> LOANS[Loans API]
    API -.-> KYC[KYC API]
    API -.-> PAYMENTS[Payments API]

    BLOCKCHAIN -.-> CONTRACTS[Smart Contracts]

    EXTERNAL -.-> CREDIT[Credit Scoring]
    EXTERNAL -.-> GATEWAY[Payment Gateway]
DIAGRAM6
)

ENCODED6=$(echo -n "$MERMAID6" | base64 -w 0 | sed 's/+/-/g; s/\//_/g; s/=//g')
curl -s -o docs/images/06-component-architecture.png "https://mermaid.ink/img/$ENCODED6?type=png&width=2400&bgColor=white"
echo "✓ Saved: docs/images/06-component-architecture.png (High Quality, 2400px width)"

echo ""
echo "============================================"
echo "✓ All 6 HIGH QUALITY diagram images generated!"
echo "============================================"
echo ""
echo "Quality Settings:"
echo "  - Width: 2400px (Large, high-resolution images)"
echo "  - Type: PNG (high quality)"
echo "  - Background: White (clean and professional)"
echo "  - Result: 3-4x larger text and much better visibility"
echo ""
echo "Images saved to: docs/images/"
ls -lh docs/images/*.png
