import { Router, Request, Response, NextFunction } from 'express';
import { injectiveService } from '../services';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /markets
 * Get all available spot markets
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check cache
    const cacheKey = 'markets:all';
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for ${cacheKey}`);
      res.json(cached);
      return;
    }

    // Fetch all markets
    const markets = await injectiveService.getMarkets();

    const response = {
      count: markets.length,
      markets: markets.map(m => ({
        marketId: m.marketId,
        ticker: m.ticker,
        baseDenom: m.baseDenom,
        quoteDenom: m.quoteDenom,
        baseSymbol: m.baseTokenMeta.symbol,
        quoteSymbol: m.quoteTokenMeta.symbol,
      })),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, response, 60); // Cache for 1 minute
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /markets/:marketId
 * Get specific market details
 */
router.get('/:marketId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { marketId } = req.params;

    // Check cache
    const cacheKey = `market:${marketId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for ${cacheKey}`);
      res.json(cached);
      return;
    }

    // Fetch market
    const market = await injectiveService.getMarket(marketId);
    if (!market) {
      res.status(404).json({
        error: 'Not Found',
        message: `Market ${marketId} not found`,
        timestamp: Date.now(),
      });
      return;
    }

    const response = {
      market,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, response, 60);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
