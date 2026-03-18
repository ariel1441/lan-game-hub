export type BasicPlayer = {
  id: string;
  name: string;
  isHost: boolean;
};

export type GameAction = {
  type: string;
  payload?: unknown;
};

export type GameSetupMode = 'all_players' | 'selected_players';

export type GameSetupDefinition = {
  mode: GameSetupMode;
  minSelectedPlayers?: number;
  maxSelectedPlayers?: number;
  setupTitle?: string;
  setupDescription?: string;
};

export type GameDefinition = {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  setup: GameSetupDefinition;
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
    viewerPlayerId?: string;
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
