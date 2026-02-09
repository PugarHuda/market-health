# API Documentation

Complete API reference for the Injective Market Health API.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Currently, the API does not require authentication. For production use, we recommend implementing API keys or OAuth 2.0.

## Rate Limiting

**Recommended limits for production:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

Currently not enforced in development mode.

---

## Endpoints

### 1. Markets

#### GET /markets

List all available spot markets on Injective.

**Response:**
```json
{
  "count": 25,
  "markets": [
    {
      "marketId": "0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe",
      "ticker": "INJ/USDT",
      "baseDenom": "inj",
      "quoteDenom": "peggy0x...",
      "baseSymbol": "INJ",
      "quoteSymbol": "USDT"
    }
  ],
  "timestamp": 1707500000000
}
```

#### GET /markets/:marketId

Get detailed information about a specific market.

**Parameters:**
- `marketId` (path) - Market ID (hex format or ticker)

**Response:**
```json
{
  "market": {
    "marketId": "0x0611780...",
    "ticker": "INJ/USDT",
    "baseDenom": "inj",
    "quoteDenom": "peggy0x...",
    "quoteTokenMeta": {
      "name": "Tether USD",
      "symbol": "USDT",
      "decimals": 6
    },
    "baseTokenMeta": {
      "name": "Injective",
      "symbol": "INJ",
      "decimals": 18
    },
    "makerFeeRate": "0.001",
    "takerFeeRate": "0.002",
    "minPriceTickSize": "0.01",
    "minQuantityTickSize": "0.01"
  }
}
```

---

### 2. Health Score

#### GET /health/:marketId

Get comprehensive market health analysis.

**Parameters:**
- `marketId` (path) - Market ID

**Response:**
```json
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
    "recommendation": "Good market conditions for trading. High liquidity and manageable volatility."
  },
  "timestamp": 1707500000000
}
```

**Health Scores:**
- 80-100: HEALTHY (green)
- 50-79: WARNING (yellow)
- 0-49: CRITICAL (red)

---

### 3. Liquidity Metrics

#### GET /liquidity/:marketId

Get orderbook liquidity analysis.

**Response:**
```json
{
  "marketId": "0x0611780...",
  "ticker": "INJ/USDT",
  "liquidity": {
    "spread": "0.05",
    "spreadPercentage": "0.25%",
    "midPrice": "20.00",
    "totalDepth": "1000000.50",
    "depthAt1Percent": "50000.00",
    "depthAt5Percent": "200000.00",
    "score": 88
  },
  "timestamp": 1707500000000
}
```

---

### 4. Volatility Analysis

#### GET /volatility/:marketId

Get price volatility metrics.

**Response:**
```json
{
  "marketId": "0x0611780...",
  "ticker": "INJ/USDT",
  "volatility": {
    "standardDeviation": "0.45",
    "priceChange24h": "5.2%",
    "level": "MODERATE",
    "score": 75
  },
  "timestamp": 1707500000000
}
```

**Volatility Levels:**
- LOW: < 2% daily change
- MODERATE: 2-5% daily change
- HIGH: 5-10% daily change
- EXTREME: > 10% daily change

---

### 5. Volume Metrics

#### GET /volume/:marketId

Get 24-hour trading volume statistics.

**Response:**
```json
{
  "marketId": "0x0611780...",
  "ticker": "INJ/USDT",
  "volume": {
    "volume24h": "2500000.00",
    "tradeCount": 1523,
    "volumeChange": "12.5%",
    "averageTradeSize": "1641.23"
  },
  "timestamp": 1707500000000
}
```

---

### 6. Risk Assessment

#### GET /risk/:marketId

Get comprehensive risk analysis.

**Response:**
```json
{
  "marketId": "0x0611780...",
  "ticker": "INJ/USDT",
  "risk": {
    "riskScore": 35,
    "riskLevel": "MEDIUM",
    "factors": {
      "liquidityRisk": 10,
      "volatilityRisk": 25,
      "spreadRisk": 5,
      "volumeRisk": 20
    },
    "warnings": [
      "Moderate volatility detected",
      "Volume below average"
    ]
  },
  "timestamp": 1707500000000
}
```

**Risk Levels:**
- LOW: < 25 risk score
- MEDIUM: 25-50
- HIGH: 50-75
- EXTREME: > 75

---

### 7. Compare Markets

#### GET /compare

Compare multiple markets side-by-side.

**Query Parameters:**
- `markets` (required) - Comma-separated market IDs (2-5 markets)

**Example:**
```
GET /compare?markets=0x0611780...,0x17ef480...
```

**Response:**
```json
{
  "comparison": [
    {
      "marketId": "0x0611780...",
      "ticker": "INJ/USDT",
      "healthScore": 85,
      "liquidityScore": 90,
      "riskLevel": "LOW"
    },
    {
      "marketId": "0x17ef480...",
      "ticker": "ATOM/USDT",
      "healthScore": 78,
      "liquidityScore": 82,
      "riskLevel": "MEDIUM"
    }
  ],
  "bestMarket": {
    "marketId": "0x0611780...",
    "ticker": "INJ/USDT",
    "reason": "Highest health score and liquidity"
  },
  "timestamp": 1707500000000
}
```

---

### 8. API Status

#### GET /status

Get API health and statistics.

**Response:**
```json
{
  "status": "operational",
  "version": "2.0.0",
  "uptime": {
    "seconds": 3456,
    "formatted": "57m 36s"
  },
  "cache": {
    "entries": 45,
    "hits": 234,
    "misses": 67,
    "hitRate": "77.74%"
  },
  "streaming": {
    "activeStreams": 3,
    "activeMarkets": 2,
    "callbacks": 5
  },
  "memory": {
    "used": "145 MB",
    "total": "512 MB"
  },
  "timestamp": 1707500000000
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Bad Request",
  "message": "Invalid market ID format. Expected 66-character hex address starting with '0x' or ticker format 'BASE-QUOTE'",
  "timestamp": 1707500000000
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (market doesn't exist)
- `500` - Internal Server Error

---

## Common Workflows

### 1. Market Discovery

```bash
# 1. Get all markets
curl http://localhost:8000/api/v1/markets

# 2. Get specific market details
curl http://localhost:8000/api/v1/markets/0x0611780...
```

### 2. Health Analysis

```bash
# Get comprehensive health
curl http://localhost:8000/api/v1/health/0x0611780...

# Get individual metrics
curl http://localhost:8000/api/v1/liquidity/0x0611780...
curl http://localhost:8000/api/v1/volatility/0x0611780...
curl http://localhost:8000/api/v1/volume/0x0611780...
curl http://localhost:8000/api/v1/risk/0x0611780...
```

### 3. Multi-Market Comparison

```bash
curl "http://localhost:8000/api/v1/compare?markets=0x0611780...,0x17ef480..."
```

---

## Caching

All analysis endpoints cache results for 30 seconds to improve performance. Cache statistics available at `/status` endpoint.

---

## Support

- GitHub: https://github.com/PugarHuda/market-health
- Documentation: http://localhost:8000/api-docs
