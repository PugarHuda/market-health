import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Injective
  injectiveNetwork: (process.env.INJECTIVE_NETWORK || 'mainnet') as 'mainnet' | 'testnet',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Cache
  cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS || '30', 10),
} as const;

export type Config = typeof config;
