/**
 * API Route: Verify KYC Document
 *
 * Flow:
 * 1. Admin/System reviews KYC document
 * 2. Update status in Supabase
 * 3. Record on blockchain (immutable audit trail)
 * 4. Notify user
 *
 * User sees: "KYC Verified ✓"
 * User doesn't see: Blockchain transaction recording this verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateKYCStatusOnChain,
  KYCStatus as BlockchainKYCStatus
} from '@/lib/blockchain/client'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      documentId,
      status,
      verifiedBy,
      rejectionReason
    } = await request.json()

    // Validate input
    if (!documentId || !status || !verifiedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient()

    // Get document
    const { data: document, error: docError } = await supabase
      .from('kyc_documents')
      .select('*, profiles(*)')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const userId = document.user_id

    // Update document status in Supabase
    const { error: updateError } = await supabase
      .from('kyc_documents')
      .update({
        status,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        verified_by: verifiedBy,
        rejection_reason: rejectionReason || null
      })
      .eq('id', documentId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update document status' },
        { status: 500 }
      )
    }

    // Check if all Stage 1 documents are verified
    const { data: allStage1Docs } = await supabase
      .from('kyc_documents')
      .select('status')
      .eq('user_id', userId)
      .eq('stage', 'stage1')

    const allVerified = allStage1Docs?.every(doc => doc.status === 'verified')
    const anyRejected = allStage1Docs?.some(doc => doc.status === 'rejected')

    // Update user's overall KYC status
    let overallKYCStatus: string
    let blockchainKYCStatus: BlockchainKYCStatus

    if (allVerified) {
      overallKYCStatus = 'verified'
      blockchainKYCStatus = BlockchainKYCStatus.VERIFIED
    } else if (anyRejected) {
      overallKYCStatus = 'rejected'
      blockchainKYCStatus = BlockchainKYCStatus.REJECTED
    } else {
      overallKYCStatus = 'pending'
      blockchainKYCStatus = BlockchainKYCStatus.PENDING
    }

    await supabase
      .from('profiles')
      .update({
        kyc_status: overallKYCStatus,
        kyc_stage1_completed: allVerified,
        kyc_stage1_status: overallKYCStatus
      })
      .eq('id', userId)

    // Generate document hash for blockchain
    const documentHash = crypto
      .createHash('sha256')
      .update(`${userId}-${documentId}-${document.document_url}`)
      .digest('hex')

    // Record on blockchain (background)
    console.log(`📝 Recording KYC verification for user ${userId} on blockchain...`)

    const blockchainResult = await updateKYCStatusOnChain(
      userId,
      blockchainKYCStatus,
      verifiedBy,
      documentHash
    )

    if (!blockchainResult.success) {
      console.error('⚠️ Blockchain recording failed:', blockchainResult.error)
      // Continue anyway - blockchain is optional audit trail
    } else {
      console.log(`✅ KYC verification recorded on blockchain: ${blockchainResult.txHash}`)

      // Store blockchain transaction
      await supabase.from('blockchain_transactions').insert({
        user_id: userId,
        transaction_hash: blockchainResult.txHash,
        transaction_type: 'kyc_verification',
        status: 'confirmed',
        metadata: {
          documentId,
          status: overallKYCStatus,
          verifiedBy
        }
      })
    }

    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'kyc_status',
      title:
        overallKYCStatus === 'verified'
          ? 'KYC Verified'
          : overallKYCStatus === 'rejected'
            ? 'KYC Rejected'
            : 'KYC Under Review',
      message:
        overallKYCStatus === 'verified'
          ? 'Your identity has been successfully verified. You can now apply for loans!'
          : overallKYCStatus === 'rejected'
            ? `Your KYC verification was rejected. ${rejectionReason || 'Please resubmit your documents.'}`
            : 'Your KYC documents are being reviewed.',
      read: false
    })

    return NextResponse.json({
      success: true,
      kyc: {
        documentId,
        status: overallKYCStatus,
        message:
          overallKYCStatus === 'verified'
            ? 'KYC successfully verified'
            : overallKYCStatus === 'rejected'
              ? 'KYC rejected'
              : 'KYC under review'
      },
      blockchain: blockchainResult.success
        ? {
            recorded: true,
            txHash: blockchainResult.txHash
          }
        : {
            recorded: false,
            error: blockchainResult.error
          }
    })
  } catch (error: any) {
    console.error('❌ Error verifying KYC:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
