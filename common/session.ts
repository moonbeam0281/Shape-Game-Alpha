import { Vector2 } from "./math";

export interface SessionPlayer {
  name: string;
  health: number;
  position: Vector2;
}

export interface Player {
  id: string;
  name: string;
  state: string;
}

export interface Session {
  id: string;
  players: SessionPlayer[];
  status: "active" | "ended";
  createdAt: number;
}

export interface Lobby {
  id: number;
  name: string;
  owner: string;
  maxPlayers: number;
  allowSpectators: boolean;
  players: string[];
  lastActive: number;
}
