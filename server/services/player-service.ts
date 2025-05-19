import db from "../database";

import { Player } from "../../common/session";
import { v4 as uuidv4 } from "uuid";
import { ids } from "webpack";

export default class PlayerService {
  players: Record<string, Player>;

  static default = new PlayerService();

  constructor() {
    this.players = {};
  }

  async register(username: string, password: string) {
    try {
      const existing = await db.query(
        "SELECT * FROM players WHERE username = $1",
        [username]
      );

      if (existing.rows.length > 0) {
        return { success: false, message: "Username already taken" };
      }

      const result = await db.query<{ id: string }>(
        "INSERT INTO players (username, password) VALUES ($1, $2) RETURNING id",
        [username, password]
      );

      const id = result.rows[0].id;
      this.players[username] = { id, name: username, state: "main menu", isGuest: false };
      return { success: true, id, name: username };
    } catch (err) {
      console.error("❌ Register error:", err);
      return { success: false, message: "Database error" };
    }
  }

  async login(username: string, password: string) {
    try {
      const result = await db.query(
        "SELECT * FROM players WHERE username = $1 AND password = $2",
        [username, password]
      );

      if (result.rows.length === 0) {
        return { success: false, message: "Invalid credentials. Check your username or password." };
      }

      const player = result.rows[0];
      this.players[username] = {
        id: player.id,
        name: player.username,
        state: player.state,
        isGuest: false
      };
      console.log(`[LOGIN DEBUG] User lookup:`, result.rows);

      return { success: true, id: player.id, name: player.username };
    } catch (err) {
      console.error("❌ Login error:", err);
      return { success: false, message: "Database error" };
    }
  }

  async delete(username: string, password: string) {
    try {
      const result = await db.query(
        "SELECT * FROM players WHERE username = $1 AND password = $2",
        [username, password]
      );

      if (result.rows.length === 0) {
        return { success: false, message: "Unable to delete. Wrong details." };
      }

      await db.query("DELETE FROM players WHERE username = $1", [username]);
      console.log(`Deleted player ${username}.`);
    } catch(e) {
      console.log(`Failed to delete player: ${username}\n ${e}`);
    }
  }

  /*
  async leaveLobbyRefresh(username: string) {
    try {
      const result = await db.query("SELECT lobby_id FROM players WHERE username = $1", [username]);
      const lobbyId = result.rows[0]?.lobby_id;
      if (!lobbyId) return { success: true }

      await db.query(
        "UPDATE lobbies SET players = array_remove(players, $1) WHERE id = $2",
        [username, lobbyId]
      );
      await db.query(
        "UPDATE players SET lobby_id = NULL, state = 'main menu' WHERE username = $1",
        [username]
      );

    }
    catch {

    }
  }
  */

  async createGuest() {
    const guestId = uuidv4().slice(0, 8);
    const guestName = `Guest_${guestId}`;
    const result = await db.query(
      "INSERT INTO players (username, password, guest) VALUES ($1, $2, $3) RETURNING id",
      [guestName, "guest", true]
    );

    const id = result.rows[0].id;
    this.players[guestName] = { id, name: guestName, state: "main menu", isGuest: true };
    return { success: true, id, name: guestName };
  }

  async setPlayerState(username: string, newState: string) {
    try {
      await db.query("UPDATE players SET state = $1 WHERE username = $2", [
        newState,
        username,
      ]);
      if (this.players[username]) {
        this.players[username].state = newState;
      }
      console.log(`Player: ${username} has logged out`);
      return { success: true };
    } catch (err) {
      console.error("❌ State update error:", err);
      return { success: false, message: "State update failed" };
    }
  }
}
