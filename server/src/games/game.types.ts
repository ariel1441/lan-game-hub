export type BasicPlayer = {
  id: string;
  name: string;
  isHost: boolean;
};

export type GameAction = {
  type: string;
  payload?: unknown;
};

export type GameDefinition = {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
};

export type GameModule<TState = unknown> = GameDefinition & {
  getPlayerCount?: (params: {
    players: BasicPlayer[];
    options?: Record<string, unknown>;
  }) => number;
  canStart?: (params: {
    players: BasicPlayer[];
    options?: Record<string, unknown>;
  }) => { ok: boolean; reason?: string };
  createInitialState: (params: {
    players: BasicPlayer[];
    options?: Record<string, unknown>;
  }) => TState;
  getPublicState: (params: {
    state: TState;
    players: BasicPlayer[];
  }) => unknown;
  handleAction: (params: {
    state: TState;
    action: GameAction;
    playerId: string;
    players: BasicPlayer[];
  }) => {
    nextState: TState;
  };
};
