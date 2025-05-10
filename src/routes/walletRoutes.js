const express = require('express');
const { Wallet } = require('../models/wallet');
const { Transaction } = require('../models/transaction');
const { getCryptoPrice } = require('../services/cryptoService');
const router = express.Router();

// Get wallet balance
router.get('/balance/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        let wallet = await Wallet.findOne({ playerId });

        if (!wallet) {
            wallet = await Wallet.create({ playerId });
        }

        // Get current USD values for all crypto balances
        const balanceWithUsd = {};
        for (const [currency, amount] of wallet.balances) {
            const price = await getCryptoPrice(currency);
            balanceWithUsd[currency] = {
                crypto: amount,
                usd: amount * price
            };
        }

        res.json(balanceWithUsd);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction history
router.get('/transactions/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const transactions = await Transaction.find({ playerId })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
