# Game Implementation Template

Use this as the implementation skeleton for future games.

## Backend Files

```text
server/src/games/<game-id>/
  <game-id>.types.ts
  <game-id>.logic.ts
  <game-id>.game.ts
```

## Frontend Files

```text
client/src/components/games/<game-id>/
  <GameName>View.tsx
```

## Backend Template

### `<game-id>.types.ts`

Define:

- state type
- phase type
- action union
- any helper payload/result types

Recommended shape:

```ts
export type ExamplePhase = 'setup' | 'playing' | 'finished';

export type ExampleState = {
  phase: ExamplePhase;
  playerIds: string[];
  scores: Record<string, number>;
  roundNumber: number;
};

export type ExampleAction =
  | { type: 'PRIMARY_ACTION'; payload: { value: string } }
  | { type: 'PLAY_AGAIN' };
```

### `<game-id>.logic.ts`

Put pure helpers here:

- state creation helpers
- validation helpers
- transition helpers
- scoring helpers

Keep these pure and testable.

### `<game-id>.game.ts`

Implement the actual `GameModule`.

Checklist:

- metadata
- optional `getPlayerCount`
- optional `canStart`
- `createInitialState`
- `getPublicState`
- `handleAction`

Recommended structure:

```ts
export const exampleGame: GameModule<ExampleState> = {
  id: 'example',
  name: 'Example',
  description: '...',
  minPlayers: 2,
  maxPlayers: 6,
  canStart: ({ players, options }) => {
    return { ok: true };
  },
  createInitialState: ({ players, options }) => {
    return createInitialExampleState(players.map((player) => player.id));
  },
  getPublicState: ({ state }) => state,
  handleAction: ({ state, action, playerId, players }) => {
    if (action.type === 'PLAY_AGAIN') {
      return { nextState: createNextRoundState(state) };
    }

    throw new Error('Unsupported action.');
  },
};
```

## Frontend Template

### `<GameName>View.tsx`

Responsibilities:

- derive typed state from `room.gameSession?.state`
- compute `canAct`
- render status
- send actions through `onGameAction`

Recommended sections:

- compact HUD
- main gameplay content
- host-only controls if needed

## Wiring Checklist

Backend:

- [ ] add game files
- [ ] export/register game in `game.registry.ts`

Frontend:

- [ ] add renderer component
- [ ] add `gameId` branch in `GameShell.tsx`

## Final Validation Checklist

- [ ] game appears in game picker
- [ ] host can select it
- [ ] game starts through generic room flow
- [ ] actions update all clients
- [ ] invalid actions are rejected
- [ ] replay works if applicable
- [ ] return to lobby works

