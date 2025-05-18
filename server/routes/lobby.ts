import { Router } from "express";
import PlayerService from "../services/player-service";
import LobbyService from "../services/lobby-service";

const playerService = PlayerService.default;
const lobbyService = LobbyService.default;

const router = Router();

router.post("/create-lobby", async (req, res) => {
  const { owner, name, maxPlayers, allowSpectators } = req.body;
  const lobby = await lobbyService.createLobby(
    owner,
    name,
    maxPlayers,
    allowSpectators
  );
  await playerService.setPlayerState(owner, "in lobby");
  res.json(lobby);
});

router.post("/join-lobby", async (req, res) => {
  const { lobbyId, player } = req.body;
  const lobby = await lobbyService.joinLobby(parseInt(lobbyId), player);
  if (!lobby || "error" in lobby)
    return res
      .status(400)
      .json({ error: "Lobby not found or full or already joined" });

  await playerService.setPlayerState(player, "in lobby");
  res.json(lobby);
});

router.post("/leave-lobby", async (req, res) => {
  const { lobbyId, player } = req.body;
  const result = await lobbyService.leaveLobby(parseInt(lobbyId), player);
  await playerService.setPlayerState(player, "main menu");
  res.json(result);
});

router.post("/delete-lobby", async (req, res) => {
  const { lobbyId } = req.body;
  const lobby = lobbyService.lobbies[lobbyId];

  if (!lobby) return res.json({ success: false, error: "Lobby not found" });

  await Promise.all(
    lobby.players.map((player) => {
      return playerService.setPlayerState(player, "main menu");
    })
  );

  delete lobbyService.lobbies[lobbyId];
  res.json({ success: true });
});

router.get("/lobbies", async (req, res) => {
  res.json(await lobbyService.getOpenLobbies());
});

router.post("/start-game", async (req, res) => {
  const { lobbyId } = req.body;
  const lobby = await lobbyService.getLobbyById(parseInt(lobbyId));

  if (!lobby || !lobby.players || lobby.players.length === 0) {
    return res.status(400).json({ error: "Lobby not found or empty" });
  }

  await Promise.all(
    lobby.players.map((player) => {
      return playerService.setPlayerState(player, "in game");
    })
  );

  delete lobbyService.lobbies[lobbyId];

  res.json({ success: true, message: "Game started", lobbyId });
});

export default router;
