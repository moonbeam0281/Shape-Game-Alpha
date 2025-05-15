const API = 'http://localhost:3000';
const captain = localStorage.getItem('playerName');
document.getElementById('captainDisplay').textContent = captain;

fetch(`${API}/is-dev`)
  .then(res => res.json())
  .then(data => {
    if (!data.isDev) {
      alert("Access denied, matey.");
      window.location.href = "index.html";
    }
  });


async function fetchLobbies() {
    const res = await fetch(`${API}/lobbies`);
    const lobbies = await res.json();
    const container = document.getElementById('lobbyList');
    container.innerHTML = '';

    lobbies.forEach(lobby => {
        const div = document.createElement('div');
        div.innerHTML = `
      <strong>${lobby.name}</strong> (ID: ${lobby.id})<br>
      Owner: ${lobby.owner}, Players: ${lobby.players.length}/${lobby.maxPlayers}
      <br>
      <button onclick="deleteLobby(${lobby.id})">❌ Delete</button>
      <hr>
    `;
        container.appendChild(div);
    });
}

async function fetchPlayers() {
  try {
    const res = await fetch(`${API}/players`);

    // Safe check for 200 OK
    if (!res.ok) throw new Error("Failed to fetch players");

    const players = await res.json();
    const container = document.getElementById('playerList');
    container.innerHTML = '';

    players.forEach(player => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${player.name}</strong> (ID: ${player.id}) — ${player.state}
        <button onclick="openJoinModal('${player.name}')">➕ Join Lobby</button>
        <button onclick="deletePlayer('${player.name}')">❌ Delete</button>
        <hr>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Fetch error:", err.message);
    showError("Could not load players. Check server console.");
  }
}


async function createTestLobby() {
    const res = await fetch(`${API}/create-lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            owner: captain,
            name: `Test Lobby ${Date.now()}`,
            maxPlayers: 4,
            allowSpectators: true
        })
    });

    const data = await res.json();
    fetchLobbies();
}

async function createPlayer() {
    const name = document.getElementById('newPlayerName').value;
    const password = document.getElementById('newPlayerPass').value;

    if (!name || !password) return alert("Fill in both fields!");

    const res = await fetch(`${API}/create-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password })
    });

    const result = await res.json();
    fetchPlayers();
}

async function deletePlayer(username) {
    const res = await fetch(`${API}/delete-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });
    fetchPlayers();
}

async function deleteLobby(id) {
    const res = await fetch(`${API}/delete-lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyId: id })
    });

    const result = await res.json();
    fetchLobbies();
}

async function fetchFullState() {
  const res = await fetch(`${API}/debug-state`);
  const state = await res.json();
  document.getElementById('fullStateDump').textContent = JSON.stringify(state, null, 2);
}


//Modal Handlers:
function openJoinModal(playerName) {
    document.getElementById('modalPlayer').value = playerName;
    const select = document.getElementById('modalLobbySelect');
    select.innerHTML = '';

    fetch(`${API}/lobbies`)
        .then(res => res.json())
        .then(lobbies => {
            lobbies.forEach(lobby => {
                const option = document.createElement('option');
                option.value = lobby.id;
                option.textContent = `${lobby.name} (ID: ${lobby.id})`;
                select.appendChild(option);
            });

            document.getElementById('joinModal').style.display = 'flex';
        });
}

function closeJoinModal() {
    document.getElementById('joinModal').style.display = 'none';
}

function goToMainMenu(){
    window.location.href = 'lobby.html';
}

async function confirmJoin() {
    const player = document.getElementById('modalPlayer').value;
    const lobbyId = document.getElementById('modalLobbySelect').value;

    const res = await fetch(`${API}/join-lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyId, player })
    });

    const result = await res.json();
    if (result.error) alert(result.error);
    else {
        closeJoinModal();
        fetchLobbies();
    }
}

