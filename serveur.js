const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('ws');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const wsServer = new Server({ server: httpServer });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const userRoutes = require('./routes/userRoutes');
const pixelRoutes = require('./routes/pixelRoutes');
app.use('/api/users', userRoutes);
app.use('/api/pixels', pixelRoutes);

// WebSocket server
wsServer.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    // Handle messages from clients (pixel updates)
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
