const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let clientIdCounter = 0;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

wss.on('connection', (ws) => {
  const clientId = clientIdCounter++;
  console.log(`New client connected: ${clientId}`);
  clients.push({ id: clientId, ws });

  ws.on('message', (message) => {
    console.log(`Received message from ${clientId}: ${message}`);
    // Broadcast the message to all connected clients
    clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(`New client ${clientId} said: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients = clients.filter(client => client.id !== clientId);
    console.log(`Remaining clients: ${clients.map(client => client.id).join(', ')}`);
  });
});

// Periodically send a message to all connected clients
setInterval(() => {
  var message = `Server time: ${new Date().toLocaleTimeString()}`;
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      message = `Client: ${client.id} Server time: ${new Date().toLocaleTimeString()}`;
      client.ws.send(message);
    }
  });
}, 1000); // Send message every 1 seconds

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});