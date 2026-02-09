import { Router, Request, Response, NextFunction } from 'express';
import { injectiveService, volatilityService } from '../services';
import { cache } from '../utils/cache';
import { marketIdParamSchema } from '../utils/validators';
import { NotFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /volatility/:marketId
 * Get volatility metrics for a market
 */
router.get('/:marketId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { marketId } = marketIdParamSchema.parse(req.params);

    // Check cache
    const cacheKey = `volatility:${marketId}`;
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

    // Fetch trades
    const trades = await injectiveService.getTrades(marketId, 100);

    // Calculate volatility metrics
    const metrics = volatilityService.calculateVolatility(trades);

    const response = {
      marketId,
      ticker: market.ticker,
      volatility: metrics,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
