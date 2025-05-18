import db from "../database";

import { Player } from "../../common/session";
import { v4 as uuidv4 } from "uuid";

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
      this.players[username] = { id, name: username, state: "main menu" };
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
        return { success: false, message: "Invalid credentials" };
      }

      const player = result.rows[0];
      this.players[username] = {
        id: player.id,
        name: player.username,
        state: player.state,
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
        return { success: false, message: "Invalid credentials" };
      }

      await db.query("DELETE FROM players WHERE username = $1", [username]);
    } catch {}
  }

  async createGuest() {
    const guestId = uuidv4().slice(0, 8);
    const guestName = `Guest_${guestId}`;
    const result = await db.query(
      "INSERT INTO players (username, password) VALUES ($1, $2) RETURNING id",
      [guestName, "guest"]
    );

    const id = result.rows[0].id;
    this.players[guestName] = { id, name: guestName, state: "main menu" };
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
      return { success: true };
    } catch (err) {
      console.error("❌ State update error:", err);
      return { success: false, message: "State update failed" };
    }
  }
}
