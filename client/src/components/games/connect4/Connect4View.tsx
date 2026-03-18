import { useMemo, useState } from 'react';
import type { Connect4State, PublicRoom } from '../../../types/room';
import { Connect4Board } from './Connect4Board';
import { Connect4Sidebar } from './Connect4Sidebar';
import { GameBadge, GameHud, GamePage, GamePanel, GamePrimaryButton, GameSecondaryButton } from '../shared/GameChrome';

type Connect4ViewProps = {
  room: PublicRoom;
  currentPlayerId: string | null;
  isHost: boolean;
  onReturnToLobby: () => Promise<void>;
  onGameAction: (action: { type: string; payload?: unknown }) => Promise<void>;
};

export const Connect4View = ({ room, currentPlayerId, isHost, onReturnToLobby, onGameAction }: Connect4ViewProps) => {
  const [pendingColumn, setPendingColumn] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const state = room.gameSession?.state as Connect4State | null;
  const playersById = useMemo(() => new Map(room.players.map((player) => [player.id, player])), [room.players]);

  if (!room.gameSession || !state) {
    return null;
  }

  const firstPlayer = playersById.get(state.playerIds[0]);
  const secondPlayer = playersById.get(state.playerIds[1]);

  if (!firstPlayer || !secondPlayer) {
    return null;
  }

  const currentTurnPlayer = playersById.get(state.currentTurnPlayerId) ?? null;
  const winner = state.winnerPlayerId ? playersById.get(state.winnerPlayerId) ?? null : null;
  const isActivePlayer = currentPlayerId ? state.playerIds.includes(currentPlayerId) : false;
  const canPlay = state.phase === 'playing' && currentPlayerId === state.currentTurnPlayerId && pendingColumn === null;
  const currentPlayerChip = state.currentTurnPlayerId === firstPlayer.id ? 'R' : 'Y';

  const statusText = winner
    ? `${winner.name} wins round ${state.roundNumber}`
    : state.isDraw
      ? `Round ${state.roundNumber} ended in a draw`
      : currentTurnPlayer
        ? `${currentTurnPlayer.name}'s turn`
        : 'Waiting for the next move';

  const subtitle = winner || state.isDraw
    ? 'The host can start the next round or return to the lobby.'
    : canPlay
      ? 'Click any column to drop your chip.'
      : isActivePlayer
        ? 'Watch the board and wait for your turn.'
        : 'This round is between the selected players. You can follow along live from this screen.';

  const handleDrop = async (column: number) => {
    if (!canPlay) {
      return;
    }

    try {
      setPendingColumn(column);
      await onGameAction({
        type: 'DROP_PIECE',
        payload: { column },
      });
    } finally {
      setPendingColumn(null);
    }
  };

  const handlePlayAgain = async () => {
    try {
      setIsReplaying(true);
      await onGameAction({ type: 'PLAY_AGAIN' });
    } finally {
      setIsReplaying(false);
    }
  };

  const handleReturnToLobby = async () => {
    try {
      setIsReturning(true);
      await onReturnToLobby();
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <GamePage>
      <GameHud
        eyebrow="Connect 4"
        title={statusText}
        subtitle={subtitle}
        leftSlot={(
          <>
            <Connect4Sidebar
              player={firstPlayer}
              score={state.scores[firstPlayer.id] ?? 0}
              chip="R"
              isCurrentTurn={state.currentTurnPlayerId === firstPlayer.id && state.phase === 'playing'}
              isWinner={state.winnerPlayerId === firstPlayer.id}
              align="left"
            />
            <Connect4Sidebar
              player={secondPlayer}
              score={state.scores[secondPlayer.id] ?? 0}
              chip="Y"
              isCurrentTurn={state.currentTurnPlayerId === secondPlayer.id && state.phase === 'playing'}
              isWinner={state.winnerPlayerId === secondPlayer.id}
              align="left"
            />
          </>
        )}
        rightSlot={(
          <>
            <GameBadge tone="neutral">Round {state.roundNumber}</GameBadge>
            <GameBadge tone={state.phase === 'finished' ? 'accent' : 'success'}>
              {state.phase === 'finished' ? 'Round complete' : 'Live match'}
            </GameBadge>
          </>
        )}
        bottomSlot={(
          <>
            {state.phase === 'finished' && isHost ? (
              <GamePrimaryButton disabled={isReplaying} onClick={handlePlayAgain}>
                {isReplaying ? 'Starting next round...' : 'Play again'}
              </GamePrimaryButton>
            ) : null}
            {isHost ? (
              <GameSecondaryButton disabled={isReturning} onClick={handleReturnToLobby}>
                {isReturning ? 'Returning...' : 'Return to lobby'}
              </GameSecondaryButton>
            ) : null}
          </>
        )}
      />

      <GamePanel className="flex flex-1 items-center justify-center overflow-hidden px-3 py-2 sm:px-4 sm:py-3">
        <Connect4Board
          board={state.board}
          canPlay={canPlay}
          currentPlayerChip={currentPlayerChip}
          winningCells={state.winningCells}
          onDrop={handleDrop}
        />
      </GamePanel>
    </GamePage>
  );
};
