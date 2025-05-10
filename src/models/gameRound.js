const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
    roundId: {
        type: String,
        required: true,
        unique: true
    },
    serverSeedHash: {
        type: String,
        required: true
    },
    verificationData: {
        type: String,
        required: true
    },
    crashPoint: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: Date,
    status: {
        type: String,
        enum: ['starting', 'running', 'ended'],
        required: true
    }
}, {
    timestamps: true
});

const GameRound = mongoose.model('GameRound', gameRoundSchema);

module.exports = { GameRound };
