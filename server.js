const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected with IP:', ws._socket.remoteAddress);
    ws.on('message', (message) => {
        // Convert message to a string to ensure JSON format is sent
        const messageString = Buffer.from(message).toString('utf8');
        console.log('Broadcasting message:', messageString);

        // Broadcast to all clients except the sender
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
    });
});

console.log('Signaling server running on ws://localhost:8080');
