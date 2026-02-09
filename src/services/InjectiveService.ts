import { IndexerGrpcSpotApi } from '@injectivelabs/sdk-ts';
import { getNetworkEndpoints, Network } from '@injectivelabs/networks';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { Market, OrderbookData, Trade } from '../types';

/**
 * Service for interacting with Injective Protocol via gRPC
 */
export class InjectiveService {
  private spotApi: IndexerGrpcSpotApi;
  private network: Network;

  constructor() {
    this.network = config.injectiveNetwork === 'mainnet' ? Network.Mainnet : Network.Testnet;
    const endpoints = getNetworkEndpoints(this.network);
    this.spotApi = new IndexerGrpcSpotApi(endpoints.indexer);
    
    logger.info(`InjectiveService initialized for ${config.injectiveNetwork}`, {
      network: this.network,
      endpoint: endpoints.indexer,
    });
  }

  /**
   * Get all available spot markets
   */
  async getMarkets(): Promise<Market[]> {
    try {
      logger.debug('Fetching all spot markets');
      const response = await this.spotApi.fetchMarkets();
      
      const markets: Market[] = response.map((market: any) => ({
        marketId: market.marketId,
        ticker: market.ticker,
        baseDenom: market.baseDenom,
        quoteDenom: market.quoteDenom,
        quoteTokenMeta: {
          name: market.quoteToken?.name || '',
          symbol: market.quoteToken?.symbol || '',
          decimals: market.quoteToken?.decimals || 18,
        },
        baseTokenMeta: {
          name: market.baseToken?.name || '',
          symbol: market.baseToken?.symbol || '',
          decimals: market.baseToken?.decimals || 18,
        },
        makerFeeRate: market.makerFeeRate,
        takerFeeRate: market.takerFeeRate,
        serviceProviderFee: market.serviceProviderFee,
        minPriceTickSize: market.minPriceTickSize,
        minQuantityTickSize: market.minQuantityTickSize,
      }));

      logger.info(`Fetched ${markets.length} spot markets`);
      return markets;
    } catch (error) {
      logger.error('Failed to fetch markets', { error });
      throw new Error(`Failed to fetch markets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get orderbook for a specific market
   */
  async getOrderbook(marketId: string): Promise<OrderbookData> {
    try {
      logger.debug(`Fetching orderbook for market ${marketId}`);
      const response = await this.spotApi.fetchOrderbookV2(marketId);

      const orderbook: OrderbookData = {
        buys: response.buys.map((level) => ({
          price: level.price,
          quantity: level.quantity,
          timestamp: level.timestamp,
        })),
        sells: response.sells.map((level) => ({
          price: level.price,
          quantity: level.quantity,
          timestamp: level.timestamp,
        })),
        sequence: response.sequence,
      };

      logger.debug(`Fetched orderbook for ${marketId}`, {
        buyLevels: orderbook.buys.length,
        sellLevels: orderbook.sells.length,
      });

      return orderbook;
    } catch (error) {
      logger.error(`Failed to fetch orderbook for ${marketId}`, { error });
      throw new Error(`Failed to fetch orderbook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent trades for a specific market
   */
  async getTrades(marketId: string, limit: number = 100): Promise<Trade[]> {
    try {
      logger.debug(`Fetching trades for market ${marketId}`, { limit });
      const response = await this.spotApi.fetchTrades({
        marketId,
        executionSide: 'maker',
        pagination: {
          limit,
        },
      });

      const trades: Trade[] = response.trades.map((trade: any) => ({
        orderHash: trade.orderHash || '',
        subaccountId: trade.subaccountId || '',
        marketId: trade.marketId || marketId,
        tradeExecutionType: trade.tradeExecutionType || '',
        positionDelta: {
          tradeDirection: trade.tradeDirection || trade.executionSide || '',
          executionPrice: trade.executionPrice || trade.price || '0',
          executionQuantity: trade.executionQuantity || trade.quantity || '0',
          executionMargin: trade.executionMargin || '0',
        },
        payout: trade.payout || '0',
        fee: trade.fee || '0',
        executedAt: trade.executedAt || trade.timestamp || Date.now(),
        feeRecipient: trade.feeRecipient || '',
        tradeId: trade.tradeId || '',
        executionSide: trade.executionSide || '',
      }));

      logger.debug(`Fetched ${trades.length} trades for ${marketId}`);
      return trades;
    } catch (error) {
      logger.error(`Failed to fetch trades for ${marketId}`, { error });
      throw new Error(`Failed to fetch trades: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get market by ID
   */
  async getMarket(marketId: string): Promise<Market | null> {
    try {
      const markets = await this.getMarkets();
      return markets.find((m) => m.marketId === marketId) || null;
    } catch (error) {
      logger.error(`Failed to fetch market ${marketId}`, { error });
      throw error;
    }
  }

  /**
   * Check if market exists
   */
  async marketExists(marketId: string): Promise<boolean> {
    const market = await this.getMarket(marketId);
    return market !== null;
  }
}

// Export singleton instance
export const injectiveService = new InjectiveService();
