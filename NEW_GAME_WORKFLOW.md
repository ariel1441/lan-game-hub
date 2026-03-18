# New Game Workflow

Use this file when planning or implementing a new game, especially from phone-only sessions.

Primary source of ideas:

- [LAN_Game_Hub_Game_Ideas.md](./LAN_Game_Hub_Game_Ideas.md)

## Goal

Add new games in a way that fits the existing multigame architecture with minimal system-wide changes.

## Step 1: Choose The Game Type

For each new game, identify:

- player count
- turn-based or simultaneous
- hidden/private info or fully public
- round-based or continuous
- whether the host has special control
- win condition
- whether spectators are allowed

## Step 2: Fill Out The Spec

Copy this template into a new chat or GitHub issue.

```md
Game name:

Short concept:

Why this game is a good fit for LAN Game Hub:

Player count:

Interaction model:
- turn-based / simultaneous / real-time / prompt-based

Privacy model:
- fully public / partially private / secret roles

Game phases:

How a round starts:

What actions players can send:

What the backend must validate:

How a round ends:

How replay works:

What the frontend needs to render:

Edge cases:
```

## Step 3: Ask ChatGPT For The Design

Recommended prompt:

```text
This repository is a LAN multiplayer game hub, not a single-game app.

Important rules:
- keep the architecture multigame-first
- backend is authoritative
- each game must be isolated in its own module
- do not leak game-specific logic into shared room/game infrastructure
- frontend renders by gameId

Please design the game "<GAME_NAME>" for this repo.

Use this structure:
1. gameplay summary
2. backend state shape
3. action/event design
4. backend validation rules
5. public vs private state rules
6. frontend renderer structure
7. file-by-file implementation plan
8. test checklist
```

## Step 4: Expected Backend File Shape

New backend game module:

```text
server/src/games/<game-id>/
  <game-id>.types.ts
  <game-id>.logic.ts
  <game-id>.game.ts
```

Then register it in:

- `server/src/games/game.registry.ts`

## Step 5: Expected Frontend File Shape

New frontend renderer:

```text
client/src/components/games/<game-id>/
  <GameName>View.tsx
```

Then connect it in:

- `client/src/components/games/GameShell.tsx`

## Step 6: Minimum Acceptance Checklist

Before calling a new game "integrated", verify:

- it starts through the generic game flow
- it stores state in `room.gameSession`
- it renders via `gameId`
- invalid actions are rejected server-side
- it works with room updates over Socket.IO
- returning to lobby still works

## Step 7: Phone-Friendly Workflow

When working from phone:

1. open the GitHub issue for the game
2. open `PROJECT_BRIEF.md`
3. paste the game spec into ChatGPT
4. ask for a file-by-file plan
5. ask for exact code changes
6. apply the changes in `github.dev` or Codespaces
7. push the branch
8. check GitHub Actions results

## Notes On Good Next Games

### Best next game

`Would You Rather`

Why:

- validates simultaneous answers
- validates round-based multiplayer without board logic
- very different from Connect 4

### Strong later validations

- `Imposter`
- `Trivia`
- `Mastermind`

