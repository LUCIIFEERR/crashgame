const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_PLAYER = 'player1';

async function runTests() {
    try {
        // Test 1: Get wallet balance
        console.log('\n1. Testing Get Wallet Balance...');
        const balanceResponse = await axios.get(`${API_URL}/wallet/balance/${TEST_PLAYER}`);
        console.log('Balance:', balanceResponse.data);

        // Test 2: Place a bet
        console.log('\n2. Testing Place Bet...');
        const betResponse = await axios.post(`${API_URL}/game/bet`, {
            playerId: TEST_PLAYER,
            amount: 10,
            cryptoCurrency: 'bitcoin'
        });
        console.log('Bet placed:', betResponse.data);

        // Test 3: Get current game state
        console.log('\n3. Testing Current Game State...');
        const gameResponse = await axios.get(`${API_URL}/game/current`);
        console.log('Current game:', gameResponse.data);

        // Test 4: Cash out (might fail if game hasn't started or already crashed)
        console.log('\n4. Testing Cash Out...');
        try {
            const cashoutResponse = await axios.post(`${API_URL}/game/cashout`, {
                playerId: TEST_PLAYER
            });
            console.log('Cashout result:', cashoutResponse.data);
        } catch (error) {
            console.log('Cashout failed (expected if game not in right state):', error.response.data);
        }

        // Test 5: Get game history
        console.log('\n5. Testing Game History...');
        const historyResponse = await axios.get(`${API_URL}/game/history`);
        console.log('Game history:', historyResponse.data);

        // Test 6: Get transaction history
        console.log('\n6. Testing Transaction History...');
        const transactionsResponse = await axios.get(`${API_URL}/wallet/transactions/${TEST_PLAYER}`);
        console.log('Transactions:', transactionsResponse.data);

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

runTests();
