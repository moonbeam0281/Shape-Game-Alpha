import { API, showError } from "../common/script";

const lobbyId = localStorage.getItem("currentLobby");

{
  const playerName = localStorage.getItem("playerName");

  const playerNameDisplayElement = document.getElementById("playerNameDisplay");
  if (playerNameDisplayElement) {
    playerNameDisplayElement.textContent = lobbyId;
  }

  if (!lobbyId || !playerName) {
    alert("Missing lobby or player info. Redirecting...");
    window.location.href = "/lobby";
  }
}

export async function fetchLobby() {
  const res = await fetch(`${API}/lobbies`);
  const lobbies: { id: number; owner: string; players: string[] }[] =
    await res.json();

  const lobbyId = parseInt(localStorage.getItem("currentLobby") ?? "0");
  const playerName = localStorage.getItem("playerName") ?? "";
  const lobby = lobbies.find((l) => l.id === lobbyId);

  const list = document.getElementById("playerList");
  if (list) {
    list.innerHTML = "";
  }

  if (!lobby) {
    showError("Lobby no longer exists.");
    localStorage.removeItem("currentLobby");
    setTimeout(() => (window.location.href = "/lobby"), 1000);
    return;
  }

  if (!lobby.players.includes(playerName) && lobby.owner !== playerName) {
    showError("You are no longer in this lobby.");
    localStorage.removeItem("currentLobby");
    setTimeout(() => (window.location.href = "/lobby"), 1000);
    return;
  }

  lobby.players.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    if (list) {
      list.appendChild(li);
    }
  });

  const isOwner = lobby.owner === playerName;
  const ownerControlsElement = document.getElementById("ownerControls");
  if (ownerControlsElement) {
    ownerControlsElement.style.display = isOwner ? "block" : "none";
  }
}

export function startGame() {
  fetch(`${API}/start-game`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lobbyId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) alert(data.error);
      else {
        alert("Game started!");
        // Replace with actual redirect to game page later
      }
    });
}

export function leaveLobby() {
  fetch(`${API}/leave-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lobbyId: localStorage.getItem("currentLobby"),
      player: localStorage.getItem("playerName"),
    }),
  })
    .then((res) => res.json())
    .then(() => {
      localStorage.removeItem("currentLobby");
      window.location.href = "/lobby";
    });
}

// Refresh player list every 3 seconds
setInterval(fetchLobby, 3000);
fetchLobby();
