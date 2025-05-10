require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeGameServer } = require('./game/gameServer');
const { setupWebSocket } = require('./websocket/wsServer');
const walletRoutes = require('./routes/walletRoutes');
const gameRoutes = require('./routes/gameRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/verify', verificationRoutes);

// WebSocket setup
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Initialize game server
initializeGameServer(wss);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
