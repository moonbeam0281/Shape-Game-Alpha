const express = require('express');
const cors = require('cors');

const PlayerHandler = require('./Handlers/PlayerHandler.js');
const LobbyHandler = require('./Handlers/LobbyHandler.js');

const app = express();
const PORT = 3000;

let DEV_KEY = null;

const fs = require('fs');

try {
  DEV_KEY = fs.readFileSync('../devkey.txt');
  console.log("🔐 Dev key loaded");
} catch (err) {
  console.log("🛑 No dev key found (dev panel hidden)");
}


app.use(cors());
app.use(express.json());

console.log("🧭 index.js loaded. Main components initated.");

// Handlers
const playerHandler = new PlayerHandler();
const lobbyHandler = new LobbyHandler();

app.get('/', (req, res) => {
  res.send('⚔️ Welcome to the Shape Game Backend API');
});


// 🔐 Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const result = playerHandler.register(username, password);
  res.json(result);
});

app.get('/is-dev', (req, res) => {
  const devFile = '../devkey.txt';
  if (fs.existsSync(devFile)) {
    res.json({ isDev: true });
  } else {
    res.json({ isDev: false });
  }
});

//DevKey check
app.get('/dev-key-status', (req, res) => {
  res.json({ hasDevKey: !!DEV_KEY });
});



// 🔐 Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const result = playerHandler.login(username, password);
  res.json(result);
});

// 🕶️ Join as Guest
app.post('/guest', (req, res) => {
  const result = playerHandler.createGuest();
  res.json(result);
});

app.get('/players', (req, res) => {
  const players = Object.values(playerHandler.players).map(p => ({
    id: p.id,
    name: p.name,
    state: p.state
  }));
  res.json(players);
});

//Dev pannel fucntions
app.post('/create-player', (req, res) => {
  const { username, password } = req.body;
  const result = playerHandler.register(username, password);
  res.json(result);
});

app.post('/delete-player', (req, res) => {
  const { username } = req.body;
  delete playerHandler.players[username];
  res.json({ success: true });
});

app.post('/set-player-state', (req, res) => {
  const { username, state } = req.body;
  const result = playerHandler.setPlayerState(username, state);
  res.json(result);
});



// 🏗️ Create Lobby
app.post('/create-lobby', (req, res) => {
  const { owner, name, maxPlayers, allowSpectators } = req.body;
  const lobby = lobbyHandler.createLobby(owner, name, maxPlayers, allowSpectators);
  // Set player state
  playerHandler.setPlayerState(owner, "in lobby");
  res.json(lobby);
});

// 🤝 Join Lobby
app.post('/join-lobby', (req, res) => {
  const { lobbyId, player } = req.body;
  const lobby = lobbyHandler.joinLobby(parseInt(lobbyId), player);
  if (!lobby || lobby.error) return res.status(400).json({ error: "Lobby not found or full or already joined" });

  playerHandler.setPlayerState(player, "in lobby");
  res.json(lobby);
});

// 🧹 Leave Lobby
app.post('/leave-lobby', (req, res) => {
  const { lobbyId, player } = req.body;
  const result = lobbyHandler.leaveLobby(parseInt(lobbyId), player);

  playerHandler.setPlayerState(player, "main menu");
  res.json(result);
});

app.post('/delete-lobby', (req, res) => {
  const { lobbyId } = req.body;
  const lobby = lobbyHandler.lobbies[lobbyId];

  if (!lobby) return res.json({ success: false, error: "Lobby not found" });

  // ⚔️ Send all players back to main menu
  lobby.players.forEach(player => {
    playerHandler.setPlayerState(player, "main menu");
  });

  delete lobbyHandler.lobbies[lobbyId];

  res.json({ success: true });
});


// 🗂️ Get All Open Lobbies
app.get('/lobbies', (req, res) => {
  res.json(lobbyHandler.getOpenLobbies());
});

// ⚔️ Start Game
app.post('/start-game', (req, res) => {
  const { lobbyId } = req.body;
  const lobby = lobbyHandler.getLobbyById(parseInt(lobbyId));

  if (!lobby || !lobby.players || lobby.players.length === 0) {
    return res.status(400).json({ error: 'Lobby not found or empty' });
  }

  lobby.players.forEach(p => playerHandler.setPlayerState(p, "in game"));

  // Remove lobby from active list
  delete lobbyHandler.lobbies[lobbyId];

  res.json({ success: true, message: "Game started", lobbyId });
});

//Debug:
app.get('/debug-state', (req, res) => {
  res.json({
    players: playerHandler.players,
    lobbies: lobbyHandler.lobbies
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
