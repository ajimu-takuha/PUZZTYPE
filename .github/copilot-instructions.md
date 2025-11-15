# PUZZTYPE Copilot Instructions

## Project Overview
**PUZZTYPE** is a real-time multiplayer typing battle game featuring:
- Competitive typing gameplay against other players or CPU opponents
- Japanese and English language modes (using wanakana library for romaji conversion)
- Socket.IO for real-time synchronization
- Grid-based game field mechanics (10×20 grid) similar to Tetris

## Architecture

### Backend (Node.js + Express + Socket.IO)
- **server.js**: Handles all socket.io connections and game synchronization
- **Core Data Structures**:
  - `rooms` (Map): Active game rooms with player references and game state
  - `roomMatches` (Map): Room-based matchmaking queue
  - `waitingPlayer`: Variable tracking players in matchmaking queue
- **Matchmaking**: Two modes:
  1. **Auto-match** (`findMatch`): Pairs consecutive players
  2. **Room-match** (`joinRoom`): Players join specific room numbers

### Frontend (Vanilla JS + Canvas)
- **main.js** (5763 lines): Primary game logic, rendering, and socket event handlers
- **globals.js**: Game state constants (FIELD_WIDTH=10, FIELD_HEIGHT=20)
- **player.js**: Keyboard input handling for CPU matches
- **cpu.js**: CPU opponent AI with 10 difficulty levels + custom settings
- **arcEffect.js**: Visual effects and animations
- **movie.js**: Video playback overlay system
- **index.html**: HTML structure with preloaded fonts (5 custom fonts)

## Critical Game Mechanics

### Real-Time Synchronization Pattern
Game state is synchronized via Socket.IO with this pattern:
```javascript
// Client sends local state:
socket.emit('fieldUpdate', { playerField, playerFieldWords });

// Server relays to opponent:
targetSocket.emit('fieldSync', data);

// Client receives and renders:
socket.on('fieldSync', (data) => { /* update and redraw */ });
```

**Key synchronized events**:
- `fieldUpdate/fieldSync`: Game grid state
- `attack/receiveAttack`: Damage info with attack value
- `attackShake`: Visual feedback intensity
- `inputUpdate/inputSync`: Current typed input
- `statusFieldUpdate/statusFieldSync`: Status bar state
- `sendChainInfo/updateChainInfo`: Chain multiplier data

### Game Grid System
- **playerField**: 20×10 2D array representing game grid
- **playerFieldWords**: Array tracking word objects in player's grid
- Each grid cell contains: `{ character, state, gradient, ...}`
- Words are placed dynamically when typing completes

### Attack/Damage System
- **playerAttackValue**: Accumulated attack power from cleared words
- **playerReceiveValueToOffset**: Queue of incoming damage to process
- Offsets render as incoming "attack blocks" pushing from bottom
- Attack values cleared → damage sent → opponent receives blocks

### Chain System
Bonuses triggered by word placement patterns:
- `isWordChain`: Consecutive word clears (multiplier bonus)
- `isUpChain` / `isDownChain`: Vertical consecutive matches
- `isSameChar`: Placing words using same character
- `chainBonus`: Accumulated multiplier (applied to next attack)

### Nerf System
- **nerfValue**: Penalty for invalid inputs or failed word matches
- CPU has parallel `CPUnerfValue`
- Applied as attack reduction when sending damage

## Language & Input Handling

### Japanese Mode
- Uses **wanakana.js** library (loaded from CDN)
- Input: Romaji text → converted to Hiragana
- Conversion: `wanakana.toHiragana(playerInput)`
- Handled in `player.js` keydown listener

### English Mode
- Direct character matching (a-z, hyphen support)
- Backspace/Delete for corrections
- No conversion step

## CPU Opponent (`cpu.js`)

### Architecture
- Runs in same thread; no Web Worker
- Uses game state variables prefixed with `CPU` (e.g., `CPUattackValue`, `CPUlastChar`)
- Self-contained field rendering to separate canvas context

### Difficulty Levels (10 preset + custom)
Each level configures:
- `speed`: Input rate multiplier (1.5–12)
- `miss`: Miss probability (0–5)
- `missWait`: Pause duration after miss (0–2s)
- `selectWordTime`: Delay before word selection (0.5–1s)

### Example: Level 5
```javascript
{ speed: 5, miss: 3, missWait: 2, selectWordTime: 0.5 }
```

## Development Workflows

### Starting the Server
```bash
npm install
npm start  # Runs: node server.js
```
Server listens on port 3000 (configurable in allowed origins array).

### Keep-Alive Mechanism
Server pings itself every 13 minutes to prevent Render idle shutdown:
```javascript
setInterval(keepAlive, 13 * 60 * 1000);
```

### Build Configuration
- **Node.js**: 22.12.0 (specified in package.json)
- **Dependencies**: cors, express, socket.io
- **Deployment**: Render (see CORS origin list for allowed domains)

## Code Patterns & Conventions

### Game Loop Pattern
```javascript
// Periodic game step triggered by word addition or interval
clearTimeout(CPUgameStepTimeoutId);
CPUgameStepTimeoutId = setTimeout(CPUgameStep, gameStepInterval);
```

### State Update & Sync
1. Update local state (field, attack, etc.)
2. Emit socket event to server
3. Server broadcasts to opponent
4. Opponent receives and re-renders

### Sound Management
- `soundManager` singleton handles all audio
- Button sounds: `buttonHover`, `buttonClick`
- Type sounds: `type1`–`type8`
- Game sounds: `addFieldWord`, `receiveAttack`, `Consecutive Battle`

### Configuration System
Four main settings (saved, persistent):
- **mode**: JAPANESE / ENGLISH
- **style**: Visual theme (5+ variants)
- **interval**: Game speed (NORMAL / SUDDEN DEATH / PEACEFUL / NOTHING)
- **font**: Character font selection

## Socket.IO Event Categories

### Matchmaking
- `findMatch`, `cancelMatch` → `waitingForPlayer`, `matchCancelled`
- `joinRoom`, `cancelRoomMatch` → `roomJoined`, `invalidRoom`

### Gameplay Sync
- `fieldUpdate` → `fieldSync`
- `attack` → `receiveAttack`
- `syncAttackValue` → `receiveAttackValue`
- `attackShake` → `receiveAttackShake`

### Multiplayer Features
- `syncStyleName` → `updateStyleName`
- `sendChainInfo` → `updateChainInfo`
- `syncTechnicianAttack` → `receiveTechnicianAttack`

### Game End
- `gameOver` (with loserId) → relayed to opponent
- `retryResponse` (acknowledgment) → broadcast to room

## File Structure Reference
```
public/
  main.js          # Core game loop, socket handlers (5763 lines)
  player.js        # Input handling for CPU mode (1152 lines)
  cpu.js           # CPU AI logic (1863 lines)
  globals.js       # Game state constants (189 lines)
  index.html       # UI structure with config dialogs
  style.css        # Visual styling
  words.json       # Word pool for language modes
  arcEffect.js     # Particle/animation effects
  movie.js         # Tutorial video overlay (161 lines)
server.js          # Socket.IO server (632 lines)
```

## Debugging Tips
- **Socket.io Logs**: Check browser DevTools Network tab for WebSocket frames
- **Game State**: Use console to inspect `playerField`, `playerAttackValue`
- **CPU Match**: Has separate state variables prefixed `CPU*`
- **Sync Issues**: Check if both player's `currentRoom` matches
- **Render Bugs**: Clear canvas context before redraw (check `arcEffect.js` context usage)
