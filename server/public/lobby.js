const API = 'http://localhost:3000';
const playerId = localStorage.getItem('playerId');
const playerName = localStorage.getItem('playerName');

if (!playerId || !playerName) {
  alert("You must be logged in!");
  window.location.href = "index.html";
}

document.getElementById('playerNameDisplay').textContent = playerName;
document.getElementById('playerIdDisplay').textContent = playerId;

async function createLobby() {
  const res = await fetch(`${API}/create-lobby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner: playerName })
  });
  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    localStorage.setItem('currentLobby', data.id); // 🗺️ Store current lobby
    window.location.href = 'currentLobby.html';    // 🧭 Redirect
  }
}

function openModal() {
  document.getElementById('createLobbyModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('createLobbyModal').style.display = 'none';
}

async function confirmCreateLobby() {
  let name = document.getElementById('lobbyNameInput').value.trim();
  const maxPlayers = parseInt(document.getElementById('maxPlayersInput').value);
  const allowSpectators = document.getElementById('allowSpectatorsInput').checked;

  // ✅ Default to "PlayerName's lobby" if name is blank
  if (!name) {
    name = `${playerName}'s lobby`;
  }

  if (isNaN(maxPlayers) || maxPlayers < 2) {
    showError("Max players must be at least 2.");
    return;
  }

  const res = await fetch(`${API}/create-lobby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: playerName,
      name,
      maxPlayers,
      allowSpectators
    })
  });

  const data = await res.json();

  if (data.error) {
    showError(data.error);
  } else {
    localStorage.setItem('currentLobby', data.id);
    window.location.href = 'currentLobby.html';
  }
}



async function loadLobbies() {
  const res = await fetch(`${API}/lobbies`);
  const lobbies = await res.json();
  const list = document.getElementById('lobbyList');
  list.innerHTML = '';

  if (lobbies.length === 0) {
    list.innerHTML = '<p>No open lobbies found.</p>';
    return;
  }

  lobbies.forEach(lobby => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${lobby.id}</strong> — Players: ${lobby.players.length}
      <button onclick="joinLobby('${lobby.id}')">Join</button>
    `;
    list.appendChild(div);
  });
}

function logout() {
  fetch(`${API}/set-player-state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: localStorage.getItem('playerName'),
      state: 'offline'
    })
  }).then(() => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
}


async function joinLobby(lobbyId) {
  const res = await fetch(`${API}/join-lobby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lobbyId, player: playerName })
  });
  const data = await res.json();
  if (data.error) {
    alert(data.error);
  } else {
    alert(`Joined lobby: ${data.id}`);
    localStorage.setItem('currentLobby', data.id); // 🌟 Store lobby
    window.location.href = 'currentLobby.html';     // 🌟 Redirect
  }
}
