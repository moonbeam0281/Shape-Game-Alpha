const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const database = require('./Handlers/Database.js');

const PlayerHandler = require('./Handlers/PlayerHandler.js');
const LobbyHandler = require('./Handlers/LobbyHandler.js');
const { promiseHooks } = require('v8');

const app = express();
const PORT = 3000;

let DEV_KEY = null;

// Middleware
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

console.log("🧭 index.js loaded. Main components initiated.");

// Handlers
const playerHandler = new PlayerHandler();
const lobbyHandler = new LobbyHandler();

// 🛠️ Async SQL Initialization
async function initializeDatabase() {
  const sqlDir = path.join(__dirname, 'SQL');
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir);
    console.log("📁 Created missing SQL directory.");
    return;
  }

  const sqlFiles = fs.readdirSync(sqlDir);
  for (const file of sqlFiles) {
    const query = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    try {
      await database.query(query);
      console.log(`🗃️ Executed: ${file}`);
    } catch (err) {
      console.error(`❌ Error executing ${file}:`, err.message);
    }
  }
}

// 🔐 Dev Key Check
function loadDevKey() {
  try {
    DEV_KEY = fs.readFileSync(path.join(__dirname, '../devkey.txt'), 'utf-8').trim();
    console.log("🔐 Dev key loaded");
  } catch (err) {
    console.log("🛑 No dev key found (dev panel hidden)");
  }
}

// 🌐 Routes

app.get('/', (req, res) => res.redirect('/index.html'));

// 🔐 Auth Routes
app.post('/register', async(req, res) => {
  const { username, password } = req.body;
  const result = await playerHandler.register(username, password);
  res.json(result);
});

app.post('/login', async(req, res) => {
  const { username, password } = req.body;
  const result = await playerHandler.login(username, password);
  res.json(result);
});

app.post('/guest', async(req, res) => {
  const result = await playerHandler.createGuest();
  res.json(result);
});

app.get('/is-dev', async(req, res) => {
  const devFile = path.join(__dirname, '../devkey.txt');
  res.json({ isDev: fs.existsSync(devFile) });
});

app.get('/dev-key-status', async(req, res) => {
  res.json({ hasDevKey: !!DEV_KEY });
});

app.get('/players', async(req, res) => {
  const players = Object.values(playerHandler.players).map(p => ({
    id: p.id,
    name: p.name,
    state: p.state
  }));
  res.json(players);
});

// 🛠️ Dev Panel Functions
app.post('/create-player', async(req, res) => {
  const { username, password } = req.body;
  const result = await playerHandler.register(username, password);
  res.json(result);
});

app.post('/delete-player', async(req, res) => {
  const { username } = req.body;
  delete playerHandler.players[username];
  res.json({ success: true });
});

app.post('/set-player-state', async(req, res) => {
  const { username, state } = req.body;
  const result = await playerHandler.setPlayerState(username, state);
  res.json(result);
});

// 🏗️ Lobby Routes
app.post('/create-lobby', async(req, res) => {
  const { owner, name, maxPlayers, allowSpectators } = req.body;
  const lobby = await lobbyHandler.createLobby(owner, name, maxPlayers, allowSpectators);
  await playerHandler.setPlayerState(owner, "in lobby");
  res.json(lobby);
});

app.post('/join-lobby', async(req, res) => {
  const { lobbyId, player } = req.body;
  const lobby = await lobbyHandler.joinLobby(parseInt(lobbyId), player);
  if (!lobby || lobby.error)
    return res.status(400).json({ error: "Lobby not found or full or already joined" });

  await playerHandler.setPlayerState(player, "in lobby");
  res.json(lobby);
});

app.post('/leave-lobby', async(req, res) => {
  const { lobbyId, player } = req.body;
  const result = await lobbyHandler.leaveLobby(parseInt(lobbyId), player);
  await playerHandler.setPlayerState(player, "main menu");
  res.json(result);
});

app.post('/delete-lobby', async(req, res) => {
  const { lobbyId } = req.body;
  const lobby = lobbyHandler.lobbies[lobbyId];

  if (!lobby) return res.json({ success: false, error: "Lobby not found" });

  await Promise.all(lobby.players.map(player => {
    return playerHandler.setPlayerState(player, "main menu"); 
  }))

  delete lobbyHandler.lobbies[lobbyId];
  res.json({ success: true });
});

app.get('/lobbies', async(req, res) => {
  res.json(await lobbyHandler.getOpenLobbies());
});

app.post('/start-game', async(req, res) => {
  const { lobbyId } = req.body;
  const lobby = await lobbyHandler.getLobbyById(parseInt(lobbyId));

  if (!lobby || !lobby.players || lobby.players.length === 0) {
    return res.status(400).json({ error: 'Lobby not found or empty' });
  }

  await Promise.all(lobby.players.map(player => {
    return playerHandler.setPlayerState(player, "in game"); 
  }))
  
  delete lobbyHandler.lobbies[lobbyId];

  res.json({ success: true, message: "Game started", lobbyId });
});

// 🧪 Debug Route
app.get('/debug-state', async(req, res) => {
  res.json({
    players: playerHandler.players,
    lobbies: lobbyHandler.lobbies
  });
});

// 🏁 Launch server after DB init
(async () => {
  await initializeDatabase();
  loadDevKey();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
})();
