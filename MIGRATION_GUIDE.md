# FinFlow - Supabase Migration Guide (Simplified)

This guide helps you migrate from mock data to a live Supabase backend.

---

## Prerequisites

- Node.js 18+
- A Supabase account (free tier works fine)
- (Optional) MetaMask wallet for blockchain features

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - **Project Name**: FinFlow
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait 2-3 minutes for setup to complete

---

## Step 2: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" (creates 6 tables)
5. Create another new query
6. Copy and paste the contents of `supabase/migrations/002_rls_policies.sql`
7. Click "Run" (enables security policies)

You should now see 6 tables in the **Table Editor**:
- profiles
- institutions
- loan_products
- loans
- payments
- kyc_documents

---

## Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 4: Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

---

## Step 5: Test the Connection

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. The app should still work with mock data

3. To test Supabase connection, open browser console and run:
   ```javascript
   const { createClient } = await import('@supabase/supabase-js')
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   )
   const { data } = await supabase.from('profiles').select('*')
   console.log(data) // Should return empty array []
   ```

---

## Step 6: Add Seed Data (Optional)

To test with sample data:

1. In Supabase SQL Editor, run `supabase/seed.sql`
2. This creates demo users and sample loans
3. You can now test the app with realistic data

---

## Step 7: Migrate from Mock Data

The app currently uses `lib/mock-data.ts`. To use Supabase:

### Example: Fetch User Profile

**Before (Mock):**
```typescript
import { mockUsers } from '@/lib/mock-data'
const user = mockUsers[0]
```

**After (Supabase):**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: user } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single()
```

### Example: Create Loan Application

**Before (Mock):**
```typescript
// Just display form, no save
```

**After (Supabase):**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('loans')
  .insert({
    user_id: userId,
    product_id: productId,
    institution_id: institutionId,
    amount: 5000,
    duration_months: 12,
    status: 'pending'
  })
```

---

## Step 8: Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable "Email" provider
3. (Optional) Enable social logins (Google, GitHub, etc.)
4. Update your auth forms to use Supabase Auth:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

---

## Step 9: Deploy to Production

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **Add Environment Variables in Vercel:**
   - Go to your project settings
   - Add the same env vars from `.env.local`

3. **Secure Your Database:**
   - RLS is already enabled (from Step 2)
   - Only authenticated users can access their own data
   - Admins have full access

---

## Optional: Deploy Smart Contract

The smart contract is optional for audit trail features.

1. **Install Hardhat:**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Deploy to Mumbai Testnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```

3. **Add Contract Address:**
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_ID=80001
   ```

---

## Troubleshooting

### Database Connection Errors
- Check your `.env.local` file has correct credentials
- Ensure Supabase URL includes `https://`
- Verify anon key is complete (very long string)

### RLS Blocking Queries
- Make sure user is authenticated
- Check RLS policies in Supabase dashboard
- For testing, you can temporarily disable RLS

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript types match database schema

---

## Next Steps

- Customize the database schema for your needs
- Add more user roles and permissions
- Implement email notifications
- Set up file storage for KYC documents
- Add analytics and reporting

---

## Support

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Project README: See main README.md

---

Congratulations! Your FinFlow app is now running on a live backend! 🎉
