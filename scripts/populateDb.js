require('dotenv').config();
const mongoose = require('mongoose');
const { Wallet } = require('../src/models/wallet');
const logger = require('../src/utils/logger');

async function populateDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Create sample wallets
        const samplePlayers = [
            { playerId: 'player1', balances: { bitcoin: 0.1, ethereum: 2.0 } },
            { playerId: 'player2', balances: { bitcoin: 0.05, ethereum: 1.5 } },
            { playerId: 'player3', balances: { bitcoin: 0.15, ethereum: 3.0 } }
        ];

        for (const player of samplePlayers) {
            await Wallet.findOneAndUpdate(
                { playerId: player.playerId },
                { $set: { balances: player.balances } },
                { upsert: true, new: true }
            );
            logger.info(`Created wallet for ${player.playerId}`);
        }

        logger.info('Database populated successfully');
    } catch (error) {
        logger.error('Error populating database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

populateDatabase();
