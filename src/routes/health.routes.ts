import { Router, Request, Response, NextFunction } from 'express';
import { injectiveService, healthService, liquidityService, volatilityService, volumeService } from '../services';
import { cache } from '../utils/cache';
import { marketIdParamSchema } from '../utils/validators';
import { NotFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /health/:marketId
 * Get health score for a market
 */
router.get('/:marketId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { marketId } = marketIdParamSchema.parse(req.params);

    // Check cache first
    const cacheKey = `health:${marketId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for ${cacheKey}`);
      res.json(cached);
      return;
    }

    // Verify market exists
    const market = await injectiveService.getMarket(marketId);
    if (!market) {
      throw new NotFoundError(`Market ${marketId} not found`);
    }

    // Fetch data
    const [orderbook, trades] = await Promise.all([
      injectiveService.getOrderbook(marketId),
      injectiveService.getTrades(marketId, 100),
    ]);

    // Calculate metrics
    const liquidity = liquidityService.calculateLiquidity(orderbook);
    const volatility = volatilityService.calculateVolatility(trades);
    const volume = volumeService.calculateVolume(trades);
    const health = healthService.calculateHealth(liquidity, volatility, volume);

    const response = {
      marketId,
      ticker: market.ticker,
      health,
      components: {
        liquidity: {
          score: liquidity.score,
          spread: liquidity.spreadPercent,
          depth: liquidity.totalDepth,
        },
        volatility: {
          score: volatility.score,
          level: volatility.level,
          percent: volatility.volatilityPercent,
        },
        volume: {
          score: volume.score,
          volume24h: volume.volume24h,
          tradeCount: volume.tradeCount,
        },
      },
      timestamp: Date.now(),
    };

    // Cache the result
    cache.set(cacheKey, response);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
