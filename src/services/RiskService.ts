import type { LiquidityMetrics, VolatilityMetrics, VolumeMetrics, RiskMetrics } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for calculating comprehensive risk metrics
 */
export class RiskService {
  
  /**
   * Calculate comprehensive risk assessment
   */
  calculateRisk(
    liquidity: LiquidityMetrics,
    volatility: VolatilityMetrics,
    volume: VolumeMetrics
  ): RiskMetrics {
    try {
      // Calculate individual risk factors
      const liquidityRisk = this.calculateLiquidityRisk(liquidity);
      const volatilityRisk = this.calculateVolatilityRisk(volatility);
      const spreadRisk = this.calculateSpreadRisk(liquidity);
      const volumeRisk = this.calculateVolumeRisk(volume);

      // Aggregate risk factors
      const factors = {
        liquidityRisk,
        volatilityRisk,
        spreadRisk,
        volumeRisk,
      };

      // Calculate overall risk score (0-100, higher = more risky)
      const riskScore = this.calculateOverallRiskScore(factors);

      // Classify risk level
      const level = this.classifyRiskLevel(riskScore);

      // Generate warnings
      const warnings = this.generateWarnings(factors, liquidity, volatility, volume);

      const metrics: RiskMetrics = {
        score: riskScore,
        level,
        factors,
        warnings,
        timestamp: Date.now(),
      };

      logger.debug('Calculated risk metrics', { score: riskScore, level, warningCount: warnings.length });
      return metrics;
    } catch (error) {
      logger.error('Error calculating risk metrics', { error });
      throw error;
    }
  }

  /**
   * Calculate liquidity risk (0-100, higher = more risky)
   */
  private calculateLiquidityRisk(liquidity: LiquidityMetrics): number {
    // Invert liquidity score (high liquidity = low risk)
    return 100 - liquidity.score;
  }

  /**
   * Calculate volatility risk (0-100, higher = more risky)
   */
  private calculateVolatilityRisk(volatility: VolatilityMetrics): number {
    // Invert volatility score (low volatility = low risk)
    return 100 - volatility.score;
  }

  /**
   * Calculate spread risk (0-100, higher = more risky)
   */
  private calculateSpreadRisk(liquidity: LiquidityMetrics): number {
    const { spreadPercent } = liquidity;
    
    // Spread risk increases exponentially
    if (spreadPercent < 0.1) return 10;
    if (spreadPercent < 0.5) return 30;
    if (spreadPercent < 1.0) return 50;
    if (spreadPercent < 2.0) return 70;
    return 90;
  }

  /**
   * Calculate volume risk (0-100, higher = more risky)
   */
  private calculateVolumeRisk(volume: VolumeMetrics): number {
    // Invert volume score (high volume = low risk)
    return 100 - volume.score;
  }

  /**
   * Calculate overall risk score from individual factors
   */
  private calculateOverallRiskScore(factors: {
    liquidityRisk: number;
    volatilityRisk: number;
    spreadRisk: number;
    volumeRisk: number;
  }): number {
    const weights = {
      liquidity: 0.35,
      volatility: 0.30,
      spread: 0.20,
      volume: 0.15,
    };

    const weightedScore = 
      factors.liquidityRisk * weights.liquidity +
      factors.volatilityRisk * weights.volatility +
      factors.spreadRisk * weights.spread +
      factors.volumeRisk * weights.volume;

    return Math.round(Math.max(0, Math.min(100, weightedScore)));
  }

  /**
   * Classify risk level based on score
   */
  private classifyRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'EXTREME';
  }

  /**
   * Generate risk warnings
   */
  private generateWarnings(
    factors: {
      liquidityRisk: number;
      volatilityRisk: number;
      spreadRisk: number;
      volumeRisk: number;
    },
    liquidity: LiquidityMetrics,
    volatility: VolatilityMetrics,
    volume: VolumeMetrics
  ): string[] {
    const warnings: string[] = [];

    // Liquidity warnings
    if (factors.liquidityRisk > 70) {
      warnings.push('⚠️ Very low liquidity - high slippage risk');
    } else if (factors.liquidityRisk > 50) {
      warnings.push('⚠️ Low liquidity - moderate slippage risk');
    }

    // Spread warnings
    if (liquidity.spreadPercent > 2.0) {
      warnings.push('⚠️ Extremely wide spread - poor pricing');
    } else if (liquidity.spreadPercent > 1.0) {
      warnings.push('⚠️ Wide spread - high transaction costs');
    }

    // Volatility warnings
    if (volatility.level === 'EXTREME') {
      warnings.push('🔴 Extreme price volatility detected');
    } else if (volatility.level === 'HIGH') {
      warnings.push('⚠️ High price volatility');
    }

    // Volume warnings
    if (volume.tradeCount < 10) {
      warnings.push('⚠️ Very low trading activity');
    }

    if (volume.volumeChange < -50) {
      warnings.push('📉 Significant volume decrease');
    }

    // Depth warnings
    if (liquidity.depth1Percent < 1000) {
      warnings.push('⚠️ Shallow orderbook depth');
    }

    return warnings;
  }
}

export const riskService = new RiskService();
