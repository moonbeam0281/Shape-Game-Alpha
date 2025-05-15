class LobbyHandler {
  constructor() {
    this.lobbies = {}; // id → lobby object
    this.lobbyIdCounter = 1;
    this.lobbyTimeout = 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanupLobbies(), 10 * 1000);
  }

  createLobby(owner, name, maxPlayers, allowSpectators = false) {
    const id = this.lobbyIdCounter++;

    this.lobbies[id] = {
      id,
      name,
      owner,
      maxPlayers,
      allowSpectators,
      players: [owner],
      lastActive: Date.now()
    };

    console.log(`🛠️ Created lobby '${name}' (ID: ${id}) by ${owner}`);
    return this.lobbies[id];
  }

  joinLobby(lobbyId, playerName) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby || lobby.players.includes(playerName)) return null;
    if (lobby.players.length >= lobby.maxPlayers) return { error: "Lobby is full" };

    lobby.players.push(playerName);
    lobby.lastActive = Date.now();
    return lobby;
  }

  leaveLobby(lobbyId, playerName) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return { error: "Lobby not found" };

    lobby.players = lobby.players.filter(p => p !== playerName);

    if (lobby.players.length === 0) {
      delete this.lobbies[lobbyId];
      console.log(`🗑️ Lobby ${lobbyId} deleted (empty)`);
      return { success: true, deleted: true };
    }

    // If owner leaves → kick everyone
    if (lobby.owner === playerName) {
      delete this.lobbies[lobbyId];
      console.log(`⚠️ Lobby ${lobbyId} disbanded (owner left)`);
      return { success: true, ownerLeft: true };
    }

    return { success: true };
  }

  getOpenLobbies() {
    return Object.values(this.lobbies).filter(lobby => lobby.players.length < lobby.maxPlayers);
  }

  getLobbyById(id) {
    return this.lobbies[id] || null;
  }

  cleanupLobbies() {
    const now = Date.now();
    for (const id in this.lobbies) {
      const lobby = this.lobbies[id];
      if (now - lobby.lastActive > this.lobbyTimeout) {
        console.log(`🧹 Cleaning up stale lobby: ${lobby.name} (ID: ${id})`);
        delete this.lobbies[id];
      }
    }
  }
}

module.exports = LobbyHandler;
