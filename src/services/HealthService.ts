import type { HealthScore, LiquidityMetrics, VolatilityMetrics, VolumeMetrics } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for calculating overall market health scores
 */
export class HealthService {
  
  /**
   * Calculate comprehensive health score for a market
   */
  calculateHealth(
    liquidity: LiquidityMetrics,
    volatility: VolatilityMetrics,
    volume: VolumeMetrics
  ): HealthScore {
    try {
      // Component scores
      const components = {
        liquidity: liquidity.score,
        volatility: volatility.score,
        volume: volume.score,
        spread: this.calculateSpreadScore(liquidity.spreadPercent),
      };

      // Calculate overall health score (weighted average)
      const score = this.calculateOverallScore(components);

      // Determine health status
      const status = this.determineStatus(score);

      // Generate recommendation
      const recommendation = this.generateRecommendation(status, components, volatility.level);

      const healthScore: HealthScore = {
        score,
        status,
        components,
        recommendation,
        timestamp: Date.now(),
      };

      logger.debug('Calculated health score', { score, status });
      return healthScore;
    } catch (error) {
      logger.error('Error calculating health score', { error });
      throw error;
    }
  }

  /**
   * Calculate spread score (0-100)
   */
  private calculateSpreadScore(spreadPercent: number): number {
    // Lower spread = higher score
    if (spreadPercent < 0.1) return 100;
    if (spreadPercent < 0.5) return 80;
    if (spreadPercent < 1.0) return 60;
    if (spreadPercent < 2.0) return 40;
    if (spreadPercent < 5.0) return 20;
    return 10;
  }

  /**
   * Calculate overall health score from components
   */
  private calculateOverallScore(components: {
    liquidity: number;
    volatility: number;
    volume: number;
    spread: number;
  }): number {
    const weights = {
      liquidity: 0.35,
      volatility: 0.25,
      volume: 0.25,
      spread: 0.15,
    };

    const weightedScore = 
      components.liquidity * weights.liquidity +
      components.volatility * weights.volatility +
      components.volume * weights.volume +
      components.spread * weights.spread;

    return Math.round(Math.max(0, Math.min(100, weightedScore)));
  }

  /**
   * Determine health status based on score
   */
  private determineStatus(score: number): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    if (score >= 70) return 'HEALTHY';
    if (score >= 40) return 'WARNING';
    return 'CRITICAL';
  }

  /**
   * Generate actionable recommendation
   */
  private generateRecommendation(
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL',
    components: { liquidity: number; volatility: number; volume: number; spread: number },
    volatilityLevel: string
  ): string {
    const issues: string[] = [];

    // Identify weak components
    if (components.liquidity < 50) issues.push('low liquidity');
    if (components.volatility < 50) issues.push('high volatility');
    if (components.volume < 50) issues.push('low volume');
    if (components.spread < 50) issues.push('wide spread');

    // Generate recommendation based on status
    if (status === 'HEALTHY') {
      if (volatilityLevel === 'EXTREME') {
        return '✅ Market is healthy but volatility is extreme. Use limit orders and monitor closely.';
      }
      return '✅ Market is healthy and suitable for trading. Normal trading conditions apply.';
    }

    if (status === 'WARNING') {
      const issueList = issues.length > 0 ? ` (${issues.join(', ')})` : '';
      return `⚠️ Exercise caution${issueList}. Consider using limit orders and smaller position sizes.`;
    }

    // CRITICAL
    const issueList = issues.length > 0 ? ` Issues: ${issues.join(', ')}.` : '';
    return `🔴 High risk market conditions.${issueList} Avoid trading or use extreme caution with small positions and tight stop losses.`;
  }
}

export const healthService = new HealthService();
