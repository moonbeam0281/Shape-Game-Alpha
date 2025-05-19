{
  const storedName = localStorage.getItem("playerName");
  const storedId = localStorage.getItem("playerId");

  if (storedName && storedId) {
    const playerNameDisplayElement =
      document.getElementById("playerNameDisplay");
    const playerIdDisplayElement = document.getElementById("playerIdDisplay");

    if (playerNameDisplayElement) {
      playerNameDisplayElement.textContent = storedName;
    }

    if (playerIdDisplayElement) {
      playerIdDisplayElement.textContent = storedId;
    }
  }
}

export const API = "http://localhost:3000";

export function getInputValue(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return "";
  }
  if ("value" in element) {
    if (typeof element.value === "string") {
      return element.value;
    } else if (typeof element.value !== "undefined" && element.value !== null) {
      return element.value.toString();
    }
  }
  return "";
}

export function getCheckboxValue(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return false;
  }
  if ("checked" in element) {
    if (typeof element.checked === "boolean") {
      return element.checked;
    }
  }
  return false;
}

export function register() {
  const username = getInputValue("registerUsername");
  const password = getInputValue("registerPassword");
  sendAuth("/register", { username, password });

  const registerModalElement = document.getElementById("registerModal");

  if (registerModalElement) {
    registerModalElement.style.display = "none";
  }
}

export function login() {
  const username = getInputValue("loginUsername");
  const password = getInputValue("loginPassword");
  sendAuth("/login", { username, password });
}

export function joinAsGuest() {
  fetch(`${API}/guest`, { method: "POST" })
    .then((res) => res.json())
    .then(handleLogin);
}

export function sendAuth<T>(endpoint: string, data: T) {
  fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      if (!result || !result.id || !result.name)
        return showError(result.message);
      handleLogin(result);
    })
    .catch(() => showError("Server error."));
}

export function showError(message: string) {
  const errorMessageElement = document.getElementById("errorMessage");

  if (errorMessageElement) {
    errorMessageElement.textContent = message;
  }

  const errorBoxElement = document.getElementById("errorBox");
  if (errorBoxElement) {
    errorBoxElement.style.display = "block";
  }
}

export function hideError() {
  const errorBoxElement = document.getElementById("errorBox");
  if (errorBoxElement) {
    errorBoxElement.style.display = "none";
  }
}

export function goToDevPanel() {
  window.location.href = "/dev-panel";
}

export function openRegisterModal() {
  const registerModalElement = document.getElementById("registerModal");

  if (registerModalElement) {
    registerModalElement.style.display = "flex";
  }
}

export function closeRegisterModal() {
  const registerModalElement = document.getElementById("registerModal");

  if (registerModalElement) {
    registerModalElement.style.display = "none";
  }
}

export function handleLogin(user: { id: string; name: string }) {
  fetch(`${API}/dev-key-status`)
    .then((res) => res.json())
    .then((data) => {
      if (data.hasDevKey) {
        const devPanelLinkElement = document.getElementById("devPanelLink");
        if (devPanelLinkElement) {
          devPanelLinkElement.style.display = "block";
        }
      }
    });

  localStorage.setItem("playerId", user.id);
  localStorage.setItem("playerName", user.name);

  const authSectionElement = document.getElementById("authSection");
  const gameSectionElement = document.getElementById("gameSection");
  const playerNameDisplayElement = document.getElementById("playerNameDisplay");
  const playerIdDisplayElement = document.getElementById("playerIdDisplay");

  if (authSectionElement) {
    authSectionElement.style.display = "none";
  }

  if (gameSectionElement) {
    gameSectionElement.style.display = "block";
  }

  if (playerNameDisplayElement) {
    playerNameDisplayElement.textContent = user.name;
  }

  if (playerIdDisplayElement) {
    playerIdDisplayElement.textContent = user.id;
  }
}

export function goToLobby() {
  window.location.href = "/lobby";
}
