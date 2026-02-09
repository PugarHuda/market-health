import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

/**
 * Start the server
 */
async function main() {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Injective Market Health API started`, {
        port: config.port,
        env: config.nodeEnv,
        network: config.injectiveNetwork,
        version: '2.0.0',
      });
      logger.info(`📊 API available at: http://localhost:${config.port}/api/${config.apiVersion}`);
      logger.info(`📈 Status endpoint: http://localhost:${config.port}/api/${config.apiVersion}/status`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();
