# Market Health API

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/PugarHuda/market-health)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

Real-time market health scoring and risk assessment API for Injective blockchain. Built with TypeScript, Express.js, and the official Injective SDK.

## 🚀 Features

- ✅ **9 REST API Endpoints** - Comprehensive market analysis
- ✅ **Real-time Data** - gRPC streaming from Injective network
- ✅ **Health Scoring** - Multi-factor analysis (liquidity, volatility, volume, spread)
- ✅ **Risk Assessment** - Intelligent risk evaluation with warnings
- ✅ **Market Comparison** - Side-by-side analysis of multiple markets
- ✅ **Interactive Docs** - Swagger UI for easy testing
- ✅ **Production Ready** - Caching, logging, error handling

## 📦 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Blockchain**: Injective Protocol  
- **SDK**: @injectivelabs/sdk-ts v1.14.13
- **Validation**: Zod
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI 3.0

## 🛠️ Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/PugarHuda/market-health.git
cd market-health

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Build TypeScript
npm run build
```

### Configuration

Edit `.env` file:

```env
PORT=8000
INJECTIVE_NETWORK=testnet  # or mainnet
NODE_ENV=development
API_VERSION=v1
LOG_LEVEL=info
CACHE_TTL_SECONDS=30
```

### Running

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:8000`

## 📡 API Endpoints

### Market Information
- `GET /api/v1/markets` - List all spot markets
- `GET /api/v1/markets/:marketId` - Get market details

### Market Analysis
- `GET /api/v1/health/:marketId` - Overall health score
- `GET /api/v1/liquidity/:marketId` - Liquidity metrics
- `GET /api/v1/volatility/:marketId` - Volatility analysis
- `GET /api/v1/volume/:marketId` - Trading volume
- `GET /api/v1/risk/:marketId` - Risk assessment

### Tools
- `GET /api/v1/compare?markets=id1,id2` - Compare markets
- `GET /api/v1/status` - API health check

## 📖 Documentation

- **Interactive API Docs**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
- **API Reference**: [docs/API.md](docs/API.md)
- **Usage Examples**: [docs/EXAMPLES.md](docs/EXAMPLES.md)
- **Postman Collection**: [postman_collection.json](postman_collection.json)

## 💡 Usage Examples

### Get Market Health

```bash
curl http://localhost:8000/api/v1/health/0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe
```

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
    "recommendation": "Good market conditions for trading"
  },
  "timestamp": 1707500000000
}
```

### Compare Markets

```bash
curl "http://localhost:8000/api/v1/compare?markets=0x0611780...,0x17ef480..."
```

### JavaScript Example

```javascript
const axios = require('axios');

async function getMarketHealth(marketId) {
  const response = await axios.get(
    `http://localhost:8000/api/v1/health/${marketId}`
  );
  
  console.log(`Market: ${response.data.ticker}`);
  console.log(`Health Score: ${response.data.health.score}`);
  console.log(`Status: ${response.data.health.status}`);
  
  return response.data;
}

// Example usage
const INJ_USDT = '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe';
getMarketHealth(INJ_USDT);
```

**More examples**: See [docs/EXAMPLES.md](docs/EXAMPLES.md)

## 🏗️ Project Structure

```
src/
├── config/          # Configuration
│   └── swagger.config.ts
├── middleware/      # Error handling
├── routes/          # API endpoints
├── services/        # Core business logic
│   ├── InjectiveService.ts
│   ├── StreamingService.ts
│   ├── HealthService.ts
│   ├── LiquidityService.ts
│   ├── VolatilityService.ts
│   ├── VolumeService.ts
│   └── RiskService.ts
├── types/           # TypeScript definitions
├── utils/           # Cache, logger, validators
├── app.ts           # Express setup
└── index.ts         # Entry point
```

## 🔧 Development

```bash
# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Run tests (coming soon)
npm test

# Lint code
npm run lint
```

## 📊 Health Scoring

The health score (0-100) combines multiple factors:

- **Liquidity** (35%): Orderbook depth and spread
- **Volatility** (25%): Price stability  
- **Volume** (25%): Trading activity
- **Spread** (15%): Bid-ask tightness

**Status Levels:**
- 80-100: **HEALTHY** ✅ (green)
- 50-79: **WARNING** ⚠️ (yellow)
- 0-49: **CRITICAL** 🚨 (red)

## 🎯 Use Cases

1. **Trading Bots** - Make data-driven trading decisions
2. **Portfolio Management** - Monitor market conditions
3. **Risk Management** - Assess trading risks
4. **Market Research** - Analyze market dynamics
5. **DeFi Applications** - Integrate health scoring

## 🔐 API Authentication

Currently open API. For production deployment, we recommend:
- API key authentication
- Rate limiting (100 req/min recommended)
- CORS configuration
- HTTPS/TLS encryption

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Use different port
PORT=3000 npm run dev
```

### Connection errors to Injective
```bash
# Verify network setting in .env
INJECTIVE_NETWORK=testnet  # or mainnet

# Check logs
tail -f logs/app.log
```

### TypeScript build errors
```bash
# Clean build
rm -rf dist/
npm run build
```

## 📞 Support

- **Documentation**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
- **GitHub**: [https://github.com/PugarHuda/market-health](https://github.com/PugarHuda/market-health)
- **Issues**: [GitHub Issues](https://github.com/PugarHuda/market-health/issues)

---

Built with ❤️ for Injective Hackathon
