# Usage Examples

Real-world examples of using the Injective Market Health API.

## Prerequisites

```bash
# Start the API server
npm run dev

# Base URL
http://localhost:8000/api/v1
```

---

## Example 1: Monitor Market Health

Monitor the health of INJ/USDT market in real-time.

### cURL
```bash
# Get health score
curl http://localhost:8000/api/v1/health/0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe

# Response
{
  "marketId": "0x0611780...",
  "ticker": "INJ/USDT",
  "health": {
    "score": 85,
    "status": "HEALTHY",
    "factors": {
      "liquidity": 90,
      "volatility": 75,
      "volume": 80,
      "spread": 95
    },
    "recommendation": "Good market conditions for trading"
  }
}
```

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function getMarketHealth(marketId) {
  const response = await axios.get(
    `http://localhost:8000/api/v1/health/${marketId}`
  );
  
  console.log(`Market: ${response.data.ticker}`);
  console.log(`Health Score: ${response.data.health.score}`);
  console.log(`Status: ${response.data.health.status}`);
  console.log(`Recommendation: ${response.data.health.recommendation}`);
  
  return response.data;
}

// Example usage
const INJ_USDT = '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe';
getMarketHealth(INJ_USDT);
```

### Python
```python
import requests

def get_market_health(market_id):
    url = f'http://localhost:8000/api/v1/health/{market_id}'
    response = requests.get(url)
    data = response.json()
    
    print(f"Market: {data['ticker']}")
    print(f"Health Score: {data['health']['score']}")
    print(f"Status: {data['health']['status']}")
    print(f"Recommendation: {data['health']['recommendation']}")
    
    return data

# Example usage
INJ_USDT = '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe'
get_market_health(INJ_USDT)
```

---

## Example 2: Compare Multiple Markets

Find the best market for trading among INJ/USDT, ATOM/USDT, and ETH/USDT.

### cURL
```bash
curl "http://localhost:8000/api/v1/compare?markets=0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe,0x17ef48032cb24375ba7c2e39f384e56433bcab20cbee9a7357e4cba2eb00abe6"
```

### JavaScript
```javascript
async function compareMark ets(marketIds) {
  const marketsParam = marketIds.join(',');
  const response = await axios.get(
    `http://localhost:8000/api/v1/compare?markets=${marketsParam}`
  );
  
  console.log('Market Comparison:');
  response.data.comparison.forEach(market => {
    console.log(`\n${market.ticker}:`);
    console.log(`  Health: ${market.healthScore}`);
    console.log(`  Liquidity: ${market.liquidityScore}`);
    console.log(`  Risk: ${market.riskLevel}`);
  });
  
  console.log(`\nBest Market: ${response.data.bestMarket.ticker}`);
  console.log(`Reason: ${response.data.bestMarket.reason}`);
  
  return response.data;
}

const markets = [
  '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe', // INJ/USDT
  '0x17ef48032cb24375ba7c2e39f384e56433bcab20cbee9a7357e4cba2eb00abe6'  // ATOM/USDT
];

compareMarkets(markets);
```

---

## Example 3: Risk Assessment Workflow

Perform comprehensive risk assessment before trading.

### JavaScript
```javascript
async function assessTradingRisk(marketId) {
  // Step 1: Get basic market info
  const market = await axios.get(`http://localhost:8000/api/v1/markets/${marketId}`);
  console.log(`Analyzing: ${market.data.market.ticker}`);
  
  // Step 2: Check liquidity
  const liquidity = await axios.get(`http://localhost:8000/api/v1/liquidity/${marketId}`);
  console.log(`Spread: ${liquidity.data.liquidity.spreadPercentage}`);
  console.log(`Liquidity Score: ${liquidity.data.liquidity.score}`);
  
  // Step 3: Check volatility
  const volatility = await axios.get(`http://localhost:8000/api/v1/volatility/${marketId}`);
  console.log(`Volatility Level: ${volatility.data.volatility.level}`);
  console.log(`Price Change 24h: ${volatility.data.volatility.priceChange24h}`);
  
  // Step 4: Get risk assessment
  const risk = await axios.get(`http://localhost:8000/api/v1/risk/${marketId}`);
  console.log(`Risk Level: ${risk.data.risk.riskLevel}`);
  console.log(`Risk Score: ${risk.data.risk.riskScore}`);
  
  if (risk.data.risk.warnings.length > 0) {
    console.log('\nWarnings:');
    risk.data.risk.warnings.forEach(warning => console.log(`- ${warning}`));
  }
  
  // Final decision
  const isLowRisk = risk.data.risk.riskLevel === 'LOW';
  const hasGoodLiquidity = liquidity.data.liquidity.score > 70;
  
  console.log(`\nRecommendation: ${isLowRisk && hasGoodLiquidity ? 'SAFE TO TRADE' : 'PROCEED WITH CAUTION'}`);
  
  return {
    market: market.data,
    liquidity: liquidity.data,
    volatility: volatility.data,
    risk: risk.data
  };
}

