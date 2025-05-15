const API = 'http://localhost:3000';
const playerName = localStorage.getItem('playerName');
const lobbyId = localStorage.getItem('currentLobby');

document.getElementById('playerNameDisplay').textContent = playerName;
document.getElementById('lobbyIdDisplay').textContent = lobbyId;

if (!lobbyId || !playerName) {
  alert("Missing lobby or player info. Redirecting...");
  window.location.href = 'lobby.html';
}

async function fetchLobby() {
  const res = await fetch(`${API}/lobbies`);
  const lobbies = await res.json();

  const lobbyId = parseInt(localStorage.getItem('currentLobby'));
  const playerName = localStorage.getItem('playerName');
  const lobby = lobbies.find(l => l.id === lobbyId);

  const list = document.getElementById('playerList');
  list.innerHTML = '';

  if (!lobby) {
    showError("Lobby no longer exists.");
    localStorage.removeItem('currentLobby');
    setTimeout(() => window.location.href = 'lobby.html', 1000);
    return;
  }
  
  if (!lobby.players.includes(playerName) && lobby.owner !== playerName) {
    showError("You are no longer in this lobby.");
    localStorage.removeItem('currentLobby');
    setTimeout(() => window.location.href = 'lobby.html', 1000);
    return;
  }

  lobby.players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    list.appendChild(li);
  });

  const isOwner = lobby.owner === playerName;
  document.getElementById('ownerControls').style.display = isOwner ? 'block' : 'none';
}


function startGame() {
  fetch(`${API}/start-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lobbyId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) alert(data.error);
    else {
      alert("Game started!");
      // Replace with actual redirect to game page later
    }
  });
}

function leaveLobby() {
  fetch(`${API}/leave-lobby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lobbyId: localStorage.getItem('currentLobby'),
      player: localStorage.getItem('playerName')
    })
  })
  .then(res => res.json())
  .then(() => {
    localStorage.removeItem('currentLobby');
    window.location.href = 'lobby.html';
  });
}


// Refresh player list every 3 seconds
setInterval(fetchLobby, 3000);
fetchLobby();
