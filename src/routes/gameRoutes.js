const express = require('express');
const { getGameServer } = require('../game/gameServer');
const { GameRound } = require('../models/gameRound');
const router = express.Router();

// Place a bet
router.post('/bet', async (req, res) => {
    try {
        const { playerId, amount, cryptoCurrency } = req.body;

        if (!playerId || !amount || !cryptoCurrency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount < process.env.MIN_BET_AMOUNT || amount > process.env.MAX_BET_AMOUNT) {
            return res.status(400).json({ error: 'Invalid bet amount' });
        }

        const gameServer = getGameServer();
        const result = await gameServer.placeBet(playerId, amount, cryptoCurrency);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Cash out
router.post('/cashout', async (req, res) => {
    try {
        const { playerId } = req.body;

        if (!playerId) {
            return res.status(400).json({ error: 'Missing playerId' });
        }

        const gameServer = getGameServer();
        const result = await gameServer.cashout(playerId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get game history
router.get('/history', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const rounds = await GameRound.find({ status: 'ended' })
            .sort({ startTime: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        res.json(rounds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current game state
router.get('/current', async (req, res) => {
    try {
        const gameServer = getGameServer();
        const currentRound = gameServer.currentRound;

        if (!currentRound) {
            return res.status(404).json({ error: 'No active round' });
        }

        res.json({
            roundId: currentRound.id,
            status: currentRound.status,
            startTime: currentRound.startTime,
            currentMultiplier: currentRound.currentMultiplier
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
