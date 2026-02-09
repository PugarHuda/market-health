import type { Trade, VolumeMetrics } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for calculating volume metrics
 */
export class VolumeService {
  
  /**
   * Calculate 24-hour volume metrics from trades
   */
  calculateVolume(trades: Trade[], period24hTrades?: Trade[]): VolumeMetrics {
    try {
      const now = Date.now();
      const last24h = now - (24 * 60 * 60 * 1000);

      // Filter trades from last 24 hours
      const recentTrades = trades.filter(trade => trade.executedAt >= last24h);

      if (recentTrades.length === 0) {
        return this.getDefaultMetrics();
      }

      // Calculate total volume (in quote currency)
      const volume24h = recentTrades.reduce((sum, trade) => {
        const price = parseFloat(trade.positionDelta.executionPrice);
        const quantity = parseFloat(trade.positionDelta.executionQuantity);
        return sum + (price * quantity);
      }, 0);

      // Calculate volume change if we have previous period data
      let volumeChange = 0;
      if (period24hTrades && period24hTrades.length > 0) {
        const prevVolume = period24hTrades.reduce((sum, trade) => {
          const price = parseFloat(trade.positionDelta.executionPrice);
          const quantity = parseFloat(trade.positionDelta.executionQuantity);
          return sum + (price * quantity);
        }, 0);
        
        if (prevVolume > 0) {
          volumeChange = ((volume24h - prevVolume) / prevVolume) * 100;
        }
      }

      const tradeCount = recentTrades.length;
      const averageTradeSize = tradeCount > 0 ? volume24h / tradeCount : 0;

      // Calculate volume score
      const score = this.calculateVolumeScore(volume24h, tradeCount, volumeChange);

      const metrics: VolumeMetrics = {
        score,
        volume24h,
        volumeChange,
        tradeCount,
        averageTradeSize,
        timestamp: Date.now(),
      };

      logger.debug('Calculated volume metrics', { 
        score, 
        volume24h: volume24h.toFixed(2),
        tradeCount,
      });

      return metrics;
    } catch (error) {
      logger.error('Error calculating volume metrics', { error });
      throw error;
    }
  }

  /**
   * Calculate volume score (0-100)
   */
  private calculateVolumeScore(volume24h: number, tradeCount: number, volumeChange: number): number {
    // Weights for different factors
    const weights = {
      volume: 0.5,
      tradeCount: 0.3,
      growth: 0.2,
    };

    // Volume score (logarithmic scale)
    const volumeScore = Math.min(100, Math.log10(volume24h + 1) * 15);

    // Trade count score (logarithmic scale)
    const tradeCountScore = Math.min(100, Math.log10(tradeCount + 1) * 30);

    // Growth score (positive change is good, but extreme changes can be risky)
    let growthScore: number;
    if (volumeChange > 0) {
      growthScore = Math.min(100, 50 + volumeChange * 2); // Up to 100 for 25% increase
    } else {
      growthScore = Math.max(0, 50 + volumeChange * 2); // Down to 0 for -25% decrease
    }

    const totalScore = 
      volumeScore * weights.volume +
      tradeCountScore * weights.tradeCount +
      growthScore * weights.growth;

    return Math.round(Math.max(0, Math.min(100, totalScore)));
  }

  /**
   * Get default metrics when no data is available
   */
  private getDefaultMetrics(): VolumeMetrics {
    return {
      score: 0,
      volume24h: 0,
      volumeChange: 0,
      tradeCount: 0,
      averageTradeSize: 0,
      timestamp: Date.now(),
    };
  }
}

export const volumeService = new VolumeService();
