import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  injectiveService, 
  healthService, 
  liquidityService, 
  volatilityService, 
  volumeService 
} from '../services';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Query schema for compare endpoint
 */
const compareSchema = z.object({
  markets: z.string().min(1).refine((val) => {
    const ids = val.split(',');
    return ids.length >= 2 && ids.length <= 5;
  }, 'Must provide 2-5 market IDs'),
});

/**
 * GET /compare?markets=id1,id2,id3
 * Compare multiple markets
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { markets: marketsParam } = compareSchema.parse({ markets: req.query.markets });
    const marketIds = marketsParam.split(',').map(id => id.trim());

    // Check cache
    const cacheKey = `compare:${marketIds.sort().join(',')}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for ${cacheKey}`);
      res.json(cached);
      return;
    }

    // Fetch all markets in parallel
    const comparisons = await Promise.all(
      marketIds.map(async (marketId) => {
        try {
          // Verify market exists
          const market = await injectiveService.getMarket(marketId);
          if (!market) {
            return {
              marketId,
              error: 'Market not found',
            };
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

          return {
            marketId,
            ticker: market.ticker,
            health: {
              score: health.score,
              status: health.status,
              components: health.components,
            },
            liquidity: {
              score: liquidity.score,
              spread: liquidity.spreadPercent,
              depth: liquidity.totalDepth,
            },
            volatility: {
              score: volatility.score,
              level: volatility.level,
            },
            volume: {
              score: volume.score,
              volume24h: volume.volume24h,
            },
          };
        } catch (error) {
          logger.error(`Error comparing market ${marketId}`, { error });
          return {
            marketId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // Find best market
    const validComparisons = comparisons.filter(c => !c.error);
    const bestMarket = validComparisons.length > 0
      ? validComparisons.reduce((best, current) => 
          (current.health?.score || 0) > (best.health?.score || 0) ? current : best
        )
      : null;

    const response = {
      count: marketIds.length,
      comparisons,
      bestMarket: bestMarket?.marketId || null,
      recommendation: bestMarket 
        ? `${bestMarket.ticker} has the best overall health score (${bestMarket.health?.score})`
        : 'No valid markets to compare',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
