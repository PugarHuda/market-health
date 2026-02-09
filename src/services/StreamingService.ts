import { IndexerGrpcSpotStream } from '@injectivelabs/sdk-ts';
import { getNetworkEndpoints, Network } from '@injectivelabs/networks';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { OrderbookData, Trade, StreamUpdate } from '../types';

/**
 * In-memory store for streaming data
 */
class StreamStore {
  private orderbooks: Map<string, OrderbookData> = new Map();
  private trades: Map<string, Trade[]> = new Map();
  private readonly MAX_TRADES_PER_MARKET = 100;

  setOrderbook(marketId: string, orderbook: OrderbookData): void {
    this.orderbooks.set(marketId, orderbook);
  }

  getOrderbook(marketId: string): OrderbookData | undefined {
    return this.orderbooks.get(marketId);
  }

  addTrade(marketId: string, trade: Trade): void {
    const existing = this.trades.get(marketId) || [];
    existing.unshift(trade); // Add to beginning
    
    // Keep only last MAX_TRADES_PER_MARKET trades
    if (existing.length > this.MAX_TRADES_PER_MARKET) {
      existing.pop();
    }
    
    this.trades.set(marketId, existing);
  }

  getTrades(marketId: string): Trade[] {
    return this.trades.get(marketId) || [];
  }

  clear(marketId?: string): void {
    if (marketId) {
      this.orderbooks.delete(marketId);
      this.trades.delete(marketId);
    } else {
      this.orderbooks.clear();
      this.trades.clear();
    }
  }

  getActiveMarkets(): string[] {
    return Array.from(new Set([
      ...this.orderbooks.keys(),
      ...this.trades.keys(),
    ]));
  }
}

/**
 * Service for streaming real-time data from Injective Protocol
 */
export class StreamingService {
  private streamClient: IndexerGrpcSpotStream;
  private network: Network;
  private store: StreamStore;
  private activeStreams: Map<string, () => void> = new Map();
  private callbacks: Map<string, ((update: StreamUpdate) => void)[]> = new Map();

  constructor() {
    this.network = config.injectiveNetwork === 'mainnet' ? Network.Mainnet : Network.Testnet;
    const endpoints = getNetworkEndpoints(this.network);
    this.streamClient = new IndexerGrpcSpotStream(endpoints.indexer);
    this.store = new StreamStore();
    
    logger.info(`StreamingService initialized for ${config.injectiveNetwork}`, {
      network: this.network,
      endpoint: endpoints.indexer,
    });
  }

  /**
   * Start streaming orderbook updates for a market
   */
  streamOrderbook(marketId: string): void {
    const streamKey = `orderbook:${marketId}`;
    
    if (this.activeStreams.has(streamKey)) {
      logger.debug(`Orderbook stream already active for ${marketId}`);
      return;
    }

    logger.info(`Starting orderbook stream for ${marketId}`);

    this.streamClient.streamOrderbooksV2({
      marketIds: [marketId],
      callback: (response: any) => {
        try {
          const orderbook: OrderbookData = {
            buys: response.orderbook?.buys.map((level: any) => ({
              price: level.price,
              quantity: level.quantity,
              timestamp: level.timestamp,
            })) || [],
            sells: response.orderbook?.sells.map((level: any) => ({
              price: level.price,
              quantity: level.quantity,
              timestamp: level.timestamp,
            })) || [],
            sequence: response.orderbook?.sequence || 0,
          };

          this.store.setOrderbook(marketId, orderbook);

          const update: StreamUpdate = {
            type: 'orderbook',
            marketId,
            data: orderbook,
            timestamp: Date.now(),
          };

          this.notifyCallbacks(streamKey, update);

          logger.debug(`Orderbook update for ${marketId}`, {
            buyLevels: orderbook.buys.length,
            sellLevels: orderbook.sells.length,
          });
        } catch (error) {
          logger.error(`Error processing orderbook update for ${marketId}`, { error });
        }
      },
      onEndCallback: () => {
        logger.info(`Orderbook stream completed for ${marketId}`);
        this.activeStreams.delete(streamKey);
      },
      onStatusCallback: (error: any) => {
        if (error) {
          logger.error(`Orderbook stream error for ${marketId}`, { error });
          this.activeStreams.delete(streamKey);
        }
      },
    });

    this.activeStreams.set(streamKey, () => {
      logger.info(`Unsubscribing from orderbook stream for ${marketId}`);
    });
  }

