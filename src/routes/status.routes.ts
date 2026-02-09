import { Router, Request, Response } from 'express';
import { streamingService } from '../services';
import { cache } from '../utils/cache';

const router = Router();

/**
 * GET /status
 * Get API status and health information
 */
router.get('/', (_req: Request, res: Response) => {
  const uptime = process.uptime();
  const cacheStats = cache.getStats();
  const streamStats = streamingService.getStats();

  const response = {
    status: 'operational',
    version: '2.0.0',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime),
    },
    cache: {
      entries: cacheStats.size,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hits > 0 
        ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%'
        : '0%',
    },
    streaming: {
      activeStreams: streamStats.activeStreams,
      activeMarkets: streamStats.activeMarkets,
      callbacks: streamStats.callbacks,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
    timestamp: Date.now(),
  };

  res.json(response);
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export default router;
