# Implementation Guide: Supabase + Blockchain Backend

## Quick Start Checklist

```bash
# 1. Install Required Dependencies
npm install @supabase/supabase-js ethers wagmi viem @tanstack/react-query

# 2. Install Dev Dependencies
npm install -D @typechain/ethers-v6 typechain hardhat @nomicfoundation/hardhat-toolbox

# 3. Set up environment variables
cp .env.example .env.local

# 4. Initialize Supabase project
# (Visit https://supabase.com/dashboard)

# 5. Run database migrations
# (Use Supabase SQL Editor)

# 6. Deploy smart contracts
# (Use Hardhat)
```

---

## Step 1: Install Dependencies

### Package Installation

```bash
# Core Backend
npm install @supabase/supabase-js@latest

# Web3 Libraries
npm install ethers@^6.10.0
npm install wagmi@^2.5.0
npm install viem@^2.7.0
npm install @tanstack/react-query@^5.20.0

# Smart Contract Development (DevDependencies)
npm install -D hardhat
npm install -D @nomicfoundation/hardhat-toolbox
npm install -D @typechain/hardhat
npm install -D @typechain/ethers-v6
npm install -D @openzeppelin/contracts
```

### Why Each Library?

- **@supabase/supabase-js**: Official Supabase client
- **ethers**: Interact with Ethereum blockchain
- **wagmi**: React hooks for Web3 (wallet connection, transactions)
- **viem**: TypeScript-first Ethereum library (wagmi dependency)
- **@tanstack/react-query**: Data fetching and caching
- **hardhat**: Smart contract development framework
- **@openzeppelin/contracts**: Secure smart contract templates

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: finflow-microfinance
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to users
4. Wait for project to be provisioned

### 2.2 Get Project Credentials

From Project Settings → API:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Keep secret!
```

### 2.3 Run Database Migrations

Go to SQL Editor in Supabase Dashboard and run in order:

**Step 1:** Run `/scripts/001_create_tables.sql`
**Step 2:** Run `/scripts/002_create_triggers.sql`
**Step 3:** Run `/scripts/003_create_payment_tables.sql`

**Step 4:** Run additional setup:

```sql
-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Set up storage policies (see BACKEND_MIGRATION_PLAN.md)
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

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

### 2.4 Test Database Connection

Create `/lib/supabase/test-connection.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export async function testSupabaseConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.from('profiles').select('count')

  if (error) {
    console.error('Supabase connection failed:', error)
    return false
  }

  console.log('Supabase connection successful!')
  return true
}
```

---

## Step 3: Smart Contract Development

### 3.1 Initialize Hardhat

```bash
mkdir contracts
cd contracts
npx hardhat init
# Choose: Create a TypeScript project
```

### 3.2 Configure Hardhat

**File:** `contracts/hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    },
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
}

export default config
```

### 3.3 Create Smart Contracts

