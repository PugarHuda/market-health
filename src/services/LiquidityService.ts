import type { OrderbookData, LiquidityMetrics } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for calculating liquidity metrics
 */
export class LiquidityService {
  
  /**
   * Calculate comprehensive liquidity metrics for a market
   */
  calculateLiquidity(orderbook: OrderbookData): LiquidityMetrics {
    try {
      const midPrice = this.calculateMidPrice(orderbook);
      const spread = this.calculateSpread(orderbook);
      const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;
      
      const bidDepth = this.calculateDepth(orderbook.buys);
      const askDepth = this.calculateDepth(orderbook.sells);
      const totalDepth = bidDepth + askDepth;

      const depth1Percent = this.calculateDepthAtPercent(orderbook, midPrice, 0.01);
      const depth5Percent = this.calculateDepthAtPercent(orderbook, midPrice, 0.05);

      // Calculate liquidity score (0-100)
      const score = this.calculateLiquidityScore({
        totalDepth,
        spreadPercent,
        depth1Percent,
        depth5Percent,
      });

      const metrics: LiquidityMetrics = {
        score,
        bidDepth,
        askDepth,
        totalDepth,
        depth1Percent,
        depth5Percent,
        spread,
        spreadPercent,
        midPrice,
        timestamp: Date.now(),
      };

      logger.debug('Calculated liquidity metrics', { score, spreadPercent, totalDepth });
      return metrics;
    } catch (error) {
      logger.error('Error calculating liquidity metrics', { error });
      throw error;
    }
  }

  /**
   * Calculate mid price from orderbook
   */
  private calculateMidPrice(orderbook: OrderbookData): number {
    const bestBid = orderbook.buys[0] ? parseFloat(orderbook.buys[0].price) : 0;
    const bestAsk = orderbook.sells[0] ? parseFloat(orderbook.sells[0].price) : 0;
    
    if (bestBid === 0 || bestAsk === 0) return 0;
    return (bestBid + bestAsk) / 2;
  }

  /**
   * Calculate bid-ask spread
   */
  private calculateSpread(orderbook: OrderbookData): number {
    const bestBid = orderbook.buys[0] ? parseFloat(orderbook.buys[0].price) : 0;
    const bestAsk = orderbook.sells[0] ? parseFloat(orderbook.sells[0].price) : 0;
    
    return Math.abs(bestAsk - bestBid);
  }

  /**
   * Calculate total depth (sum of all quantities)
   */
  private calculateDepth(levels: Array<{ price: string; quantity: string }>): number {
    return levels.reduce((sum, level) => sum + parseFloat(level.quantity), 0);
  }

  /**
   * Calculate depth within a percentage range of mid price
   */
  private calculateDepthAtPercent(orderbook: OrderbookData, midPrice: number, percent: number): number {
    const upperBound = midPrice * (1 + percent);
    const lowerBound = midPrice * (1 - percent);

    const bidDepth = orderbook.buys
      .filter(level => parseFloat(level.price) >= lowerBound)
      .reduce((sum, level) => sum + parseFloat(level.quantity), 0);

    const askDepth = orderbook.sells
      .filter(level => parseFloat(level.price) <= upperBound)
      .reduce((sum, level) => sum + parseFloat(level.quantity), 0);

    return bidDepth + askDepth;
  }

  /**
   * Calculate liquidity score (0-100)
   */
  private calculateLiquidityScore(metrics: {
    totalDepth: number;
    spreadPercent: number;
    depth1Percent: number;
    depth5Percent: number;
  }): number {
    // Weights for different factors
    const weights = {
      spread: 0.4,
      depth: 0.3,
      depth1: 0.15,
      depth5: 0.15,
    };

    // Spread score (lower is better, inverted)
    const spreadScore = Math.max(0, 100 - metrics.spreadPercent * 20);

    // Depth scores (logarithmic scale)
    const depthScore = Math.min(100, Math.log10(metrics.totalDepth + 1) * 20);
    const depth1Score = Math.min(100, Math.log10(metrics.depth1Percent + 1) * 25);
    const depth5Score = Math.min(100, Math.log10(metrics.depth5Percent + 1) * 20);

    const totalScore = 
      spreadScore * weights.spread +
      depthScore * weights.depth +
      depth1Score * weights.depth1 +
      depth5Score * weights.depth5;

    return Math.round(Math.max(0, Math.min(100, totalScore)));
  }
}

export const liquidityService = new LiquidityService();
