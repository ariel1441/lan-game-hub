# LAN Game Hub --- Full Project Specification

## Overview

LAN Game Hub is a **local multiplayer game platform** designed to run
entirely within a shared local network (LAN), without requiring internet
access.

This project is not a single game. It is a **multigame system** where: -
one user hosts a room - multiple users join from their own devices - the
host selects a game - all players participate in real-time

The system is designed to be **extensible, modular, and reusable**,
allowing new games to be added with minimal changes.

------------------------------------------------------------------------

## Core Goals

-   Real-time multiplayer over LAN
-   Clean room/lobby system
-   Support multiple different game types
-   Modular game architecture
-   Backend-driven game logic (authoritative server)

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS

### Backend

-   Node.js
-   Express
-   Socket.IO
-   TypeScript

### State

-   In-memory (no DB yet)

------------------------------------------------------------------------

## How It Works

1.  Host creates a room
2.  Room code is generated
3.  Players join using that code
4.  Lobby syncs in real-time
5.  Host selects a game
6.  Game session starts
7.  All clients switch to game view
8.  Game logic runs on backend
9.  Replay or return to lobby

------------------------------------------------------------------------

## Core Concepts

### Room

Contains: - players - host - status (lobby / in_game) - selected game -
game session

### Lobby

Waiting area before game starts.

### Game Session

Active game instance tied to a room.

------------------------------------------------------------------------

## Architecture Principles

### 1. Multigame First

Never build logic tied to a specific game in: - room service - socket
handlers - shared UI

### 2. Backend is Source of Truth

Server controls: - game state - turns - validation - win conditions

### 3. Game Isolation

Each game must: - be self-contained - not affect other games

------------------------------------------------------------------------

## Project Structure

### Backend

    server/src/games/
      game.types.ts
      game.registry.ts
      game.service.ts

      connect4/
      would-you-rather/
      imposter/

### Frontend

    client/src/components/games/
      GameShell.tsx
      connect4/
      would-you-rather/

------------------------------------------------------------------------

## Game System

Each game implements:

-   metadata
-   createInitialState
-   handleAction
-   getPublicState
-   optional validation

------------------------------------------------------------------------

## Connect 4 (Current Game)

### Rules

-   2 players only
-   7x6 board
-   turn-based
-   chip drops to lowest slot
-   win detection (all directions)
-   draw detection

### Features

-   scoreboard
-   replay
-   return to lobby
-   alternating first player

------------------------------------------------------------------------

## Future Games

-   Would You Rather (multi-player voting)
-   Imposter (hidden roles)
-   Trivia
-   Hybrid real-life games

------------------------------------------------------------------------

## Development Rules

DO: - keep logic modular - validate everything on backend - keep UI
clean and focused

DO NOT: - hardcode game logic into room system - trust frontend for
validation - mix game logic between modules

------------------------------------------------------------------------

## Setup

### Backend

    cd server
    npm install
    npm run dev

### Frontend

    cd client
    npm install
    npm run dev

------------------------------------------------------------------------

## Roadmap

1.  Stabilize Connect 4
2.  Multi-device testing
3.  Refactor architecture
4.  Add Would You Rather
5.  Add more games
6.  Improve UX
7.  Optional: public web version

------------------------------------------------------------------------

## Summary

LAN Game Hub is a **multiplayer game platform**, not a single game.

It provides: - a shared lobby system - a modular game engine - real-time
synchronization

It is designed to scale into multiple game types while remaining clean
and maintainable.
