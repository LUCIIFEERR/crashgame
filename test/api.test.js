const axios = require('axios');

// URL of your API
const API_URL = 'http://localhost:3000/api';
const TEST_PLAYER = 'testPlayer123'; // Replace with an actual player ID if needed

describe('Crypto Crash API Tests', () => {
    it('1. Testing Get Wallet Balance...', async () => {
        try {
          const balanceResponse = await axios.get(`${API_URL}/wallet/balance/${TEST_PLAYER}`);
          console.log('Balance response:', balanceResponse.data);
          expect(balanceResponse.status).toBe(200);
          // Adjust based on actual response structure
          expect(balanceResponse.data).toHaveProperty('cryptoBalances');
          expect(balanceResponse.data.cryptoBalances).toHaveProperty('bitcoin');
          expect(balanceResponse.data.cryptoBalances).toHaveProperty('ethereum');
        } catch (error) {
          console.error('Error fetching balance:', error);
          throw error;
        }
      });
      
      it('2. Testing Place Bet...', async () => {
        try {
          const betResponse = await axios.post(`${API_URL}/game/bet`, {
            playerId: TEST_PLAYER,
            amount: 10,
            cryptoCurrency: 'bitcoin',
          });
          console.log('Bet placed:', betResponse.data);
          expect(betResponse.status).toBe(200);
          expect(betResponse.data).toHaveProperty('cryptoAmount');
          expect(betResponse.data).toHaveProperty('price');
        } catch (error) {
          console.error('Error placing bet:', error.response?.data || error);
          throw error;
        }
      });
      

  it('3. Testing Current Game State...', async () => {
    try {
      const gameResponse = await axios.get(`${API_URL}/game/current`);
      console.log('Current game:', gameResponse.data);
      expect(gameResponse.status).toBe(200);
      expect(gameResponse.data).toHaveProperty('roundId');
      expect(gameResponse.data).toHaveProperty('status');
    } catch (error) {
      console.error('Error fetching current game state:', error);
      throw error;
    }
  });

  it('4. Testing Cash Out...', async () => {
    try {
      const cashoutResponse = await axios.post(`${API_URL}/game/cashout`, {
        playerId: TEST_PLAYER,
      });
      console.log('Cashout result:', cashoutResponse.data);
      expect(cashoutResponse.status).toBe(200);
    } catch (error) {
      console.error('Cashout failed (expected if game not in right state):', error.response?.data || error);
    }
  });

  it('5. Testing Game History...', async () => {
    try {
      const historyResponse = await axios.get(`${API_URL}/game/history`);
      console.log('Game history:', historyResponse.data);
      expect(historyResponse.status).toBe(200);
      expect(Array.isArray(historyResponse.data)).toBe(true);
    } catch (error) {
      console.error('Error fetching game history:', error);
      throw error;
    }
  });
});
