/**
 * Mock KYC Verification Service
 * Simulates document verification with smart random outcomes
 */

import type { KYCDocumentType, DocumentStatus } from '../types/database.types'

interface VerificationResult {
  status: DocumentStatus
  confidence: number // 0-100
  issues: string[]
  verifiedFields: string[]
  recommendations: string[]
  processingTime: number // milliseconds
}

interface DocumentData {
  documentType: KYCDocumentType
  documentNumber?: string
  imageUrl: string
  userId: string
}

export class KYCVerificationService {
  /**
   * Verify a KYC document
   * Simulates AI-powered document verification
   */
  static async verifyDocument(data: DocumentData): Promise<VerificationResult> {
    // Simulate processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Generate verification outcome based on document type
    const result = this.generateVerificationResult(data)

    return {
      ...result,
      processingTime: Math.round(processingTime),
    }
  }

  /**
   * Generate smart verification result
   */
  private static generateVerificationResult(data: DocumentData): Omit<VerificationResult, 'processingTime'> {
    // Use document URL hash for deterministic results
    const hash = this.hashString(data.imageUrl + data.userId)
    const randomValue = (hash % 100) / 100 // 0-1

    // Base confidence (higher for ID documents)
    let baseConfidence = 85
    if (data.documentType === 'id') baseConfidence = 90
    if (data.documentType === 'selfie') baseConfidence = 95
    if (data.documentType === 'proof_of_address') baseConfidence = 80
    if (data.documentType === 'income_proof') baseConfidence = 75

    // Add some variance
    const confidence = Math.min(100, baseConfidence + (randomValue * 10) - 5)

    // Determine status based on confidence
    let status: DocumentStatus = 'verified'
    if (confidence < 60) status = 'rejected'
    else if (confidence < 75) status = 'pending'

    // Generate issues based on confidence
    const issues = this.generateIssues(data.documentType, confidence)

    // Generate verified fields
    const verifiedFields = this.getVerifiedFields(data.documentType, confidence)

    // Generate recommendations
    const recommendations = this.getRecommendations(data.documentType, status, confidence)

    return {
      status,
      confidence: Math.round(confidence),
      issues,
      verifiedFields,
      recommendations,
    }
  }

  /**
   * Generate issues found during verification
   */
  private static generateIssues(documentType: KYCDocumentType, confidence: number): string[] {
    const issues: string[] = []

    if (confidence < 95) {
      const possibleIssues = this.getPossibleIssues(documentType)
      const issueCount = Math.floor((100 - confidence) / 20)

      for (let i = 0; i < Math.min(issueCount, possibleIssues.length); i++) {
        issues.push(possibleIssues[i])
      }
    }

    return issues
  }

  /**
   * Get possible issues by document type
   */
  private static getPossibleIssues(documentType: KYCDocumentType): string[] {
    const issueMap: Record<KYCDocumentType, string[]> = {
      id: [
        'Document appears slightly blurry',
        'Some text is difficult to read',
        'Photo quality could be improved',
        'Edge of document is cut off',
      ],
      proof_of_address: [
        'Date is older than 3 months',
        'Address text is partially obscured',
        'Document quality is low',
        'Name on document needs verification',
      ],
      income_proof: [
        'Some figures are unclear',
        'Document date needs verification',
        'Employer details are faint',
        'Format is non-standard',
      ],
      selfie: [
        'Lighting could be improved',
        'Face is partially obscured',
        'Background is cluttered',
        'Image resolution is low',
      ],
    }

    return issueMap[documentType] || []
  }

  /**
   * Get verified fields from document
   */
  private static getVerifiedFields(documentType: KYCDocumentType, confidence: number): string[] {
    const fieldMap: Record<KYCDocumentType, string[]> = {
      id: [
        'Full Name',
        'Date of Birth',
        'ID Number',
        'Issue Date',
        'Expiry Date',
        'Photo Match',
      ],
      proof_of_address: [
        'Full Address',
        'Name Match',
        'Document Date',
        'Issuer Verification',
      ],
      income_proof: [
        'Employer Name',
        'Income Amount',
        'Employment Period',
        'Document Authenticity',
      ],
      selfie: [
        'Face Detection',
        'Liveness Check',
        'ID Photo Match',
      ],
    }

    const allFields = fieldMap[documentType] || []

    // Return fewer fields if confidence is low
    if (confidence < 70) {
      return allFields.slice(0, Math.floor(allFields.length / 2))
    }
    if (confidence < 85) {
      return allFields.slice(0, Math.floor(allFields.length * 0.75))
    }

    return allFields
  }

