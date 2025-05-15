// server/handlers/GameSessionHandler.js

class GameSessionHandler {
  constructor() {
    this.sessions = {};
    this.sessionCounter = 1;
  }

  createSession(players) {
    const id = `game-${this.sessionCounter++}`;
    this.sessions[id] = {
      id,
      players: players.map(name => ({
        name,
        health: 100,
        position: { x: 0, y: 0 },
      })),
      status: 'active',
      createdAt: Date.now(),
    };
    console.log(`🎮 Game session created: ${id}`);
    return this.sessions[id];
  }

  getSession(id) {
    return this.sessions[id];
  }

  updatePlayer(id, playerName, data) {
    const session = this.sessions[id];
    if (!session) return null;

    const player = session.players.find(p => p.name === playerName);
    if (player) {
      Object.assign(player, data);
    }

    return player;
  }

  endSession(id) {
    if (this.sessions[id]) {
      this.sessions[id].status = 'ended';
      console.log(`🛑 Game session ended: ${id}`);
    }
  }
}

module.exports = GameSessionHandler;
