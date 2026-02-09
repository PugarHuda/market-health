import { Router, Request, Response, NextFunction } from 'express';
import { injectiveService, volumeService } from '../services';
import { cache } from '../utils/cache';
import { marketIdParamSchema } from '../utils/validators';
import { NotFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /volume/:marketId
 * Get volume metrics for a market
 */
router.get('/:marketId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { marketId } = marketIdParamSchema.parse(req.params);

    // Check cache
    const cacheKey = `volume:${marketId}`;
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
    const trades = await injectiveService.getTrades(marketId, 500);

    // Calculate volume metrics
    const metrics = volumeService.calculateVolume(trades);

    const response = {
      marketId,
      ticker: market.ticker,
      volume: metrics,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
