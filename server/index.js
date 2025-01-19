// // index.js
// const express = require('express');
// const WebSocket = require('ws');
// const cors = require('cors');

// const app = express();
// const server = app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

// app.use(cors()); // Enable cross-origin requests

// // WebSocket setup
// const wss = new WebSocket.Server({ server });

// wss.on('connection', (ws) => {
//   console.log('A user connected');
  
//   ws.on('message', (message) => {
//     // Broadcast the received message to all other clients
//     wss.clients.forEach((client) => {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   });
  
//   ws.on('close', () => {
//     console.log('A user disconnected');
//   });
// });
// index.js
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = app.listen(3001,() => {
  console.log('Server is running on port 3001');
});

app.use(cors()); // Enable cross-origin requests

// WebSocket setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('A user connected');
  
  ws.on('message', (message) => {
    // Broadcast the received message to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('A user disconnected');
  });
});
