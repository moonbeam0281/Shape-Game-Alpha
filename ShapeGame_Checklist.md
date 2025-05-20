# Shape Game Development Checklist ✅

## ✅ PROJECT STRUCTURE
- [x] Switched from JavaScript to **TypeScript**
- [x] Organized into folders: `src/classes/`, `src/handlers/`, `src/environment/`, `src/interface/`, `src/Maps/`, `src/Menu/`, `src/Players/`
- [x] Using Vite or Webpack for module bundling
- [x] Clean folder setup: everything modular and organized

## 🧱 INTERFACES
- [ ] `iUnitShape.ts` – shared interface for all unit shapes
- [ ] `iMap.ts` – interface for map structure

## 🧊 SHAPE CLASSES
- [ ] `Cube`, `Sphere`, `Pyramid`, `Octahedron`
- [ ] Implements `iUnitShape`
- [ ] Properties: position, angle, health, color, owner
- [ ] Implements: `generate()`, `destroy()`, `move()`

## 🗺️ MAP SYSTEM
- [ ] `MapHandler` loads maps dynamically
- [ ] `PlayFieldMap` as example
- [ ] Maps stored in `src/Maps/` and implement `iMap`
- [ ] Map includes floor mesh, lighting, background and boundaries

## 🔦 ENVIRONMENT & RENDERING
- [ ] `SceneHandler.ts` sets up Three.js scene
- [ ] `LightingHandler.ts` set up Ambient + directional light
- [ ] RTS style Camera with custom controls and bounds
- [ ] In-Game UI with minimap

## 🧍 PLAYER SYSTEM
- [x] `PlayerHandler` manages all players
- [x] Each player has: numeric ID, name, and state
- [ ] Use UUID for players to avoid same player name deletion
- [ ] Update player-service.ts to handle deletion and registry
- [ ] Optimise to delete players from memory when logging out and deleteing guest users from the database and memory

## 🧠 MEMORY AND DATABASE UPDATES
- [ ] Cleaning a player or lobby from memory once they leave or are deleted
- [ ] Delete guest accounts upon log-out or offline for a longer than X minutes

## 🛋️ LOBBY SYSTEM
- [ ] Auto-refresh the lobby list every X seconds (or preferbly WebSocket update)
- [ ] Show loading animation while fetching
- [ ] Prevent joining full lobbies
- [ ] Disable spectate if lobby doesn’t allow it
- [ ] Dynamically update the players within a lobby on the page
- [ ] Online Players tracker; Need to update the player system and database and implement refreshing the page update
- [ ] Add icons to players
- [ ] Lobby filtering

## LOBBY PAGE
- [x] `LobbyHandler` includes:
  - Lobby ID, name, max players, players array
  - Spectator flag
- [x] Kicks all players if owner leaves
- [x] Deletes empty lobbies
- [ ] Need to update lobbyHandlers to send a post game result to the Postgres database

## 🛠️ DEVELOPER PANEL
- [x] Hidden behind secret token
- [x] Reads from `.txt` file (Git-ignored)
- [x] Dev Panel appears only if key file exists
- [ ] List all players from DB and in Memory and delete/manage the DB

## 🖥️ FRONTEND SYSTEM
- [x] `index.html` for UI
- [x] Modals: Register, Lobby Creation
- [x] Displays player ID and name
- [x] Logout button → sets state to `offline`
- [x] Dev Panel visibility based on dev key
- [x] Update Lobby into a fully finished main menu
- [ ] Add a Player page for player info and stats
- [ ] Lobby UI needs updates and fixes and implement functionality

### 🔄 Backend API
- [x] Routes: `/createLobby`, `/joinLobby`, `/leaveLobby`, `/deleteLobby`
- [ ] Auto-handle player state transitions
- [ ] Lobby cleanup logic
- [ ] Player logout cleanup logic
- [ ] Maintain information when refreshing page and reloading the UI

# Plan for the gameplay and implementations of logic
### ⚙️ Shape Behaviors
- [ ] Add collision-based shape pushing
- [ ] Cube tilting on impact
- [ ] Map-boundary enforcement
- [ ] Glowing trail effect (optional)
- [ ] TO BE ADDED MORE:

### 🎮 Gameplay Logic
- [ ] Basic movement + attack commands
- [ ] Health/damage system
- [ ] Ownership per shape

### 🎮 Alternative Gameplay idea:
Create an engine or sepparte exe file that could be downloaded on the pc, mainmenu is on browser and upon starting the game players are re-directed into the game where it starts up.