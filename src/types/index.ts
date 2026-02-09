/**
 * Core type definitions for the Injective Market Health API
 */

export interface Market {
  marketId: string;
  ticker: string;
  baseDenom: string;
  quoteDenom: string;
  quoteTokenMeta: {
    name: string;
    symbol: string;
    decimals: number;
  };
  baseTokenMeta: {
    name: string;
    symbol: string;
    decimals: number;
  };
  makerFeeRate: string;
  takerFeeRate: string;
  serviceProviderFee: string;
  minPriceTickSize: string;
  minQuantityTickSize: string;
}

export interface OrderbookData {
  buys: PriceLevel[];
  sells: PriceLevel[];
  sequence: number;
}

export interface PriceLevel {
  price: string;
  quantity: string;
  timestamp: number;
}

export interface Trade {
  orderHash: string;
  subaccountId: string;
  marketId: string;
  tradeExecutionType: string;
  positionDelta: {
    tradeDirection: string;
    executionPrice: string;
    executionQuantity: string;
    executionMargin: string;
  };
  payout: string;
  fee: string;
  executedAt: number;
  feeRecipient: string;
  tradeId: string;
  executionSide: string;
}

export interface HealthScore {
  score: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  components: {
    liquidity: number;
    volatility: number;
    volume: number;
    spread: number;
  };
  recommendation: string;
  timestamp: number;
}

export interface LiquidityMetrics {
  score: number;
  bidDepth: number;
  askDepth: number;
  totalDepth: number;
  depth1Percent: number;
  depth5Percent: number;
  spread: number;
  spreadPercent: number;
  midPrice: number;
  timestamp: number;
}

export interface VolatilityMetrics {
  score: number;
  volatility: number;
  volatilityPercent: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  priceChanges: number[];
  standardDeviation: number;
  meanPrice: number;
  timestamp: number;
}

export interface VolumeMetrics {
  score: number;
  volume24h: number;
  volumeChange: number;
  tradeCount: number;
  averageTradeSize: number;
  timestamp: number;
}

export interface RiskMetrics {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  factors: {
    liquidityRisk: number;
    volatilityRisk: number;
    spreadRisk: number;
    volumeRisk: number;
  };
  warnings: string[];
  timestamp: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface StreamUpdate {
  type: 'orderbook' | 'trades';
  marketId: string;
  data: OrderbookData | Trade[];
  timestamp: number;
}
