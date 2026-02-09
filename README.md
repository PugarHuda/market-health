# Market Health API

Real-time market health scoring and risk assessment API for Injective blockchain.

## 🚀 Features

- ✅ Real-time market data via Injective SDK
- ✅ gRPC streaming for live updates
- ✅ Comprehensive health scoring
- ✅ Liquidity analysis
- ✅ Volatility tracking
- ✅ Volume metrics
- ✅ Risk assessment
- ✅ Multi-market comparison

## 📦 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Blockchain**: Injective Protocol
- **SDK**: @injectivelabs/sdk-ts v1.14.13
- **Validation**: Zod
- **Logging**: Winston

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Build TypeScript
npm run build
```

## 🔧 Configuration

Edit `.env` file:

```env
PORT=8000
INJECTIVE_NETWORK=testnet  # or mainnet
NODE_ENV=development
API_VERSION=v1
LOG_LEVEL=info
CACHE_TTL_SECONDS=30
```

## 🚀 Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

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

## 📊 Example Response

```json
{
  "marketId": "0x...",
  "ticker": "INJ/USDT",
  "health": {
    "score": 85,
    "status": "HEALTHY",
    "recommendation": "Good market conditions for trading"
  },
  "timestamp": 1234567890
}
```

## 🏗️ Project Structure

```
src/
├── services/        # Core business logic
├── routes/          # API endpoints
├── middleware/      # Error handling
├── utils/           # Cache, logger, validators
├── types/           # TypeScript definitions
├── config/          # Configuration
├── app.ts           # Express setup
└── index.ts         # Entry point
```

## 📝 License

MIT

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

---

Built with ❤️ for Injective Hackathon
