const WebSocket = require('ws');
const { getGameServer } = require('../game/gameServer');
const logger = require('../utils/logger');

function setupWebSocket(wss) {
    wss.on('connection', (ws) => {
        logger.info('New client connected');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                const gameServer = getGameServer();

                switch (data.event) {
                    case 'placeBet':
                        try {
                            const result = await gameServer.placeBet(
                                data.playerId,
                                data.amount,
                                data.cryptoCurrency
                            );
                            ws.send(JSON.stringify({
                                event: 'betPlaced',
                                data: result
                            }));
                        } catch (error) {
                            ws.send(JSON.stringify({
                                event: 'error',
                                data: { message: error.message }
                            }));
                        }
                        break;

                    case 'cashout':
                        try {
                            const result = await gameServer.cashout(data.playerId);
                            ws.send(JSON.stringify({
                                event: 'cashoutSuccess',
                                data: result
                            }));
                        } catch (error) {
                            ws.send(JSON.stringify({
                                event: 'error',
                                data: { message: error.message }
                            }));
                        }
                        break;

                    default:
                        ws.send(JSON.stringify({
                            event: 'error',
                            data: { message: 'Unknown event type' }
                        }));
                }
            } catch (error) {
                logger.error('WebSocket message error:', error);
                ws.send(JSON.stringify({
                    event: 'error',
                    data: { message: 'Invalid message format' }
                }));
            }
        });

        ws.on('close', () => {
            logger.info('Client disconnected');
        });

        ws.on('error', (error) => {
            logger.error('WebSocket error:', error);
        });
    });

    return wss;
}

module.exports = { setupWebSocket };
