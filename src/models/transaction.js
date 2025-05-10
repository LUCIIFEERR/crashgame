const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['bet', 'cashout'],
        required: true
    },
    usdAmount: {
        type: Number,
        required: true
    },
    cryptoAmount: {
        type: Number,
        required: true
    },
    cryptoCurrency: {
        type: String,
        required: true
    },
    priceAtTime: {
        type: Number,
        required: true
    },
    roundId: {
        type: String,
        required: true,
        index: true
    },
    multiplier: {
        type: Number,
        required: function() {
            return this.type === 'cashout';
        }
    },
    transactionHash: {
        type: String,
        default: function() {
            return require('crypto').randomBytes(32).toString('hex');
        }
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };
