# LAN Game Hub --- Game Ideas & Concepts

This document contains a comprehensive list of game ideas for the LAN
Game Hub platform. The goal is to explore a wide variety of game types
to ensure the system supports multiple interaction models.

------------------------------------------------------------------------

## 1. Board & Logic Games

### Connect 4

-   2 players
-   turn-based
-   grid logic
-   already implemented

### Tic Tac Toe

-   very simple 2-player game
-   useful for testing infrastructure

### Checkers (Draughts)

-   turn-based
-   more complex movement rules

### Mastermind (בול פגיעה)

-   2 players (or player vs system later)
-   one player selects a hidden sequence of colors
-   the other guesses
-   feedback given:
    -   correct color & position
    -   correct color wrong position
-   strong logic-based deduction game

------------------------------------------------------------------------

## 2. Social / Party Games

### Would You Rather

-   all players answer simultaneously
-   results shown after everyone answers

### Never Have I Ever

-   players respond to prompts
-   can include scoring or just social interaction

### Truth or Dare

-   prompt-based
-   minimal backend logic

------------------------------------------------------------------------

## 3. Hidden Role Games

### Imposter

-   secret roles
-   discussion + voting
-   requires private state per player

### Mafia / Werewolf

-   advanced hidden role game
-   night/day phases
-   eliminations

------------------------------------------------------------------------

## 4. Quiz & Knowledge Games

### Trivia Quiz

-   multiple players
-   answer questions
-   scoring system

### Guess the Answer

-   similar to trivia but more flexible

------------------------------------------------------------------------

## 5. Reaction & Arcade Games

### Pong (Multiplayer)

-   2 players
-   real-time movement
-   physics-based

### Air Hockey Style Game

-   similar to pong but more dynamic
-   may require smoother real-time sync

### Space Shooter (Simple)

-   players control ships
-   shoot targets or each other
-   can be turn-based or real-time

### Reaction Time Game

-   fastest player wins
-   simple but fun

------------------------------------------------------------------------

## 6. Drawing & Creative Games

### Draw and Guess

-   one player draws
-   others guess

------------------------------------------------------------------------

## 7. Hybrid / Real-Life Games

### Task Challenges

-   app gives instructions
-   players perform in real life

### Party Challenges

-   prompts for group interaction

------------------------------------------------------------------------

## 8. Competitive & Tournament Ideas

### Score-Based Tournament Mode

-   multiple rounds
-   cumulative scoring

### Team Games

-   players split into teams

------------------------------------------------------------------------

## Key Design Considerations

The system must support:

-   turn-based logic (Connect 4)
-   simultaneous input (Would You Rather)
-   hidden data per player (Imposter)
-   real-time games (Pong)
-   lightweight prompt games (Truth or Dare)

------------------------------------------------------------------------

## Notes

-   Start with simpler games
-   Validate architecture with different game types
-   Expand gradually

------------------------------------------------------------------------

## Suggested Order

1.  Connect 4 (done)
2.  Would You Rather
3.  Mastermind (בול פגיעה)
4.  Imposter
5.  Pong / simple real-time game
6.  Trivia
