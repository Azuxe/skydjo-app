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

The server exposes a WebSocket endpoint on `ws://localhost:3001` and an HTTP endpoint `http://localhost:3001/history` returning chat history.

### Running the Expo app

In another terminal run:

```bash
cd Skydjo
npx expo start
```

Open the Expo app on your device or simulator. A new **Lobby** tab is available to test socket communication.
