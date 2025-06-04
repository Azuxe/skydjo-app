const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const lobby = {
  users: [],
  history: []
};

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    if (data.type === 'join') {
      userId = data.name;
      lobby.users.push(userId);
      lobby.history.push({ event: 'join', user: userId });
      broadcast({ type: 'users', users: lobby.users });
    } else if (data.type === 'chat') {
      const record = { event: 'chat', user: userId, message: data.message };
      lobby.history.push(record);
      broadcast({ type: 'chat', user: userId, message: data.message });
    }
  });

  ws.on('close', () => {
    if (userId) {
      lobby.users = lobby.users.filter((u) => u !== userId);
      lobby.history.push({ event: 'leave', user: userId });
      broadcast({ type: 'users', users: lobby.users });
    }
  });
});

app.get('/history', (req, res) => {
  res.json(lobby.history);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
