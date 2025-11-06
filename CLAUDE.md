# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinFlow is a microfinance web application built with Next.js 15, featuring blockchain-powered lending, KYC verification, fraud detection, and multi-role dashboards. The application is deployed on Vercel and synced with v0.app.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint the codebase
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.1.6 (App Router with Turbopack)
- **UI**: React 18 with Radix UI components and Tailwind CSS 4
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL) with Row-Level Security (RLS)
- **Analytics**: Vercel Analytics
- **State**: Currently using mock data for frontend-only development

### Directory Structure

```
/app                    # Next.js App Router pages and routes
  /admin               # Admin role pages (KYC review, fraud detection)
  /auth                # Authentication pages (login, sign-up)
  /dashboard           # User dashboard pages and routes
  /institution         # Financial institution pages
  /lib                 # (Future) App-specific utilities and integrations

/components            # React components
  /admin               # Admin-specific components
  /dashboard           # User dashboard components
  /fraud               # Fraud detection components
  /institution         # Institution-specific components
  /kyc                 # KYC verification components
  /layout              # Layout components (DashboardLayout)
  /payments            # Payment-related components
  /ui                  # Shadcn/Radix UI components

/lib                   # Shared utilities and types
  mock-data.ts         # Mock data for development (no backend)
  types.ts             # TypeScript type definitions
  utils.ts             # Utility functions (cn, etc.)

/scripts               # Database migration scripts
  001_create_tables.sql        # Supabase table schemas
  002_create_triggers.sql      # Database triggers
  003_create_payment_tables.sql # Payment-related tables

/public                # Static assets
/styles                # Global styles
```

### Data Layer

**Current State**: The application uses mock data from `/lib/mock-data.ts` for frontend-only development. No actual backend connections are active.

**Database Schema** (Supabase/PostgreSQL):
- `profiles` - User profiles with role-based access (borrower, institution, admin)
- `loans` - Loan applications and status tracking
- `loan_products` - Available loan products from institutions
- `kyc_documents` - KYC verification documents
- `fraud_detection` - Fraud risk scoring and alerts
- `loan_repayments` - Repayment schedules and tracking
- `payments` - Payment transactions
- `blockchain_transactions` - Blockchain transaction records
- `audit_logs` - System audit trail

All tables have Row-Level Security (RLS) policies defined in `/scripts/001_create_tables.sql`.

### Key Types

Defined in `/lib/types.ts`:
- `UserRole`: "borrower" | "institution" | "admin"
- `KYCStatus`: "pending" | "verified" | "rejected"
- `LoanStatus`: "pending" | "approved" | "rejected" | "active" | "completed" | "defaulted"
- `Profile`, `Loan`, `LoanProduct`, `KYCDocument`, `FraudDetection`, `Payment`, `BlockchainTransaction`

### Multi-Role Dashboard System

The application supports three user roles, each with distinct dashboards:

1. **Borrower** (`/dashboard`)
   - View loan overview and active loans
   - Apply for new loans from available products
   - Manage KYC verification
   - Make payments and view payment history

2. **Institution** (`/institution`)
   - Manage loan products
   - View loan applications
   - Track statistics (disbursements, active loans)
   - Review borrower applications

3. **Admin** (`/admin`)
   - Review KYC documents (`/admin/kyc`)
   - Monitor fraud detection alerts (`/admin/fraud`)
   - Manage user profiles
   - Access audit logs

Navigation between roles is handled by `DashboardLayout` component at `components/layout/dashboard-layout.tsx`.

## Important Configuration

### Next.js Config (`next.config.mjs`)
- ESLint and TypeScript errors are ignored during builds for rapid prototyping
- Images are unoptimized (set `unoptimized: false` for production)

### Path Aliases
- `@/*` maps to root directory (defined in `tsconfig.json`)

### Environment Variables
While currently using mock data, the following will be needed when integrating Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## Known Issues

### Row-Level Security (RLS) Errors
The user context shows RLS policy errors when attempting to insert users:
```
Error: "new row violates row-level security policy for table \"users\""
```
This indicates that when Supabase integration is added, the RLS policies need adjustment or service role keys must be used for user creation.

### Hydration Mismatch
The dashboard experiences React hydration mismatches, likely due to client/server rendering differences in wallet connection status indicators. This should be resolved by ensuring consistent rendering between server and client.

### WalletConnect Initialization
The application initializes WalletConnect Core multiple times, which can lead to unexpected behavior. This should be fixed by implementing proper singleton pattern for Web3 provider initialization.

## Development Workflow

1. **Adding New Features**: Currently using mock data, so new features can be built frontend-first
2. **Database Changes**: Update SQL migration scripts in `/scripts/`
3. **Type Definitions**: Add/update types in `/lib/types.ts`
4. **UI Components**: Use existing Radix UI components from `/components/ui/`
5. **Styling**: Use Tailwind CSS classes with `cn()` utility from `/lib/utils.ts`

## Testing Approach

Currently no test suite is configured. When adding tests:
- Use Jest or Vitest for unit tests
- Consider Playwright for E2E tests
- Test RLS policies thoroughly with different user roles

## Deployment

- **Platform**: Vercel
- **Auto-deploy**: Syncs with v0.app deployments
- **Production URL**: Check README.md for current deployment link
- **Build Command**: `npm run build`
- **Environment**: Ensure environment variables are set in Vercel dashboard

## Future Integration Tasks

When moving from mock data to real backend:
1. Set up Supabase project and run migration scripts from `/scripts/`
2. Create Supabase client utilities in `app/lib/supabase/` or similar
3. Replace mock data imports with actual Supabase queries
4. Implement authentication with Supabase Auth
5. Add blockchain integration for payment verification
6. Configure Web3 wallet connection properly (fix WalletConnect issues)
7. Implement proper error boundaries and loading states
8. Enable TypeScript strict mode and fix build errors
