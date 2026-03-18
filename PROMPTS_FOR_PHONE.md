# Prompts For Phone

Use these prompts in a new phone chat when working on LAN Game Hub away from your PC.

Start by linking the repo and, if needed, pasting:

- `PROJECT_BRIEF.md`
- `NEW_GAME_WORKFLOW.md`
- the relevant issue or screenshot

## 1. Design A New Game

```text
This repository is a LAN multiplayer game hub, not a single-game app.

Important rules:
- multigame-first architecture
- backend is authoritative
- each game must be isolated in its own module
- frontend renders by gameId
- do not leak game-specific logic into shared room or socket infrastructure

I want to add this game:

<PASTE GAME IDEA HERE>

Please give me:
1. gameplay summary
2. backend state shape
3. player actions / events
4. validation rules
5. public state vs private state
6. frontend UI structure
7. file-by-file implementation plan
8. test checklist
```

## 2. Generate Code Changes

```text
Using the LAN Game Hub architecture and the game design below, generate the exact code changes needed for this repository.

Requirements:
- preserve generic room/game infrastructure
- keep the new game isolated
- fit the current backend/frontend folder structure
- mention each file that needs to be created or updated

Here is the design:

<PASTE DESIGN HERE>
```

## 3. Review A UI Screenshot

```text
This screenshot is from LAN Game Hub.

Please review it like a product/UI reviewer and tell me:
1. the biggest layout problems
2. what feels visually off
3. what should be the primary focal point
4. what should be smaller / larger
5. a concrete implementation direction for React + Tailwind

Keep the result practical and code-oriented.
```

## 4. Turn Notes Into GitHub Issues

```text
Turn these rough notes into clean GitHub issues for LAN Game Hub.

For each issue, provide:
- title
- summary
- acceptance criteria
- optional implementation notes

Notes:

<PASTE NOTES HERE>
```

## 5. Prepare A Test Plan

```text
Create a QA checklist for this LAN Game Hub feature.

Feature:
<PASTE FEATURE HERE>

Please include:
1. happy path
2. invalid actions
3. disconnect / reconnect edge cases
4. multiplayer sync checks
5. mobile browser checks
```

## 6. Debug From Error Or Screenshot

```text
I am working on LAN Game Hub and I cannot run a full desktop debugging session right now.

Here is the error / screenshot / behavior:

<PASTE HERE>

Please help me:
1. identify the likely cause
2. rank the most likely fixes
3. tell me which files in this repo probably need changes
4. give me a minimal patch plan
```

## 7. Ask For A Safe Refactor

```text
Please propose a refactor for this LAN Game Hub code while preserving behavior.

Focus on:
- multigame architecture
- reducing Connect 4 leakage into shared systems
- maintainability
- small, low-risk changes

Here is the current code / file:

<PASTE FILE OR SUMMARY HERE>
```

