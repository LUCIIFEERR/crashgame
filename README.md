# Crypto Crash Game

A real-time multiplayer crypto crash game where players can bet using USD converted to cryptocurrency.

## Features

- Real-time crash game with WebSocket support
- USD to crypto conversion using CoinGecko API
- Provably fair crash algorithm
- Player wallet system
- Real-time multiplayer updates
- Transaction logging and game history

## Tech Stack

- Node.js with Express.js
- MongoDB for data storage
- WebSocket (ws) for real-time communication
- CoinGecko API for crypto prices

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   - PORT: Server port (default: 3000)
   - MONGODB_URI: MongoDB connection string
   - Other game configuration parameters

3. Start MongoDB locally

4. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Game
- POST /api/game/bet - Place a bet
- POST /api/game/cashout - Cash out during a round
- GET /api/game/history - Get game round history

### Wallet
- GET /api/wallet/balance - Get player wallet balance
- GET /api/wallet/transactions - Get transaction history

## WebSocket Events

### Server -> Client
- gameStart: New round starting
- multiplierUpdate: Current multiplier value
- playerCashout: Player cashed out
- gameCrash: Round ended with crash

### Client -> Server
- placeBet: Place a bet
- cashout: Request cashout

## Provably Fair Algorithm

The crash point for each round is generated using a cryptographically secure algorithm:
1. A server seed is generated for each round
2. The crash point is calculated using: hash(seed + round_number)
3. The result is verifiable by players

## Testing

1. Run API tests:
   ```bash
   npm test
   ```

2. Use the provided WebSocket test client at `/public/test-client.html`

## License

MIT
