/**
 * Mock Credit Score Service
 * Returns random credit scores for demo purposes
 */

interface CreditScoreResult {
  score: number
  rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
}

export class CreditScoreService {
  /**
   * Generate a random credit score (300-850 range)
   */
  static async generateCreditScore(userId: string): Promise<CreditScoreResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Generate random score (300-850)
    const score = Math.floor(Math.random() * 551) + 300

    return {
      score,
      rating: this.getRating(score),
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
}
