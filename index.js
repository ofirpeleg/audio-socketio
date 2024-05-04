const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"] // Allow GET and POST requests
    }
});

app.use(cors()); // Enable CORS for all routes

const PORT = process.env.PORT || 3000;

// Handle raw body buffer for audio endpoint
app.use('/audio', express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A device connected');

    socket.on('sensorData', (data) => {
        console.log('Received sensor data:', data);
    });

    socket.on('gpsData', (data) => {
        console.log('Received GPS data:', data);
    });

    socket.on('audioData', (buffer) => {
        console.log('Received audio data via WebSocket');
        // Broadcast audio data to other clients
        socket.broadcast.emit('audio', { audioData: buffer.toString('base64') });
    });

    socket.on('disconnect', () => {
        console.log('A device disconnected');
    });
});

// HTTP POST endpoint for audio data to receive raw binary
app.post('/audio', (req, res) => {
    const audioData = req.body; // Buffer containing binary audio data
    console.log('Received audio data via HTTP');
    //console.log(audioData);
    // Broadcast this audio data to all connected clients
    // io.emit('audio', { audioData: audioData.toString('base64') });
    io.emit('audio', audioData );
    res.status(200).send('Audio data received');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


