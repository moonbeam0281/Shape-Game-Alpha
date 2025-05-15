class PlayerHandler {
  constructor() {
    this.players = {};         // username → player object
    this.playerCounter = 1;    // Used to assign numeric IDs
  }

  register(username, password) {
    if (this.players[username]) return { error: "Username already taken" };

    const player = {
      id: this.playerCounter++,
      name: username,
      password,
      state: "main menu"
    };

    this.players[username] = player;
    return { success: true, ...this._stripSensitive(player) };
  }

  login(username, password) {
    const player = this.players[username];
    if (!player || player.password !== password) {
      return { error: "Invalid username or password" };
    }

    player.state = "main menu";
    return { success: true, ...this._stripSensitive(player) };
  }

  createGuest() {
    const username = `guest-${Date.now()}`;
    const player = {
      id: this.playerCounter++,
      name: username,
      password: null,
      state: "main menu"
    };

    this.players[username] = player;
    return { success: true, ...this._stripSensitive(player) };
  }

  setPlayerState(username, newState) {
    const player = this.players[username];
    if (!player) return { error: "Player not found" };
    player.state = newState;
    return { success: true };
  }

  getPlayer(username) {
    const player = this.players[username];
    return player ? this._stripSensitive(player) : null;
  }

  _stripSensitive(player) {
    return {
      id: player.id,
      name: player.name,
      state: player.state
    };
  }
}

module.exports = PlayerHandler;
