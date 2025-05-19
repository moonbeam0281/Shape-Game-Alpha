import { Router } from "express";
import PlayerService from "../services/player-service";

const playerService = PlayerService.default;

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const result = await playerService.register(username, password);
  if(result.success)
    console.log(`A new player has registered: ${result.name}:${result.id}`);
  res.json(result);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await playerService.login(username, password);
  res.json(result);
});

router.post("/guest", async (req, res) => {
  const result = await playerService.createGuest();
  if(result.success)
    console.log(`A new guest has joined: ${result.name}:${result.id}`);
  res.json(result);
});

router.get("/players", async (req, res) => {
  const players = Object.values(playerService.players).map((p) => ({
    id: p.id,
    name: p.name,
    state: p.state,
  }));
  res.json(players);
});

export default router;
