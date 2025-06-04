const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const games = {};

function makeCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function broadcastToGame(code, data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.gameCode === code
    ) {
      client.send(msg);
    }
  });
}

function broadcastUsers(code) {
  const game = games[code];
  if (game) {
    broadcastToGame(code, {
      type: 'users',
      users: game.players,
      host: game.host,
    });
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    if (data.type === 'create') {
      const code = data.code || makeCode();
      const game = (games[code] = games[code] || {
        players: [],
        host: data.name,
        history: [],
      });
      ws.gameCode = code;
      ws.userName = data.name;
      if (!game.players.includes(data.name)) {
        game.players.push(data.name);
        game.history.push({ event: 'join', user: data.name });
      }
      ws.send(JSON.stringify({ type: 'created', code }));
      broadcastUsers(code);
    } else if (data.type === 'join') {
      const game = games[data.code];
      if (!game) {
        ws.send(
          JSON.stringify({ type: 'error', message: 'Game not found' })
        );
        return;
      }
      ws.gameCode = data.code;
      ws.userName = data.name;
      if (!game.players.includes(data.name)) {
        game.players.push(data.name);
        game.history.push({ event: 'join', user: data.name });
      }
      broadcastUsers(data.code);
    } else if (data.type === 'chat') {
      const code = ws.gameCode;
      const game = games[code];
      if (!game) return;
      const record = { event: 'chat', user: ws.userName, message: data.message };
      game.history.push(record);
      broadcastToGame(code, {
        type: 'chat',
        user: ws.userName,
        message: data.message,
      });
    } else if (data.type === 'start') {
      const code = ws.gameCode;
      const game = games[code];
      if (game && ws.userName === game.host) {
        game.history.push({ event: 'start' });
        broadcastToGame(code, { type: 'started' });
      }
    }
  });

  ws.on('close', () => {
    const code = ws.gameCode;
    const name = ws.userName;
    if (code && games[code]) {
      const game = games[code];
      game.players = game.players.filter((u) => u !== name);
      game.history.push({ event: 'leave', user: name });
      broadcastUsers(code);
      if (game.players.length === 0) {
        delete games[code];
      }
    }
  });
});

app.get('/history/:code', (req, res) => {
  const code = req.params.code;
  res.json(games[code]?.history || []);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
