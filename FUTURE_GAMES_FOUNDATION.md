# Future Games Foundation

This file is the main guardrail for adding or modifying games in LAN Game Hub.

Use it as the source of truth for future implementation work, especially when using a weaker or offline AI model.

## What LAN Game Hub Is

LAN Game Hub is a multiplayer LAN platform with:

- one reusable room system
- one reusable lobby flow
- one active game session per room
- backend-authoritative realtime updates
- frontend rendering by `gameId`

It is **not** a single-game app.

`Connect 4` is only the first reference game.

## Non-Negotiable Rules

### 1. Shared systems must stay generic

Do not put game-specific logic inside:

- `room.service`
- generic socket handler flow
- generic room types
- shared frontend room logic

### 2. Backend is always authoritative

Frontend may:

- show state
- show controls
- send user intent

Backend must own:

- whether an action is allowed
- turn order
- scoring
- win/draw logic
- phase transitions
- round transitions
- replay rules

### 3. Each game must be isolated

Each game should be mostly self-contained.

Backend:

```text
server/src/games/<game-id>/
  <game-id>.types.ts
  <game-id>.logic.ts
  <game-id>.game.ts
```

Frontend:

```text
client/src/components/games/<game-id>/
  <GameName>View.tsx
```

### 4. Room state must not assume one game style

The room should only know:

- selected game
- whether the room is in lobby or in-game
- active `gameSession`

The room should not know:

- board rules
- hidden-role rules
- trivia timing logic
- per-game scoring rules

### 5. Public and private state must be designed explicitly

For some future games, not every player should see the same data.

Examples:

- `Would You Rather`: likely mostly public after reveal
- `Imposter`: private role assignment
- `Trivia`: answer secrecy before reveal

If a game may require private state later, design for it early.

## Current Backend Contract

Reference:

- [game.types.ts](/c:/Users/ariel/projects/lan-game-hub/server/src/games/game.types.ts)
- [game.service.ts](/c:/Users/ariel/projects/lan-game-hub/server/src/games/game.service.ts)

Each game currently provides:

- metadata
- optional `getPlayerCount`
- optional `canStart`
- `createInitialState`
- `getPublicState`
- `handleAction`

## Required Design Process For Every New Game

Before writing code, answer these questions.

### 1. Game shape

- How many players?
- Is it turn-based, simultaneous, phase-based, or real-time?
- Is information public or private?
- Is the game one round or many rounds per session?
- Is scoring per round or across rounds?
- Does the host have setup powers?

### 2. Session lifecycle

- What data is chosen before start?
- What is the initial state?
- What are the phases?
- What player actions can happen in each phase?
- What ends a round?
- What ends a session?
- What does replay mean?

### 3. Validation rules

- Which players are allowed to act?
- When are actions invalid?
- What errors should be returned?
- Can spectators watch?
- What happens if players leave mid-game?

### 4. Public-state rules

- What can every player see?
- What must be hidden?
- What might need per-player rendering later?

## Implementation Order

Always follow this order.

1. Define game concept and constraints
2. Define TypeScript state and action types
3. Define state transitions on paper
4. Implement backend logic helpers
5. Implement backend game module
6. Register game in registry
7. Add frontend renderer
8. Add frontend shell routing by `gameId`
9. Test invalid actions
10. Test replay/return-to-lobby behavior

## State Design Rules

### Prefer explicit phase fields

Good:

- `phase: 'setup' | 'answering' | 'reveal' | 'finished'`

Avoid:

- many boolean flags that conflict with each other

### Prefer normalized identity references

Good:

- `currentTurnPlayerId`
- `activePlayerIds`
- `scores: Record<string, number>`

Avoid:

- duplicating full player objects inside game state

### Keep state serializable and simple

State should be plain JSON-like data.

Avoid:

- classes
- methods inside state
- non-serializable objects

## Action Design Rules

Each player action should:

- have a clear `type`
- have a minimal payload
- be validated fully on the backend

Good:

```ts
{ type: 'SUBMIT_ANSWER', payload: { choiceId: 'left' } }
```

Avoid:

- sending derived values the backend should compute
- trusting the client to decide winners or scores

## Frontend Design Rules

### Use one game root view per game

Examples:

- `Connect4View`
- `WouldYouRatherView`
- `ImposterView`

### Game view responsibilities

The game view should:

- read current public game state
- determine what the current player is allowed to do
- call `onGameAction`
- render status and game controls

It should not:

- own the actual game rules
- decide whether a move is legal

## UI Style Rules

### 1. The game itself should be the focus

Do not make the page feel like an admin dashboard.

### 2. Keep the top HUD compact

Use a slim game bar or compact header for:

- player identities
- turn/status
- score
- host actions

Avoid large stacked cards unless the game truly needs them.

### 3. Match the interaction model

Examples:

- board games: board is the main visual focus
- social games: prompt and answer controls are the focus
- hidden-role games: phase/status clarity is more important than a board

### 4. Keep action affordances obvious

- if a whole column is clickable, make the whole column feel clickable
- if answers are simultaneous, make answer submission status obvious
- if only the host can proceed, label it clearly

## Common Mistakes To Avoid

- putting game rules into room service
- adding generic room fields that only one game needs
- trusting frontend validation
- forgetting hidden/private state needs
- over-coupling frontend to one game layout
- using too many booleans instead of a phase machine
- implementing visuals before finishing state transitions

## Reference Implementation

Current backend reference:

- [connect4.game.ts](/c:/Users/ariel/projects/lan-game-hub/server/src/games/connect4/connect4.game.ts)

Current frontend reference:

- [Connect4View.tsx](/c:/Users/ariel/projects/lan-game-hub/client/src/components/games/connect4/Connect4View.tsx)

Use Connect 4 as a reference for:

- game registration
- game session flow
- backend action handling
- frontend game rendering hookup

Do **not** copy Connect 4 assumptions into other games.

