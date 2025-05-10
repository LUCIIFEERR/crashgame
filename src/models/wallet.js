const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true,
        unique: true
    },
    balances: {
        type: Map,
        of: Number,
        default: new Map()
    }
}, {
    timestamps: true
});

// Add method to update balance atomically
walletSchema.methods.updateBalance = async function(currency, amount) {
    const currentBalance = this.balances.get(currency) || 0;
    const newBalance = currentBalance + amount;
    
    if (newBalance < 0) {
        throw new Error('Insufficient balance');
    }
    
    this.balances.set(currency, newBalance);
    return this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = { Wallet };
