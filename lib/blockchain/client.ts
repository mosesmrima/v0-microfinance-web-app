/**
 * Blockchain Client - Server-Side Only
 *
 * This module handles all blockchain interactions using a system wallet.
 * Users NEVER interact with blockchain directly - it runs in the background.
 *
 * Security: SYSTEM_PRIVATE_KEY must never be exposed to frontend!
 */

import { ethers } from 'ethers'
import FinFlowLoanRegistryABI from './abis/FinFlowLoanRegistry.json'

// Contract configuration
const CONTRACT_ADDRESS = process.env.LOAN_REGISTRY_CONTRACT_ADDRESS!
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL!
const SYSTEM_PRIVATE_KEY = process.env.SYSTEM_PRIVATE_KEY! // Server-side only!

// Initialize provider and wallet
let provider: ethers.JsonRpcProvider | null = null
let systemWallet: ethers.Wallet | null = null
let contract: ethers.Contract | null = null

/**
 * Initialize blockchain connection
 * Called once on server startup
 */
export function initializeBlockchain() {
  if (!CONTRACT_ADDRESS || !RPC_URL || !SYSTEM_PRIVATE_KEY) {
    console.warn('Blockchain not configured - running without blockchain features')
    return false
  }

  try {
    provider = new ethers.JsonRpcProvider(RPC_URL)
    systemWallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider)
    contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      FinFlowLoanRegistryABI,
      systemWallet
    )

    console.log('✅ Blockchain initialized')
    console.log('📝 Contract address:', CONTRACT_ADDRESS)
    console.log('👛 System wallet:', systemWallet.address)
    return true
  } catch (error) {
    console.error('❌ Failed to initialize blockchain:', error)
    return false
  }
}

/**
 * Ensure blockchain is initialized
 */
function ensureInitialized() {
  if (!contract || !systemWallet) {
    initializeBlockchain()
  }
  if (!contract) {
    throw new Error('Blockchain not initialized')
  }
}

// ===========================================
// KYC FUNCTIONS
// ===========================================

export enum KYCStatus {
  NOT_SUBMITTED = 0,
  PENDING = 1,
  VERIFIED = 2,
  REJECTED = 3
}

/**
 * Update KYC status on blockchain
 * @param userId Supabase user ID
 * @param status KYC status
 * @param verifiedBy ID of verifier
 * @param documentHash Hash of documents
 */
