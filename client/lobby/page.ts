import {
  API,
  getCheckboxValue,
  getInputValue,
  showError,
} from "../common/script";

const playerName = localStorage.getItem("playerName");

{
  const playerId = localStorage.getItem("playerId");

  if (!playerId || !playerName) {
    alert("You must be logged in!");
    window.location.href = "/";
  }

  const playerNameDisplayElement = document.getElementById("playerNameDisplay");
  const playerIdDisplayElement = document.getElementById("playerIdDisplay");

  if (playerNameDisplayElement) {
    playerNameDisplayElement.textContent = playerName;
  }

  if (playerIdDisplayElement) {
    playerIdDisplayElement.textContent = playerId;
  }
}

export async function createLobby() {
  const res = await fetch(`${API}/create-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner: playerName }),
  });
  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    localStorage.setItem("currentLobby", data.id); // 🗺️ Store current lobby
    window.location.href = "/current-lobby"; // 🧭 Redirect
  }
}

export function openModal() {
  const createLobbyModalElement = document.getElementById("createLobbyModal");
  if (createLobbyModalElement) {
    createLobbyModalElement.style.display = "flex";
  }
}

export function closeModal() {
  const createLobbyModalElement = document.getElementById("createLobbyModal");
  if (createLobbyModalElement) {
    createLobbyModalElement.style.display = "none";
  }
}

export async function confirmCreateLobby() {
  let name = getInputValue("lobbyNameInput").trim();
  const maxPlayers = parseInt(getInputValue("maxPlayersInput"));
  const allowSpectators = getCheckboxValue("allowSpectatorsInput");

  // ✅ Default to "PlayerName's lobby" if name is blank
  if (!name) {
    name = `${playerName}'s lobby`;
  }

  if (isNaN(maxPlayers) || maxPlayers < 2) {
    showError("Max players must be at least 2.");
    return;
  }

  const res = await fetch(`${API}/create-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: playerName,
      name,
      maxPlayers,
      allowSpectators,
    }),
  });

  const data = await res.json();

  if (data.error) {
    showError(data.error);
  } else {
    localStorage.setItem("currentLobby", data.id);
    window.location.href = "/current-lobby";
  }
}

export async function loadLobbies() {
  const res = await fetch(`${API}/lobbies`);
  const lobbies: { id: number; players: string }[] = await res.json();
  const list = document.getElementById("lobbyList");
  if (list) {
    list.innerHTML = "";
  }
  if (lobbies.length === 0) {
    if (list) {
      list.innerHTML = "<p>No open lobbies found.</p>";
    }
    return;
  }

  lobbies.forEach((lobby) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${lobby.id}</strong> — Players: ${lobby.players.length}
      <button onclick="joinLobby('${lobby.id}')">Join</button>
    `;

    if (list) {
      list.appendChild(div);
    }
  });
}

export function logout() {
  fetch(`${API}/set-player-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: localStorage.getItem("playerName"),
      state: "offline",
    }),
  }).then(() => {
    localStorage.clear();
    window.location.href = "/";
  });
}

export async function joinLobby(lobbyId: number) {
  const res = await fetch(`${API}/join-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lobbyId, player: playerName }),
  });
  const data = await res.json();
  if (data.error) {
    alert(data.error);
  } else {
    alert(`Joined lobby: ${data.id}`);
    localStorage.setItem("currentLobby", data.id); // 🌟 Store lobby
    window.location.href = "/current-lobby"; // 🌟 Redirect
  }
}
