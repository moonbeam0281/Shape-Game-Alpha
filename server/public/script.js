const storedName = localStorage.getItem('playerName');
const storedId = localStorage.getItem('playerId');
if (storedName && storedId) {
  document.getElementById('playerNameDisplay').textContent = storedName;
  document.getElementById('playerIdDisplay').textContent = storedId;
}


const API = 'http://localhost:3000';

function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  sendAuth('/register', { username, password });
  //Implement IF registry is good
  document.getElementById('registerModal').style.display = 'none';
}

function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  sendAuth('/login', { username, password });
}

function joinAsGuest() {
  fetch(`${API}/guest`, { method: 'POST' })
    .then(res => res.json())
    .then(handleLogin);
}

function sendAuth(endpoint, data) {
  fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {
    if (!result || !result.id || !result.name) return showError("Invalid response from server.");
    handleLogin(result);
  })
  .catch(() => showError("Server error."));
}


function showError(message) {
  const box = document.getElementById('errorBox');
  document.getElementById('errorMessage').textContent = message;
  box.style.display = 'block';
}

function hideError() {
  document.getElementById('errorBox').style.display = 'none';
}

function goToDevPanel() {
  window.location.href = 'devPanel.html';
}

function openRegisterModal() {
  document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
  document.getElementById('registerModal').style.display = 'none';
}


function handleLogin(user) {
  fetch(`${API}/dev-key-status`)
  .then(res => res.json())
  .then(data => {
    if (data.hasDevKey) {
      document.getElementById('devPanelLink').style.display = 'block';
    }
  });

  localStorage.setItem('playerId', user.id);
  localStorage.setItem('playerName', user.name); 

  document.getElementById('authSection').style.display = 'none';
  document.getElementById('gameSection').style.display = 'block';

  document.getElementById('playerNameDisplay').textContent = user.name;
  document.getElementById('playerIdDisplay').textContent = user.id;
}


function goToLobby() {
  window.location.href = 'lobby.html';
}
