import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Injective Market Health API',
      version: '2.0.0',
      description: 'Real-time market health scoring and risk assessment API for Injective blockchain. Provides comprehensive analytics including liquidity, volatility, volume, and risk metrics.',
      contact: {
        name: 'API Support',
        url: 'https://github.com/PugarHuda/market-health',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server (example)',
      },
    ],
    tags: [
      {
        name: 'Markets',
        description: 'Market information and discovery',
      },
      {
        name: 'Analysis',
        description: 'Market analysis endpoints (health, liquidity, volatility, volume, risk)',
      },
      {
        name: 'Tools',
        description: 'Utility endpoints for comparison and monitoring',
      },
    ],
    components: {
      schemas: {
        HealthScore: {
          type: 'object',
          properties: {
            marketId: { type: 'string', example: '0x0611780...' },
            ticker: { type: 'string', example: 'INJ/USDT' },
            health: {
              type: 'object',
              properties: {
                score: { type: 'number', example: 85 },
                status: { type: 'string', enum: ['HEALTHY', 'WARNING', 'CRITICAL'], example: 'HEALTHY' },
                factors: {
                  type: 'object',
                  properties: {
                    liquidity: { type: 'number', example: 90 },
                    volatility: { type: 'number', example: 75 },
                    volume: { type: 'number', example: 80 },
                    spread: { type: 'number', example: 95 },
                  },
                },
                recommendation: { type: 'string', example: 'Good market conditions for trading' },
              },
            },
            timestamp: { type: 'number', example: 1707500000000 },
          },
        },
        LiquidityMetrics: {
          type: 'object',
          properties: {
            marketId: { type: 'string' },
            ticker: { type: 'string' },
            liquidity: {
              type: 'object',
              properties: {
                spread: { type: 'string', example: '0.05' },
                spreadPercentage: { type: 'string', example: '0.25%' },
                midPrice: { type: 'string', example: '20.00' },
                totalDepth: { type: 'string', example: '1000000' },
                depthAt1Percent: { type: 'string', example: '50000' },
                depthAt5Percent: { type: 'string', example: '200000' },
                score: { type: 'number', example: 88 },
              },
            },
            timestamp: { type: 'number' },
          },
        },
        MarketList: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 25 },
            markets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  marketId: { type: 'string' },
                  ticker: { type: 'string', example: 'INJ/USDT' },
                  baseDenom: { type: 'string' },
                  quoteDenom: { type: 'string' },
                  baseSymbol: { type: 'string', example: 'INJ' },
                  quoteSymbol: { type: 'string', example: 'USDT' },
                },
              },
            },
            timestamp: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Bad Request' },
            message: { type: 'string', example: 'Invalid market ID format' },
            timestamp: { type: 'number' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