**File:** `contracts/contracts/LoanAutoApproval.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LoanAutoApproval
 * @dev Automatic loan approval for loans under threshold
 */
contract LoanAutoApproval {
    struct LoanApplication {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 durationMonths;
        uint256 creditScore;
        bool kycVerified;
        bool autoApproved;
        bool manuallyApproved;
        uint256 timestamp;
        string backendLoanId;
    }

    mapping(bytes32 => LoanApplication) public applications;
    mapping(address => bytes32[]) public borrowerApplications;

    uint256 public constant AUTO_APPROVAL_THRESHOLD = 10000 * 10**6; // $10K USDC
    uint256 public constant MIN_CREDIT_SCORE = 650;

    address public mdAddress;
    address public financeDirectorAddress;
    address public systemAdmin;

    event LoanApplicationSubmitted(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 amount,
        string backendLoanId
    );
    event LoanAutoApproved(bytes32 indexed loanId, uint256 amount, string reason);
    event LoanRejected(bytes32 indexed loanId, string reason);
    event LoanEscalated(bytes32 indexed loanId, string reason);
    event LoanManuallyApproved(bytes32 indexed loanId, address approver);

    modifier onlyMD() {
        require(msg.sender == mdAddress, "Only MD can perform this action");
        _;
    }

    modifier onlyFinanceDirector() {
        require(msg.sender == financeDirectorAddress, "Only Finance Director");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == systemAdmin, "Only admin");
        _;
    }

    constructor(address _md, address _financeDirector, address _admin) {
        mdAddress = _md;
        financeDirectorAddress = _financeDirector;
        systemAdmin = _admin;
    }

    /**
     * @dev Submit loan application for processing
     */
    function submitLoanApplication(
        bytes32 loanId,
        string memory backendLoanId,
        uint256 amount,
        uint256 interestRate,
        uint256 durationMonths,
        uint256 creditScore,
        bool kycVerified
    ) external returns (bool autoApproved) {
        require(applications[loanId].timestamp == 0, "Application already exists");
        require(kycVerified, "KYC must be verified");
        require(amount > 0, "Amount must be greater than zero");
        require(creditScore >= 300 && creditScore <= 850, "Invalid credit score");

        applications[loanId] = LoanApplication({
            borrower: msg.sender,
            amount: amount,
            interestRate: interestRate,
            durationMonths: durationMonths,
            creditScore: creditScore,
            kycVerified: kycVerified,
            autoApproved: false,
            manuallyApproved: false,
            timestamp: block.timestamp,
            backendLoanId: backendLoanId
        });

        borrowerApplications[msg.sender].push(loanId);

        emit LoanApplicationSubmitted(loanId, msg.sender, amount, backendLoanId);

        // Auto-approval logic
        if (amount < AUTO_APPROVAL_THRESHOLD && creditScore >= MIN_CREDIT_SCORE) {
            applications[loanId].autoApproved = true;
            emit LoanAutoApproved(
                loanId,
                amount,
                "Meets auto-approval criteria"
            );
            return true;
        } else {
            // Escalation logic
            if (amount >= AUTO_APPROVAL_THRESHOLD) {
                emit LoanEscalated(
                    loanId,
                    "Amount exceeds auto-approval threshold - requires Finance Director"
                );
            } else if (creditScore < MIN_CREDIT_SCORE) {
                emit LoanEscalated(
                    loanId,
                    "Credit score below minimum - requires MD review"
                );
            }
            return false;
        }
    }

    /**
     * @dev MD manually approves loan
     */
    function mdApprove(bytes32 loanId) external onlyMD {
        LoanApplication storage app = applications[loanId];
        require(app.timestamp > 0, "Application does not exist");
        require(!app.autoApproved, "Already auto-approved");
        require(!app.manuallyApproved, "Already manually approved");
        require(app.amount < AUTO_APPROVAL_THRESHOLD, "Exceeds MD threshold");

        app.manuallyApproved = true;
        emit LoanManuallyApproved(loanId, msg.sender);
    }

    /**
     * @dev Finance Director manually approves high-value loan
     */
    function financeDirectorApprove(bytes32 loanId) external onlyFinanceDirector {
        LoanApplication storage app = applications[loanId];
        require(app.timestamp > 0, "Application does not exist");
        require(!app.manuallyApproved, "Already manually approved");

        app.manuallyApproved = true;
        emit LoanManuallyApproved(loanId, msg.sender);
    }

    /**
     * @dev Get all applications for a borrower
     */
    function getBorrowerApplications(address borrower)
        external
        view
        returns (bytes32[] memory)
    {
        return borrowerApplications[borrower];
    }

    /**
     * @dev Check if loan is approved (auto or manual)
     */
    function isLoanApproved(bytes32 loanId) external view returns (bool) {
        LoanApplication storage app = applications[loanId];
        return app.autoApproved || app.manuallyApproved;
    }

    /**
     * @dev Admin functions to update approvers
     */
    function updateMD(address newMD) external onlyAdmin {
        mdAddress = newMD;
    }

    function updateFinanceDirector(address newFD) external onlyAdmin {
        financeDirectorAddress = newFD;
    }
}
```

### 3.4 Write Tests

**File:** `contracts/test/LoanAutoApproval.test.ts`

