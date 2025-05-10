const CrashPointGenerator = require('../utils/crashPointGenerator');
const crypto = require('crypto');
const { getCryptoPrice } = require('../services/cryptoService');
const { GameRound } = require('../models/gameRound');
const { Transaction } = require('../models/transaction');
const logger = require('../utils/logger');

class GameServer {
    constructor(wss) {
        this.wss = wss;
        this.currentRound = null;
        this.roundInterval = parseInt(process.env.GAME_ROUND_INTERVAL);
        this.multiplierUpdateInterval = parseInt(process.env.MULTIPLIER_UPDATE_INTERVAL);
        this.maxCrashMultiplier = parseInt(process.env.MAX_CRASH_MULTIPLIER);
        this.crashPointGenerator = new CrashPointGenerator(this.maxCrashMultiplier);
    }

    async startNewRound() {
        const roundId = crypto.randomBytes(16).toString('hex');
        const serverSeedHash = this.crashPointGenerator.generateServerSeed();
        const crashResult = this.crashPointGenerator.generateCrashPoint(roundId);

        this.currentRound = {
            id: roundId,
            serverSeedHash,
            crashPoint: crashResult.crashPoint,
            verificationData: {
                hash: crashResult.hash,
                seed: crashResult.seed,
                nonce: crashResult.nonce
            },
            startTime: Date.now(),
            bets: new Map(),
            cashedOut: new Map(),
            status: 'starting',
            currentMultiplier: 1.0
        };

        // Store round in database
        await GameRound.create({
            roundId,
            serverSeedHash,
            crashPoint: crashResult.crashPoint,
            verificationData: crashResult.seed,
            startTime: new Date(),
            status: 'starting'
        });

        // Notify clients of new round
        this.broadcast('gameStart', {
            roundId,
            startTime: this.currentRound.startTime
        });

        // Start game loop after 5 seconds countdown
        setTimeout(() => this.startGameLoop(), 5000);
    }

    getGameState() {
        if (!this.currentRound) return null;
        
        return {
            roundId: this.currentRound.id,
            status: this.currentRound.status,
            currentMultiplier: this.currentRound.currentMultiplier,
            verificationData: this.currentRound.status === 'ended' ? {
                serverSeedHash: this.currentRound.serverSeedHash,
                crashPoint: this.currentRound.crashPoint,
                verificationData: this.currentRound.verificationData
            } : null
        };
    }

    startGameLoop() {
        this.currentRound.status = 'running';
        this.currentRound.gameStart = Date.now();
        
        const updateMultiplier = () => {
            if (!this.currentRound || this.currentRound.status !== 'running') return;

            const elapsed = (Date.now() - this.currentRound.gameStart) / 1000;
            this.currentRound.currentMultiplier = Math.pow(Math.E, elapsed * 0.06);

            // Broadcast current multiplier
            this.broadcast('multiplierUpdate', {
                multiplier: this.currentRound.currentMultiplier.toFixed(2)
            });

            // Check if crashed
            if (this.currentRound.currentMultiplier >= this.currentRound.crashPoint) {
                this.endRound();
            } else {
                setTimeout(updateMultiplier, this.multiplierUpdateInterval);
            }
        };

        updateMultiplier();
    }

    async endRound() {
        if (!this.currentRound) return;

        this.currentRound.status = 'ended';
        this.broadcast('gameCrash', {
            crashPoint: this.currentRound.crashPoint
        });

        // Update round in database
        await GameRound.findOneAndUpdate(
            { roundId: this.currentRound.id },
            { 
                status: 'ended',
                crashPoint: this.currentRound.crashPoint,
                endTime: new Date()
            }
        );

        // Start new round after interval
        setTimeout(() => this.startNewRound(), this.roundInterval);
    }

    async placeBet(playerId, amount, cryptoCurrency) {
        if (!this.currentRound || this.currentRound.status !== 'starting') {
            throw new Error('Cannot place bet at this time');
        }

        const price = await getCryptoPrice(cryptoCurrency);
        const cryptoAmount = amount / price;

        this.currentRound.bets.set(playerId, {
            amount,
            cryptoAmount,
            cryptoCurrency,
            price
        });

        // Log transaction
        await Transaction.create({
            playerId,
            type: 'bet',
            usdAmount: amount,
            cryptoAmount,
            cryptoCurrency,
            priceAtTime: price,
            roundId: this.currentRound.id
        });

        return { cryptoAmount, price };
    }

    async cashout(playerId) {
        if (!this.currentRound || this.currentRound.status !== 'running') {
            throw new Error('Cannot cash out at this time');
        }

        const bet = this.currentRound.bets.get(playerId);
        if (!bet || this.currentRound.cashedOut.has(playerId)) {
            throw new Error('No active bet found');
        }

        const multiplier = this.currentRound.currentMultiplier;
        const winningsCrypto = bet.cryptoAmount * multiplier;
        const winningsUsd = winningsCrypto * bet.price;

        this.currentRound.cashedOut.set(playerId, {
            multiplier,
            winningsCrypto,
            winningsUsd
        });

        // Log transaction
        await Transaction.create({
            playerId,
            type: 'cashout',
            usdAmount: winningsUsd,
            cryptoAmount: winningsCrypto,
            cryptoCurrency: bet.cryptoCurrency,
            priceAtTime: bet.price,
            roundId: this.currentRound.id,
            multiplier
        });

        this.broadcast('playerCashout', {
            playerId,
            multiplier,
            winningsCrypto,
            winningsUsd
        });

        return { winningsCrypto, winningsUsd, multiplier };
    }

    broadcast(event, data) {
        const message = JSON.stringify({ event, data });
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

let gameServer = null;

function initializeGameServer(wss) {
    gameServer = new GameServer(wss);
    gameServer.startNewRound();
    return gameServer;
}

function getGameServer() {
    return gameServer;
}

module.exports = {
    initializeGameServer,
    getGameServer
};
