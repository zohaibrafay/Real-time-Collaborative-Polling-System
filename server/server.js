require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const roomRoutes = require('./routes/room.routes');
const pollRoutes = require('./routes/poll.routes');
const setupSocket = require('./services/socket.service');

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms/:roomId/polls', pollRoutes);

// Setup WebSockets
setupSocket(io);

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
