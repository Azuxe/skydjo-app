# skydjo-app

This repository contains a simple Expo client and a minimal Node.js server used for testing real-time features of the Skydjo game.

## Getting started

Install dependencies for both the client and the server:

```bash
cd Skydjo
npm install
cd ../server
npm install
```

### Running the server

```bash
npm start
```

The server exposes a WebSocket endpoint on `ws://localhost:3001` and an HTTP endpoint `http://localhost:3001/history/<CODE>` returning chat history for a lobby.

### Running the Expo app

In another terminal run:

```bash
cd Skydjo
npx expo start
```

Open the Expo app on your device or simulator. A new **Lobby** tab lets you create or join a lobby, chat with other players and start a game.

### Using the lobby

1. Pick a random name is generated automatically when you open the lobby screen.
2. Enter a lobby code and press **Create** to create a new lobby or **Join** to join an existing one.
3. Share the code with friends so they can join.
4. Chat in real time and, if you are the host, press **Start Game** to begin.
