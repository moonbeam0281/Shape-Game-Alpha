import { Session, SessionPlayer } from "../../common/session";

export default class GameSessionService {
  sessions: Record<string, Session> = {};
  sessionCounter: number;
  constructor() {
    this.sessions = {};
    this.sessionCounter = 1;
  }

  createSession(players: string[]) {
    const id = `game-${this.sessionCounter++}`;
    this.sessions[id] = {
      id,
      players: players.map((name) => ({
        name,
        health: 100,
        position: { x: 0, y: 0 },
      })),
      status: "active",
      createdAt: Date.now(),
    };
    console.log(`🎮 Game session created: ${id}`);
    return this.sessions[id];
  }

  getSession(id: string) {
    return this.sessions[id];
  }

  updatePlayer(id: string, playerName: string, data: Partial<SessionPlayer>) {
    const session = this.sessions[id];
    if (!session) return null;

    const player = session.players.find((p) => p.name === playerName);
    if (player) {
      Object.assign(player, data);
    }

    return player;
  }

  endSession(id: string) {
    if (this.sessions[id]) {
      this.sessions[id].status = "ended";
      console.log(`🛑 Game session ended: ${id}`);
    }
  }
}
