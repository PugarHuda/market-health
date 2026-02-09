import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import healthRoutes from './routes/health.routes';
import liquidityRoutes from './routes/liquidity.routes';
import volatilityRoutes from './routes/volatility.routes';
import volumeRoutes from './routes/volume.routes';
import riskRoutes from './routes/risk.routes';
import compareRoutes from './routes/compare.routes';
import marketsRoutes from './routes/markets.routes';
import statusRoutes from './routes/status.routes';

/**
 * Create and configure Express app
 */
export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      query: req.query,
      ip: req.ip,
    });
    next();
  });

  // API routes
  const apiPrefix = `/api/${config.apiVersion}`;
  app.use(`${apiPrefix}/health`, healthRoutes);
  app.use(`${apiPrefix}/liquidity`, liquidityRoutes);
  app.use(`${apiPrefix}/volatility`, volatilityRoutes);
  app.use(`${apiPrefix}/volume`, volumeRoutes);
  app.use(`${apiPrefix}/risk`, riskRoutes);
  app.use(`${apiPrefix}/compare`, compareRoutes);
  app.use(`${apiPrefix}/markets`, marketsRoutes);
  app.use(`${apiPrefix}/status`, statusRoutes);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Injective Market Health API',
      version: '2.0.0',
      description: 'Real-time market health scoring and risk assessment for Injective blockchain',
      endpoints: {
        health: `${apiPrefix}/health/:marketId`,
        liquidity: `${apiPrefix}/liquidity/:marketId`,
        volatility: `${apiPrefix}/volatility/:marketId`,
        volume: `${apiPrefix}/volume/:marketId`,
        risk: `${apiPrefix}/risk/:marketId`,
        compare: `${apiPrefix}/compare?markets=id1,id2`,
        markets: `${apiPrefix}/markets`,
        status: `${apiPrefix}/status`,
      },
      documentation: '/docs',
      timestamp: Date.now(),
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
