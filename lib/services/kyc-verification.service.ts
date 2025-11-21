/**
 * Mock KYC Verification Service
 * Returns random verification results for demo purposes
 */

import type { KYCDocumentType, DocumentStatus } from '../types/database.types'

interface VerificationResult {
  status: DocumentStatus
}

interface DocumentData {
  documentType: KYCDocumentType
  documentNumber?: string
  imageUrl: string
  userId: string
}

export class KYCVerificationService {
  /**
   * Verify a KYC document - returns random status
   */
  static async verifyDocument(data: DocumentData): Promise<VerificationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    // Random status (80% verified, 15% pending, 5% rejected)
    const random = Math.random()
    let status: DocumentStatus = 'verified'
    if (random < 0.05) status = 'rejected'
    else if (random < 0.20) status = 'pending'

    return { status }
  }
}
