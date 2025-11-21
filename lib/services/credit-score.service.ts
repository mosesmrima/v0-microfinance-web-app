/**
 * Mock Credit Score Service
 * Generates smart random credit scores based on user loan history
 */

interface CreditScoreFactors {
  paymentHistory: number // 35% weight
  creditUtilization: number // 30% weight
  creditAge: number // 15% weight
  creditMix: number // 10% weight
  newCredit: number // 10% weight
}

interface CreditScoreResult {
  score: number
  factors: CreditScoreFactors
  rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
  recommendations: string[]
}

interface UserCreditData {
  totalLoans: number
  activeLoans: number
  completedLoans: number
  defaultedLoans: number
  onTimePayments: number
  latePayments: number
  totalBorrowed: number
  totalRepaid: number
  accountAge: number // months
}

export class CreditScoreService {
  /**
   * Generate a credit score based on user's loan history
   */
  static async generateCreditScore(userId: string, userData?: UserCreditData): Promise<CreditScoreResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Default data for new users
    const data: UserCreditData = userData || {
      totalLoans: 0,
      activeLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      onTimePayments: 0,
      latePayments: 0,
      totalBorrowed: 0,
      totalRepaid: 0,
      accountAge: 0,
    }

    // Calculate individual factors
    const factors = this.calculateFactors(data)

    // Calculate weighted score
    const rawScore =
      (factors.paymentHistory * 0.35) +
      (factors.creditUtilization * 0.30) +
      (factors.creditAge * 0.15) +
      (factors.creditMix * 0.10) +
      (factors.newCredit * 0.10)

    // Convert to 300-850 range
    const score = Math.round(300 + (rawScore / 100) * 550)

    // Determine rating
    const rating = this.getRating(score)

    // Generate recommendations
    const recommendations = this.getRecommendations(score, factors, data)

    return {
      score,
      factors,
      rating,
      recommendations,
    }
  }

  /**
   * Calculate individual credit factors
   */
  private static calculateFactors(data: UserCreditData): CreditScoreFactors {
    // Payment History (35% weight)
    let paymentHistory = 100
    if (data.onTimePayments + data.latePayments > 0) {
      const onTimeRate = data.onTimePayments / (data.onTimePayments + data.latePayments)
      paymentHistory = onTimeRate * 100
    }
    if (data.defaultedLoans > 0) {
      paymentHistory -= data.defaultedLoans * 20 // Heavy penalty for defaults
    }

    // Credit Utilization (30% weight)
    let creditUtilization = 100
    if (data.activeLoans > 0) {
      // Lower score if too many active loans
      const utilizationPenalty = Math.min(data.activeLoans * 10, 40)
      creditUtilization = 100 - utilizationPenalty
    }

    // Credit Age (15% weight)
    let creditAge = 50 // Base score for new users
    if (data.accountAge > 0) {
      // Increase score with account age (max at 24 months)
      creditAge = Math.min(50 + (data.accountAge / 24) * 50, 100)
    }

    // Credit Mix (10% weight)
    let creditMix = 50 // Base score
    if (data.completedLoans > 0) {
      // Reward for successfully completed loans
      creditMix = Math.min(50 + (data.completedLoans * 10), 100)
    }

    // New Credit (10% weight)
    let newCredit = 100
    if (data.activeLoans > 3) {
      // Penalty for too many new loans
      newCredit = Math.max(100 - ((data.activeLoans - 3) * 15), 30)
    }

    return {
      paymentHistory: Math.max(0, Math.min(100, paymentHistory)),
      creditUtilization: Math.max(0, Math.min(100, creditUtilization)),
      creditAge: Math.max(0, Math.min(100, creditAge)),
      creditMix: Math.max(0, Math.min(100, creditMix)),
      newCredit: Math.max(0, Math.min(100, newCredit)),
    }
  }

  /**
   * Get credit score rating
   */
  private static getRating(score: number): 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' {
    if (score >= 800) return 'Excellent'
    if (score >= 740) return 'Very Good'
    if (score >= 670) return 'Good'
    if (score >= 580) return 'Fair'
    return 'Poor'
  }

  /**
   * Generate personalized recommendations
   */
  private static getRecommendations(
    score: number,
    factors: CreditScoreFactors,
    data: UserCreditData
  ): string[] {
    const recommendations: string[] = []

    if (factors.paymentHistory < 80) {
      recommendations.push('Focus on making all payments on time to improve your payment history.')
    }

    if (data.activeLoans > 2) {
      recommendations.push('Consider reducing the number of active loans to improve your credit utilization.')
    }

    if (data.accountAge < 12) {
      recommendations.push('Continue building your credit history over time.')
    }

    if (data.completedLoans === 0 && data.totalLoans === 0) {
      recommendations.push('Start building credit by taking and successfully repaying a small loan.')
    }

    if (data.defaultedLoans > 0) {
      recommendations.push('Address any defaulted loans to rebuild your credit score.')
    }

    if (score < 670) {
      recommendations.push('Review your credit report regularly and dispute any errors.')
      recommendations.push('Keep your credit utilization low by borrowing responsibly.')
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep maintaining your good credit habits.')
    }

    return recommendations
  }

  /**
   * Get a quick credit score estimate without full calculation
   * Useful for initial displays
   */
  static getQuickEstimate(userId: string): number {
    // Generate a deterministic but seemingly random score based on userId
    const hash = this.hashString(userId)
    const baseScore = 550 // Starting point
    const variation = hash % 250 // 0-250 variation
    return baseScore + variation
  }

  /**
   * Simple hash function for generating deterministic values
   */
  private static hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}