export async function updateKYCStatusOnChain(
  userId: string,
  status: KYCStatus,
  verifiedBy: string,
  documentHash: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    ensureInitialized()

    console.log(`📝 Updating KYC status for user ${userId} to ${status}`)

    const tx = await contract!.updateKYCStatus(
      userId,
      status,
      verifiedBy,
      documentHash
    )

    const receipt = await tx.wait()

    console.log(`✅ KYC status updated on blockchain: ${receipt.hash}`)

    return {
      success: true,
      txHash: receipt.hash
    }
  } catch (error: any) {
    console.error('❌ Failed to update KYC status on chain:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get KYC status from blockchain
 * @param userId Supabase user ID
 */
export async function getKYCStatusFromChain(
  userId: string
): Promise<KYCStatus | null> {
  try {
    ensureInitialized()

    const status = await contract!.getKYCStatus(userId)
    return Number(status) as KYCStatus
  } catch (error) {
    console.error('❌ Failed to get KYC status from chain:', error)
    return null
  }
}

/**
 * Check if user's KYC is verified on blockchain
 * @param userId Supabase user ID
 */
export async function isKYCVerifiedOnChain(userId: string): Promise<boolean> {
  try {
    ensureInitialized()

    const verified = await contract!.isKYCVerified(userId)
    return verified
  } catch (error) {
    console.error('❌ Failed to check KYC verification:', error)
    return false
  }
}

// ===========================================
// LOAN APPROVAL FUNCTIONS
// ===========================================

export enum LoanStatusOnChain {
  SUBMITTED = 0,
  AUTO_APPROVED = 1,
  PENDING_MANUAL = 2,
  MANUALLY_APPROVED = 3,
  REJECTED = 4,
  DISBURSED = 5
}

/**
 * Submit loan application to blockchain
 * Returns whether loan was auto-approved
 *
 * @param loanId Supabase loan ID
 * @param userId Supabase user ID
 * @param amount Loan amount in cents (e.g., $10,000 = 1000000)
 * @param creditScore User's credit score
 */
export async function submitLoanToBlockchain(
  loanId: string,
  userId: string,
  amount: number,
  creditScore: number
): Promise<{
  success: boolean
  autoApproved?: boolean
  txHash?: string
  error?: string
}> {
  try {
    ensureInitialized()

    console.log(`📝 Submitting loan ${loanId} to blockchain`)
    console.log(`   Amount: $${(amount / 100).toFixed(2)}`)
    console.log(`   Credit Score: ${creditScore}`)

    const tx = await contract!.submitLoanApplication(
      loanId,
      userId,
      amount,
      creditScore
    )

    const receipt = await tx.wait()

    // Check if loan was auto-approved
    const autoApprovedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract!.interface.parseLog(log)
        return parsed?.name === 'LoanAutoApproved'
      } catch {
        return false
      }
    })

    const autoApproved = !!autoApprovedEvent

    console.log(
      autoApproved
        ? `✅ Loan ${loanId} AUTO-APPROVED on blockchain`
        : `⏳ Loan ${loanId} escalated for manual review`
    )

    return {
      success: true,
      autoApproved,
      txHash: receipt.hash
    }
  } catch (error: any) {
    console.error('❌ Failed to submit loan to blockchain:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Manually approve a loan on blockchain
 * @param loanId Supabase loan ID
 * @param approverId ID of approver (MD or Finance Director)
 */
export async function manuallyApproveLoanOnChain(
  loanId: string,
  approverId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    ensureInitialized()

    console.log(`📝 Manually approving loan ${loanId} by ${approverId}`)

    const tx = await contract!.manuallyApproveLoan(loanId, approverId)
    const receipt = await tx.wait()

    console.log(`✅ Loan ${loanId} manually approved on blockchain`)

    return {
      success: true,
      txHash: receipt.hash
    }
  } catch (error: any) {
    console.error('❌ Failed to manually approve loan on chain:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Reject a loan on blockchain
 * @param loanId Supabase loan ID
 * @param reason Rejection reason
 */
export async function rejectLoanOnChain(
  loanId: string,
  reason: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    ensureInitialized()

    console.log(`📝 Rejecting loan ${loanId}: ${reason}`)

    const tx = await contract!.rejectLoan(loanId, reason)
    const receipt = await tx.wait()

    console.log(`✅ Loan ${loanId} rejected on blockchain`)

    return {
      success: true,
      txHash: receipt.hash
    }
  } catch (error: any) {
    console.error('❌ Failed to reject loan on chain:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Mark loan as disbursed on blockchain
 * @param loanId Supabase loan ID
 */
export async function markLoanDisbursedOnChain(
  loanId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    ensureInitialized()

    console.log(`📝 Marking loan ${loanId} as disbursed`)

    const tx = await contract!.markLoanDisbursed(loanId)
    const receipt = await tx.wait()

    console.log(`✅ Loan ${loanId} marked as disbursed on blockchain`)

    return {
      success: true,
      txHash: receipt.hash
    }
  } catch (error: any) {
    console.error('❌ Failed to mark loan as disbursed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get loan status from blockchain
 * @param loanId Supabase loan ID
 */
export async function getLoanStatusFromChain(
  loanId: string
): Promise<LoanStatusOnChain | null> {
  try {
    ensureInitialized()

    const status = await contract!.getLoanStatus(loanId)
    return Number(status) as LoanStatusOnChain
  } catch (error) {
    console.error('❌ Failed to get loan status from chain:', error)
    return null
  }
}

/**
 * Check if loan is approved on blockchain
 * @param loanId Supabase loan ID
 */
export async function isLoanApprovedOnChain(loanId: string): Promise<boolean> {
  try {
    ensureInitialized()

    const approved = await contract!.isLoanApproved(loanId)
    return approved
  } catch (error) {
    console.error('❌ Failed to check loan approval:', error)
    return false
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get current blockchain block number
 */
export async function getCurrentBlockNumber(): Promise<number | null> {
  try {
    ensureInitialized()
    const blockNumber = await provider!.getBlockNumber()
    return blockNumber
  } catch (error) {
    console.error('❌ Failed to get block number:', error)
    return null
  }
}

/**
 * Get transaction receipt
 * @param txHash Transaction hash
 */
export async function getTransactionReceipt(txHash: string) {
  try {
    ensureInitialized()
    const receipt = await provider!.getTransactionReceipt(txHash)
    return receipt
  } catch (error) {
    console.error('❌ Failed to get transaction receipt:', error)
    return null
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  functionName: string,
  ...args: any[]
): Promise<bigint | null> {
  try {
    ensureInitialized()
    const gasEstimate = await contract![functionName].estimateGas(...args)
    return gasEstimate
  } catch (error) {
    console.error('❌ Failed to estimate gas:', error)
    return null
  }
}