  /**
   * Start streaming trades for a market
   */
  streamTrades(marketId: string): void {
    const streamKey = `trades:${marketId}`;
    
    if (this.activeStreams.has(streamKey)) {
      logger.debug(`Trades stream already active for ${marketId}`);
      return;
    }

    logger.info(`Starting trades stream for ${marketId}`);

    this.streamClient.streamTrades({
      marketIds: [marketId],
      callback: (response: any) => {
        try {
          if (response.trade) {
            const trade: Trade = {
              orderHash: response.trade.orderHash,
              subaccountId: response.trade.subaccountId,
              marketId: response.trade.marketId,
              tradeExecutionType: response.trade.tradeExecutionType,
              positionDelta: {
                tradeDirection: response.trade.tradeDirection || '',
                executionPrice: response.trade.executionPrice,
                executionQuantity: response.trade.executionQuantity,
                executionMargin: response.trade.executionMargin || '0',
              },
              payout: response.trade.payout,
              fee: response.trade.fee,
              executedAt: response.trade.executedAt,
              feeRecipient: response.trade.feeRecipient,
              tradeId: response.trade.tradeId,
              executionSide: response.trade.executionSide,
            };

            this.store.addTrade(marketId, trade);

            const update: StreamUpdate = {
              type: 'trades',
              marketId,
              data: [trade],
              timestamp: Date.now(),
            };

            this.notifyCallbacks(streamKey, update);

            logger.debug(`Trade update for ${marketId}`, {
              price: trade.positionDelta.executionPrice,
              quantity: trade.positionDelta.executionQuantity,
            });
          }
        } catch (error) {
          logger.error(`Error processing trade update for ${marketId}`, { error });
        }
      },
      onEndCallback: () => {
        logger.info(`Trades stream completed for ${marketId}`);
        this.activeStreams.delete(streamKey);
      },
      onStatusCallback: (error: any) => {
        if (error) {
          logger.error(`Trades stream error for ${marketId}`, { error });
          this.activeStreams.delete(streamKey);
        }
      },
    });

    this.activeStreams.set(streamKey, () => {
      logger.info(`Unsubscribing from trades stream for ${marketId}`);
    });
  }

  /**
   * Stop streaming for a specific market
   */
  stopStream(marketId: string, type: 'orderbook' | 'trades'): void {
    const streamKey = `${type}:${marketId}`;
    const unsubscribe = this.activeStreams.get(streamKey);
    
    if (unsubscribe) {
      logger.info(`Stopping ${type} stream for ${marketId}`);
      unsubscribe();
      this.activeStreams.delete(streamKey);
      this.callbacks.delete(streamKey);
    }
  }

  /**
   * Stop all streams for a market
   */
  stopAllStreams(marketId?: string): void {
    if (marketId) {
      this.stopStream(marketId, 'orderbook');
      this.stopStream(marketId, 'trades');
      this.store.clear(marketId);
    } else {
      logger.info('Stopping all streams');
      this.activeStreams.forEach((unsubscribe) => unsubscribe());
      this.activeStreams.clear();
      this.callbacks.clear();
      this.store.clear();
    }
  }

  /**
   * Get cached orderbook from store
   */
  getCachedOrderbook(marketId: string): OrderbookData | undefined {
    return this.store.getOrderbook(marketId);
  }

  /**
   * Get cached trades from store
   */
  getCachedTrades(marketId: string): Trade[] {
    return this.store.getTrades(marketId);
  }

  /**
   * Register callback for stream updates
   */
  onUpdate(marketId: string, type: 'orderbook' | 'trades', callback: (update: StreamUpdate) => void): void {
    const streamKey = `${type}:${marketId}`;
    const existing = this.callbacks.get(streamKey) || [];
    existing.push(callback);
    this.callbacks.set(streamKey, existing);
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(streamKey: string, update: StreamUpdate): void {
    const callbacks = this.callbacks.get(streamKey) || [];
    callbacks.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        logger.error('Error in stream callback', { error, streamKey });
      }
    });
  }

  /**
   * Get active markets being streamed
   */
  getActiveMarkets(): string[] {
    return this.store.getActiveMarkets();
  }

  /**
   * Get stream statistics
   */
  getStats() {
    return {
      activeStreams: this.activeStreams.size,
      activeMarkets: this.store.getActiveMarkets().length,
      callbacks: this.callbacks.size,
    };
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
