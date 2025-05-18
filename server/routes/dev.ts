import fs from "fs";
import path from "path";
import PlayerService from "../services/player-service";
import { Router } from "express";
import LobbyService from "../services/lobby-service";
import { fileURLToPath } from "url";

const playerService = PlayerService.default;
const lobbyService = LobbyService.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

let DEV_KEY: string | null = null;

try {
  DEV_KEY = fs
    .readFileSync(path.join(__dirname, "../../devkey.txt"), "utf-8")
    .trim();
  console.log("🔐 Dev key loaded");
} catch (err) {
  console.log("🛑 No dev key found (dev panel hidden)");
}

router.get("/is-dev", async (req, res) => {
  const devFile = path.join(__dirname, "../../devkey.txt");
  res.json({ isDev: fs.existsSync(devFile) });
});

router.get("/dev-key-status", async (req, res) => {
  res.json({ hasDevKey: !!DEV_KEY });
});

router.post("/create-player", async (req, res) => {
  const { username, password } = req.body;
  const result = await playerService.register(username, password);
  res.json(result);
});

router.post("/delete-player", async (req, res) => {
  const { username } = req.body;
  delete playerService.players[username];
  res.json({ success: true });
});

router.post("/set-player-state", async (req, res) => {
  const { username, state } = req.body;
  const result = await playerService.setPlayerState(username, state);
  res.json(result);
});

router.get("/debug-state", async (req, res) => {
  res.json({
    players: playerService.players,
    lobbies: lobbyService.lobbies,
  });
});

export default router;
