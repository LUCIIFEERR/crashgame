const express = require('express');
const { GameRound } = require('../models/gameRound');
const CrashPointGenerator = require('../utils/crashPointGenerator');
const router = express.Router();

// Get verification data for a round
router.get('/round/:roundId', async (req, res) => {
    try {
        const { roundId } = req.params;
        const round = await GameRound.findOne({ roundId });

        if (!round || round.status !== 'ended') {
            return res.status(404).json({ error: 'Round not found or not ended' });
        }

        res.json({
            roundId: round.roundId,
            serverSeedHash: round.serverSeedHash,
            crashPoint: round.crashPoint,
            verificationData: round.verificationData,
            timestamp: round.startTime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify a crash point
router.post('/verify', async (req, res) => {
    try {
        const {
            serverSeed,
            clientSeed,
            roundId,
            nonce,
            expectedCrashPoint
        } = req.body;

        if (!serverSeed || !roundId || expectedCrashPoint === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const crashPointGenerator = new CrashPointGenerator();
        const isValid = crashPointGenerator.verifyCrashPoint(
            serverSeed,
            clientSeed,
            roundId,
            nonce || 0,
            expectedCrashPoint
        );

        res.json({
            isValid,
            roundId,
            expectedCrashPoint
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
