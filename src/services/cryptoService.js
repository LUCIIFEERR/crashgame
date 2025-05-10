const axios = require('axios');
const logger = require('../utils/logger');

// Cache for crypto prices
const priceCache = new Map();
const CACHE_DURATION = 10000; // 10 seconds

async function getCryptoPrice(cryptoCurrency) {
    const now = Date.now();
    const cached = priceCache.get(cryptoCurrency);

    if (cached && now - cached.timestamp < CACHE_DURATION) {
        return cached.price;
    }

    try {
        const response = await axios.get(`${process.env.COINGECKO_API_URL}/simple/price`, {
            params: {
                ids: cryptoCurrency.toLowerCase(),
                vs_currencies: 'usd'
            }
        });

        const price = response.data[cryptoCurrency.toLowerCase()].usd;
        priceCache.set(cryptoCurrency, {
            price,
            timestamp: now
        });

        return price;
    } catch (error) {
        logger.error('Error fetching crypto price:', error);
        
        // If we have a cached price, use it as fallback
        if (cached) {
            logger.info('Using cached price as fallback');
            return cached.price;
        }

        throw new Error('Failed to fetch crypto price');
    }
}

module.exports = {
    getCryptoPrice
};
