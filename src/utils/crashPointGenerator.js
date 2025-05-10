const crypto = require('crypto');

class CrashPointGenerator {
    constructor(maxMultiplier = 100) {
        this.maxMultiplier = maxMultiplier;
        this.serverSeed = null;
        this.clientSeed = null;
        this.nonce = 0;
    }

    // Generate a new server seed and return its hash
    generateServerSeed() {
        this.serverSeed = crypto.randomBytes(32).toString('hex');
        return this.getServerSeedHash();
    }

    // Get hash of server seed (public)
    getServerSeedHash() {
        return crypto.createHash('sha256')
            .update(this.serverSeed)
            .digest('hex');
    }

    // Set client seed (optional, adds additional randomness)
    setClientSeed(seed) {
        this.clientSeed = seed;
    }

    // Generate crash point using both seeds and nonce
    generateCrashPoint(roundId) {
        if (!this.serverSeed) {
            this.generateServerSeed();
        }
    
        // Combine all sources of randomness
        const seedData = [
            this.serverSeed,
            this.clientSeed || '',
            roundId,
            this.nonce.toString()
        ].join(':');
    
        // Generate hash
        const hash = crypto.createHmac('sha256', seedData)
            .digest('hex');
        
        // Convert first 13 hex chars to decimal (52 bits)
        const seed = parseInt(hash.slice(0, 13), 16);
        
        // Generate float in range [0, 1)
        const r = (seed % 2**52) / 2**52;
    
        // Calculate crash point using exponential distribution
        // Using a larger multiplier (e.g., 1.0 instead of 0.01)
        // This will create values that can exceed 1.0
        const crashPointValue = 1.0 * Math.pow(1/r, 1/3);
        
        // First convert to number, then limit to 2 decimal places
        const crashPoint = Math.max(1.0, Number(crashPointValue.toFixed(2)));
        
        // Increment nonce for next generation
        this.nonce++;
    
        return {
            crashPoint: Math.min(crashPoint, this.maxMultiplier),
            hash: hash,
            seed: seedData,
            nonce: this.nonce - 1
        };
    }

    // Verify a crash point
    verifyCrashPoint(serverSeed, clientSeed, roundId, nonce, expectedCrashPoint) {
        const tempServerSeed = this.serverSeed;
        const tempClientSeed = this.clientSeed;
        const tempNonce = this.nonce;

        // Set the seeds to verify
        this.serverSeed = serverSeed;
        this.clientSeed = clientSeed;
        this.nonce = nonce;

        // Generate crash point with same inputs
        const result = this.generateCrashPoint(roundId);

        // Restore original state
        this.serverSeed = tempServerSeed;
        this.clientSeed = tempClientSeed;
        this.nonce = tempNonce;

        // Compare with expected crash point
        return Math.abs(result.crashPoint - expectedCrashPoint) < 0.01;
    }

    // Get current game state for verification
    getGameState() {
        return {
            serverSeedHash: this.getServerSeedHash(),
            clientSeed: this.clientSeed,
            nonce: this.nonce
        };
    }
}

module.exports = CrashPointGenerator;
