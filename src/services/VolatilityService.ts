import type { Trade, VolatilityMetrics } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for calculating volatility metrics
 */
export class VolatilityService {
  
  /**
   * Calculate comprehensive volatility metrics from trades
   */
  calculateVolatility(trades: Trade[], windowMinutes: number = 60): VolatilityMetrics {
    try {
      const now = Date.now();
      const windowMs = windowMinutes * 60 * 1000;
      const cutoffTime = now - windowMs;

      // Filter trades within time window
      const recentTrades = trades.filter(trade => trade.executedAt >= cutoffTime);

      if (recentTrades.length === 0) {
        return this.getDefaultMetrics();
      }

      const prices = recentTrades.map(t => parseFloat(t.positionDelta.executionPrice));
      const priceChanges = this.calculatePriceChanges(prices);
      
      const meanPrice = this.calculateMean(prices);
      const standardDeviation = this.calculateStandardDeviation(prices, meanPrice);
      const volatility = standardDeviation;
      const volatilityPercent = meanPrice > 0 ? (volatility / meanPrice) * 100 : 0;

      const level = this.classifyVolatilityLevel(volatilityPercent);
      const score = this.calculateVolatilityScore(volatilityPercent, level);

      const metrics: VolatilityMetrics = {
        score,
        volatility,
        volatilityPercent,
        level,
        priceChanges,
        standardDeviation,
        meanPrice,
        timestamp: Date.now(),
      };

      logger.debug('Calculated volatility metrics', { 
        score, 
        volatilityPercent: volatilityPercent.toFixed(2), 
        level,
        tradesCount: recentTrades.length,
      });

      return metrics;
    } catch (error) {
      logger.error('Error calculating volatility metrics', { error });
      throw error;
    }
  }

  /**
   * Calculate price changes between consecutive trades
   */
  private calculatePriceChanges(prices: number[]): number[] {
    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const change = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
      changes.push(change);
    }
    return changes;
  }

  /**
   * Calculate mean (average) of values
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  /**
   * Classify volatility level based on percentage
   */
  private classifyVolatilityLevel(volatilityPercent: number): 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' {
    if (volatilityPercent < 1) return 'LOW';
    if (volatilityPercent < 3) return 'MODERATE';
    if (volatilityPercent < 7) return 'HIGH';
    return 'EXTREME';
  }

  /**
   * Calculate volatility score (0-100)
   * Lower volatility = higher score (more stable)
   */
  private calculateVolatilityScore(volatilityPercent: number, level: string): number {
    let score: number;

    switch (level) {
      case 'LOW':
        score = 100 - (volatilityPercent * 10); // 1% = 90 score
        break;
      case 'MODERATE':
        score = 80 - ((volatilityPercent - 1) * 15); // 2% = 65 score
        break;
      case 'HIGH':
        score = 50 - ((volatilityPercent - 3) * 8); // 5% = 34 score
        break;
      case 'EXTREME':
        score = Math.max(0, 30 - ((volatilityPercent - 7) * 3)); // 10% = 21 score
        break;
      default:
        score = 50;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Get default metrics when no data is available
   */
  private getDefaultMetrics(): VolatilityMetrics {
    return {
      score: 0,
      volatility: 0,
      volatilityPercent: 0,
      level: 'LOW',
      priceChanges: [],
      standardDeviation: 0,
      meanPrice: 0,
      timestamp: Date.now(),
    };
  }
}

export const volatilityService = new VolatilityService();
