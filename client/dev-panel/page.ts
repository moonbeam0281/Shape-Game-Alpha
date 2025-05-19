import { userInfo } from "os";
import PlayerService from "../../server/services/player-service";
import { API, getInputValue, showError } from "../common/script";

const captain = localStorage.getItem("playerName");

{
  const captainDisplayElement = document.getElementById("captainDisplay");

  if (captainDisplayElement) {
    captainDisplayElement.textContent = captain;
  }
}

fetch(`${API}/is-dev`)
  .then((res) => res.json())
  .then((data) => {
    if (!data.isDev) {
      alert("Access denied, matey.");
      window.location.href = "/";
    }
  });

export async function fetchLobbies() {
  const res = await fetch(`${API}/lobbies`);
  const lobbies: {
    id: number;
    name: string;
    owner: string;
    players: string[];
    maxPlayers: number;
  }[] = await res.json();
  const container = document.getElementById("lobbyList");

  if (container) {
    container.innerHTML = "";
  }

  lobbies.forEach((lobby) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${lobby.name}</strong> (ID: ${lobby.id})<br>
      Owner: ${lobby.owner}, Players: ${lobby.players.length}/${lobby.maxPlayers}
      <br>
      <button onclick="deleteLobby(${lobby.id})">❌ Delete</button>
      <hr>
    `;

    if (container) {
      container.appendChild(div);
    }
  });
}

export async function fetchPlayers() {
  try {
    const res = await fetch(`${API}/players`);

    // Safe check for 200 OK
    if (!res.ok) throw new Error("Failed to fetch players");

    const players: { id: number; name: string; state: string }[] =
      await res.json();
    const container = document.getElementById("playerList");

    if (container) {
      container.innerHTML = "";
    }

    players.forEach((player) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${player.name}</strong> (ID: ${player.id}) — ${player.state}
        <button onclick="openJoinModal('${player.name}')">➕ Join Lobby</button>
        <button onclick="deletePlayer('${player.name}')">❌ Delete</button>
        <hr>
      `;
      if (container) {
        container.appendChild(div);
      }
    });
  } catch (err: any) {
    console.error("Fetch error:", err.message);
    showError("Could not load players. Check server console.");
  }
}

export async function createTestLobby() {
  const res = await fetch(`${API}/create-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: captain,
      name: `Test Lobby ${Date.now()}`,
      maxPlayers: 4,
      allowSpectators: true,
    }),
  });

  const data = await res.json();
  fetchLobbies();
}

export async function createPlayer() {
  const name = getInputValue("newPlayerName");
  const password = getInputValue("newPlayerPass");

  if (!name || !password) return alert("Fill in both fields!");

  const res = await fetch(`${API}/create-player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: name, password }),
  });

  const result = await res.json();
  fetchPlayers();
}

export async function deletePlayer(username: string) {
  const res = await fetch(`${API}/delete-player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  fetchPlayers();
}

export async function deleteLobby(id: number) {
  const res = await fetch(`${API}/delete-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lobbyId: id }),
  });

  const result = await res.json();
  fetchLobbies();
}

export async function fetchFullState() {
  const res = await fetch(`${API}/debug-state`);
  const state = await res.json();

  const fullStateDumpElement = document.getElementById("fullStateDump");
  if (fullStateDumpElement) {
    fullStateDumpElement.textContent = JSON.stringify(state, null, 2);
  } 
}

export async function fetchDbState() {
  const res = await fetch(`${API}/get-all-players-db`);
  const players: {username: string, id: number, password: string, guest: boolean}[] 
    = await res.json();

  const container = document.getElementById('fullStateDumpDb');
  if (container) {
    container.innerHTML = "";
  }

  players.forEach((player) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${player.username}</strong> (ID: ${player.id}) — ${player.guest? "Guest" : "Registered"}
        <button onclick="deletePlayer('${player.username}')">❌ Delete</button>
        <hr>
      `;
      if (container) {
        container.appendChild(div);
      }
    });

}

//Modal Handlers:
export function openJoinModal(playerName: string) {
  const modalPlayerElement = document.getElementById(
    "modalPlayer"
  ) as HTMLInputElement | null;

  if (modalPlayerElement) {
    modalPlayerElement.value = playerName;
  }
  const select = document.getElementById("modalLobbySelect");
  if (select) {
    select.innerHTML = "";
  }
  fetch(`${API}/lobbies`)
    .then((res) => res.json() as Promise<{ id: number; name: string }[]>)
    .then((lobbies) => {
      lobbies.forEach((lobby) => {
        const option = document.createElement("option");
        option.value = lobby.id.toString();
        option.textContent = `${lobby.name} (ID: ${lobby.id})`;

        if (select) {
          select.appendChild(option);
        }
      });

      const joinModalElement = document.getElementById("joinModal");

      if (joinModalElement) {
        joinModalElement.style.display = "flex";
      }
    });
}

export function closeJoinModal() {
  const joinModalElement = document.getElementById("joinModal");

  if (joinModalElement) {
    joinModalElement.style.display = "none";
  }
}

export function goToMainMenu() {
  window.location.href = "/lobby";
}

export async function confirmJoin() {
  const player = getInputValue("modalPlayer");
  const lobbyId = getInputValue("modalLobbySelect");

  const res = await fetch(`${API}/join-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lobbyId, player }),
  });

  const result = await res.json();
  if (result.error) alert(result.error);
  else {
    closeJoinModal();
    fetchLobbies();
  }
}