  /**
   * Generate recommendations for improving verification
   */
  private static getRecommendations(
    documentType: KYCDocumentType,
    status: DocumentStatus,
    confidence: number
  ): string[] {
    const recommendations: string[] = []

    if (status === 'rejected') {
      recommendations.push('Please upload a clearer image of your document')
      recommendations.push('Ensure all text is readable and the document is complete')
      recommendations.push('Use good lighting and avoid shadows or glare')
    } else if (status === 'pending') {
      recommendations.push('Document is under manual review')
      recommendations.push('You will be notified within 24-48 hours')
    } else if (confidence < 95) {
      recommendations.push('Document verified successfully')
      if (confidence < 90) {
        recommendations.push('Consider uploading a higher quality image for future documents')
      }
    } else {
      recommendations.push('Perfect! Document verified with high confidence')
    }

    // Type-specific recommendations
    if (documentType === 'id') {
      if (status !== 'verified') {
        recommendations.push('Ensure your ID is valid and not expired')
        recommendations.push('All four corners of the ID should be visible')
      }
    } else if (documentType === 'proof_of_address') {
      if (status !== 'verified') {
        recommendations.push('Use a recent utility bill, bank statement, or official document')
        recommendations.push('Document should not be older than 3 months')
      }
    } else if (documentType === 'income_proof') {
      if (status !== 'verified') {
        recommendations.push('Upload recent pay slips or employment letter')
        recommendations.push('Ensure all financial details are clearly visible')
      }
    }

    return recommendations
  }

  /**
   * Perform liveness check for selfie verification
   */
  static async performLivenessCheck(selfieUrl: string, idPhotoUrl: string): Promise<{
    isLive: boolean
    faceMatch: number // 0-100
    confidence: number // 0-100
  }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const hash = this.hashString(selfieUrl + idPhotoUrl)
    const randomValue = (hash % 100) / 100

    const faceMatch = 75 + (randomValue * 20) // 75-95
    const confidence = 80 + (randomValue * 15) // 80-95
    const isLive = confidence > 70

    return {
      isLive,
      faceMatch: Math.round(faceMatch),
      confidence: Math.round(confidence),
    }
  }

  /**
   * Batch verify multiple documents
   */
  static async batchVerify(documents: DocumentData[]): Promise<Map<string, VerificationResult>> {
    const results = new Map<string, VerificationResult>()

    // Process all documents in parallel
    const promises = documents.map(async (doc) => {
      const result = await this.verifyDocument(doc)
      return { id: doc.imageUrl, result }
    })

    const completed = await Promise.all(promises)

    completed.forEach(({ id, result }) => {
      results.set(id, result)
    })

    return results
  }

  /**
   * Get verification status for a user
   */
  static getUserKYCStatus(verifiedDocs: KYCDocumentType[]): {
    status: 'pending' | 'verified' | 'rejected'
    completionPercentage: number
    missingDocuments: KYCDocumentType[]
  } {
    const requiredDocs: KYCDocumentType[] = ['id', 'proof_of_address', 'selfie']
    const missingDocuments = requiredDocs.filter(doc => !verifiedDocs.includes(doc))

    const completionPercentage = (verifiedDocs.length / requiredDocs.length) * 100

    let status: 'pending' | 'verified' | 'rejected' = 'pending'
    if (completionPercentage === 100) {
      status = 'verified'
    }

    return {
      status,
      completionPercentage: Math.round(completionPercentage),
      missingDocuments,
    }
  }

  /**
   * Simple hash function for deterministic results
   */
  private static hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
}
