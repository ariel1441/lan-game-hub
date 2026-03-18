# Game Design Checklist

Fill this out before implementing any new game.

## Identity

- Game name:
- Game id:
- Why this game belongs in LAN Game Hub:

## Player Model

- Minimum players:
- Maximum players:
- Are there spectators:
- Are active players selected by host:

## Interaction Model

- turn-based / simultaneous / real-time / hybrid:
- public or private information:
- round-based or continuous:

## Session Setup

- What options must exist before game start:
- What should `canStart` validate:
- What should `getPlayerCount` return:

## Game State

- phase field:
- score structure:
- current turn / active player tracking:
- round counters:
- reveal/result data:

## Player Actions

List every action:

- action type:
- payload:
- allowed phase:
- who may send it:
- backend validation:

## Public State

What is safe to expose to all clients:

- 

What must remain hidden or per-player:

- 

## Round Flow

1. Start state:
2. Mid-round state changes:
3. End-of-round state:
4. Replay behavior:
5. Return-to-lobby behavior:

## Disconnect / Edge Cases

- what happens if a non-host leaves:
- what happens if host leaves:
- what happens if an active player leaves mid-game:
- what happens if an invalid action is sent:

## Frontend Structure

- root game view:
- subcomponents:
- main focal element:
- compact HUD contents:
- host-only controls:
- mobile constraints:

## Acceptance Criteria

- [ ] backend state shape is defined
- [ ] action types are defined
- [ ] phase flow is defined
- [ ] invalid action rules are defined
- [ ] public/private state rules are defined
- [ ] frontend renderer structure is defined
- [ ] replay/return behavior is defined