```typescript
import { expect } from "chai"
import { ethers } from "hardhat"
import { LoanAutoApproval } from "../typechain-types"

describe("LoanAutoApproval", function () {
  let loanContract: LoanAutoApproval
  let owner: any, md: any, financeDirector: any, borrower: any

  beforeEach(async function () {
    [owner, md, financeDirector, borrower] = await ethers.getSigners()

    const LoanAutoApproval = await ethers.getContractFactory("LoanAutoApproval")
    loanContract = await LoanAutoApproval.deploy(
      md.address,
      financeDirector.address,
      owner.address
    )
  })

  describe("Auto-Approval", function () {
    it("Should auto-approve loan under $10K with good credit", async function () {
      const loanId = ethers.utils.formatBytes32String("loan-001")
      const amount = ethers.utils.parseUnits("5000", 6) // $5000
      const interestRate = 850 // 8.5%
      const duration = 12
      const creditScore = 720
      const kycVerified = true

      const tx = await loanContract
        .connect(borrower)
        .submitLoanApplication(
          loanId,
          "backend-loan-001",
          amount,
          interestRate,
          duration,
          creditScore,
          kycVerified
        )

      await expect(tx)
        .to.emit(loanContract, "LoanAutoApproved")
        .withArgs(loanId, amount, "Meets auto-approval criteria")

      const isApproved = await loanContract.isLoanApproved(loanId)
      expect(isApproved).to.be.true
    })

    it("Should escalate loan under $10K with poor credit", async function () {
      const loanId = ethers.utils.formatBytes32String("loan-002")
      const amount = ethers.utils.parseUnits("5000", 6)
      const creditScore = 600 // Below 650 threshold

      const tx = await loanContract
        .connect(borrower)
        .submitLoanApplication(
          loanId,
          "backend-loan-002",
          amount,
          850,
          12,
          creditScore,
          true
        )

      await expect(tx)
        .to.emit(loanContract, "LoanEscalated")
        .withArgs(loanId, "Credit score below minimum - requires MD review")
    })

    it("Should escalate high-value loan", async function () {
      const loanId = ethers.utils.formatBytes32String("loan-003")
      const amount = ethers.utils.parseUnits("15000", 6) // $15000

      const tx = await loanContract
        .connect(borrower)
        .submitLoanApplication(loanId, "backend-loan-003", amount, 750, 24, 750, true)

      await expect(tx)
        .to.emit(loanContract, "LoanEscalated")
        .withArgs(
          loanId,
          "Amount exceeds auto-approval threshold - requires Finance Director"
        )
    })
  })

  describe("Manual Approval", function () {
    it("MD should approve escalated loan", async function () {
      const loanId = ethers.utils.formatBytes32String("loan-004")
      const amount = ethers.utils.parseUnits("5000", 6)

      await loanContract
        .connect(borrower)
        .submitLoanApplication(loanId, "backend-loan-004", amount, 850, 12, 600, true)

      await expect(loanContract.connect(md).mdApprove(loanId))
        .to.emit(loanContract, "LoanManuallyApproved")
        .withArgs(loanId, md.address)

      const isApproved = await loanContract.isLoanApproved(loanId)
      expect(isApproved).to.be.true
    })

    it("Finance Director should approve high-value loan", async function () {
      const loanId = ethers.utils.formatBytes32String("loan-005")
      const amount = ethers.utils.parseUnits("15000", 6)

      await loanContract
        .connect(borrower)
        .submitLoanApplication(loanId, "backend-loan-005", amount, 750, 24, 750, true)

      await expect(loanContract.connect(financeDirector).financeDirectorApprove(loanId))
        .to.emit(loanContract, "LoanManuallyApproved")
        .withArgs(loanId, financeDirector.address)
    })
  })
})
```

### 3.5 Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network mumbai

# Verify on block explorer
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

---

## Step 4: Frontend Integration

### 4.1 Create Supabase Client

**File:** `/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 4.2 Set Up Web3 Provider

**File:** `/lib/web3/config.ts`

```typescript
import { createConfig, http } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

export const config = createConfig({
  chains: [polygon, polygonMumbai],
  connectors: [
    injected(),
    walletConnect({ projectId })
  ],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http()
  }
})
```

**File:** `/app/providers.tsx`

```typescript
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/web3/config'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

Update `/app/layout.tsx`:
```typescript
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## Step 5: Migration Checklist

### Authentication
- [ ] Replace `useAuth` hook to use Supabase
- [ ] Update login page
- [ ] Update signup page
- [ ] Migrate hardcoded users to Supabase Auth

### Data Layer
- [ ] Create `/lib/supabase/queries.ts`
- [ ] Replace `getLoans()` with Supabase query
- [ ] Replace `getLoansByUserId()` with Supabase query
- [ ] Replace `createLoan()` with Supabase insert
- [ ] Update all components to use new queries

### File Storage
- [ ] Update KYC upload to use Supabase Storage
- [ ] Implement file download from Storage
- [ ] Add file size validation

### Smart Contracts
- [ ] Deploy LoanAutoApproval contract
- [ ] Create contract interaction hooks
- [ ] Integrate auto-approval flow in loan application
- [ ] Add transaction status tracking

---

## Environment Variables Template

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SERVER ONLY!

# Blockchain (Polygon)
NEXT_PUBLIC_CHAIN_ID=80001 # Mumbai testnet
NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx

# For Contract Deployment
PRIVATE_KEY=0x... # DO NOT COMMIT!
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=xxx

# API Keys
KYC_API_KEY=xxx
CREDIT_API_KEY=xxx
```

---

## Testing Strategy

1. **Unit Tests**: Test smart contracts with Hardhat
2. **Integration Tests**: Test Supabase queries
3. **E2E Tests**: Test complete loan flow
4. **Manual Testing**: Test UI flows in browser

---

## Deployment Checklist

### Testnet Deployment
- [ ] Deploy contracts to Mumbai
- [ ] Verify contracts on PolygonScan
- [ ] Test auto-approval with real transactions
- [ ] Test manual approval flows

### Production Deployment
- [ ] Audit smart contracts
- [ ] Deploy to Polygon Mainnet
- [ ] Configure production Supabase
- [ ] Set up monitoring and alerts
- [ ] Deploy frontend to Vercel

---

## Next Steps

1. **NOW**: Review this guide
2. **NEXT**: Install dependencies
3. **THEN**: Set up Supabase project
4. **AFTER**: Deploy and test smart contracts
5. **FINALLY**: Migrate frontend components

Ready to start? Let me know which phase you'd like to begin with!
