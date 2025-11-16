/**
 * API Route: Submit Loan Application
 *
 * Flow:
 * 1. Receive loan application from frontend
 * 2. Validate and save to Supabase
 * 3. Submit to blockchain (background, transparent to user)
 * 4. Update Supabase with blockchain result
 * 5. Return result to frontend
 *
 * User sees: "Application submitted" → "Approved!" (or "Under review")
 * User doesn't see: Blockchain transaction, gas fees, wallet, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  submitLoanToBlockchain,
  isKYCVerifiedOnChain
} from '@/lib/blockchain/client'

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      amount,
      interestRate,
      durationMonths,
      purpose
    } = await request.json()

    // Validate input
    if (!userId || !amount || !interestRate || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient()

    // Get user's credit score from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credit_score, kyc_status')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check KYC status
    if (profile.kyc_status !== 'verified') {
      return NextResponse.json(
        { error: 'KYC verification required' },
        { status: 403 }
      )
    }

    // Get credit score (if not in profile, run credit check)
    let creditScore = profile.credit_score
    if (!creditScore) {
      // Call credit score API (placeholder for now)
      creditScore = await getCreditScore(userId)

      // Update profile with credit score
      await supabase
        .from('profiles')
        .update({ credit_score: creditScore })
        .eq('id', userId)
    }

    // Create loan record in Supabase
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .insert({
        user_id: userId,
        amount,
        interest_rate: interestRate,
        duration_months: durationMonths,
        purpose,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (loanError || !loan) {
      return NextResponse.json(
        { error: 'Failed to create loan application' },
        { status: 500 }
      )
    }

    const loanId = loan.id

    // Submit to blockchain (in background)
    // Convert amount to cents for blockchain
    const amountInCents = Math.round(amount * 100)

    console.log(`💰 Submitting loan ${loanId} to blockchain...`)

    const blockchainResult = await submitLoanToBlockchain(
      loanId,
      userId,
      amountInCents,
      creditScore
    )

    if (!blockchainResult.success) {
      // Blockchain failed, but loan is still submitted
      console.error('⚠️ Blockchain submission failed:', blockchainResult.error)

      // Update loan with error status
      await supabase
        .from('loans')
        .update({
          status: 'under_review',
          blockchain_error: blockchainResult.error
        })
        .eq('id', loanId)

      return NextResponse.json({
        success: true,
        loan: {
          id: loanId,
          status: 'under_review',
          message: 'Application submitted for review'
        },
        blockchainError: 'Blockchain unavailable, proceeding with manual review'
      })
    }

    // Blockchain succeeded!
    const { autoApproved, txHash } = blockchainResult

    // Update loan with blockchain result
    const newStatus = autoApproved ? 'approved' : 'pending_md'

    await supabase
      .from('loans')
      .update({
        status: newStatus,
        approved_at: autoApproved ? new Date().toISOString() : null,
        approved_by: autoApproved ? 'SYSTEM' : null,
        blockchain_tx_hash: txHash
      })
      .eq('id', loanId)

    // Create blockchain transaction record
    await supabase.from('blockchain_transactions').insert({
      user_id: userId,
      transaction_hash: txHash,
      transaction_type: 'loan_submission',
      status: 'confirmed',
      metadata: {
        loanId,
        autoApproved,
        amount: amountInCents
      }
    })

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: userId,
      type: autoApproved ? 'application_status' : 'new_application',
      title: autoApproved ? 'Loan Approved!' : 'Application Received',
      message: autoApproved
        ? `Your loan application for $${amount.toLocaleString()} has been automatically approved!`
        : 'Your loan application is under review by our team.',
      read: false
    })

    return NextResponse.json({
      success: true,
      loan: {
        id: loanId,
        status: newStatus,
        autoApproved,
        message: autoApproved
          ? `Congratulations! Your loan of $${amount.toLocaleString()} has been approved!`
          : 'Your application is under review. We will notify you once a decision is made.'
      },
      blockchain: {
        recorded: true,
        txHash
      }
    })
  } catch (error: any) {
    console.error('❌ Error submitting loan:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get credit score for user (placeholder)
 * In production: Call real credit bureau API
 */
async function getCreditScore(userId: string): Promise<number> {
  // Placeholder: Generate consistent score based on userId
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return 550 + (hash % 300) // Score between 550-850
}