// Run assessment
assessTradingRisk('0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe');
```

---

## Example 4: Market Discovery

Find all available markets and filter by criteria.

### JavaScript
```javascript
async function findBestMarkets() {
  // Get all markets
  const response = await axios.get('http://localhost:8000/api/v1/markets');
  const markets = response.data.markets;
  
  console.log(`Total markets: ${markets.length}\n`);
  
  // Analyze each market
  const results = [];
  for (const market of markets.slice(0, 5)) { // Analyze first 5 markets
    try {
      const health = await axios.get(`http://localhost:8000/api/v1/health/${market.marketId}`);
      
      results.push({
        ticker: market.ticker,
        marketId: market.marketId,
        healthScore: health.data.health.score,
        status: health.data.health.status
      });
      
      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`Error analyzing ${market.ticker}: ${error.message}`);
    }
  }
  
  // Sort by health score
  results.sort((a, b) => b.healthScore - a.healthScore);
  
  console.log('Top Markets by Health:');
  results.forEach((market, i) => {
    console.log(`${i + 1}. ${market.ticker}: ${market.healthScore} (${market.status})`);
  });
  
  return results;
}

findBestMarkets();
```

---

## Example 5: TypeScript Client Class

Complete TypeScript client for the API.

```typescript
import axios, { AxiosInstance } from 'axios';

interface HealthResponse {
  marketId: string;
  ticker: string;
  health: {
    score: number;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    factors: {
      liquidity: number;
      volatility: number;
      volume: number;
      spread: number;
    };
    recommendation: string;
  };
  timestamp: number;
}

class MarketHealthClient {
  private client: AxiosInstance;
  
  constructor(baseUrl: string = 'http://localhost:8000/api/v1') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
    });
  }
  
  async getMarkets() {
    const response = await this.client.get('/markets');
    return response.data;
  }
  
  async getHealth(marketId: string): Promise<HealthResponse> {
    const response = await this.client.get(`/health/${marketId}`);
    return response.data;
  }
  
  async getLiquidity(marketId: string) {
    const response = await this.client.get(`/liquidity/${marketId}`);
    return response.data;
  }
  
  async getVolatility(marketId: string) {
    const response = await this.client.get(`/volatility/${marketId}`);
    return response.data;
  }
  
  async getVolume(marketId: string) {
    const response = await this.client.get(`/volume/${marketId}`);
    return response.data;
  }
  
  async getRisk(marketId: string) {
    const response = await this.client.get(`/risk/${marketId}`);
    return response.data;
  }
  
  async compareMarkets(marketIds: string[]) {
    const markets = marketIds.join(',');
    const response = await this.client.get(`/compare?markets=${markets}`);
    return response.data;
  }
  
  async getStatus() {
    const response = await this.client.get('/status');
    return response.data;
  }
}

// Usage
const client = new MarketHealthClient();

async function main() {
  const INJ_USDT = '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe';
  
  const health = await client.getHealth(INJ_USDT);
  console.log(`${health.ticker} Health: ${health.health.score}`);
  
  const markets = await client.getMarkets();
  console.log(`Total markets: ${markets.count}`);
}

main();
```

---

## More Examples

For more examples and interactive documentation, visit:
- **Swagger UI**: http://localhost:8000/api-docs
- **Postman Collection**: Import `postman_collection.json`
