import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GameShell } from '../components/games/GameShell';
import { GamePicker } from '../components/lobby/GamePicker';
import { PlayerList } from '../components/lobby/PlayerList';
import { RoomCodeCard } from '../components/lobby/RoomCodeCard';
import { useRoom } from '../hooks/useRoom';

export const RoomPage = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const {
    room,
    currentPlayerId,
    isHost,
    leaveRoom,
    roomClosedReason,
    clearRoomClosedReason,
    selectGame,
    startGame,
    returnToLobby,
    sendGameAction,
  } = useRoom();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    if (!room && !roomClosedReason) {
      navigate('/');
    }
  }, [navigate, room, roomClosedReason]);

  useEffect(() => {
    if (!room || room.status !== 'lobby') {
      return;
    }

    setSelectedPlayerIds((current) => {
      const roomPlayerIds = new Set(room.players.map((player) => player.id));
      const next = current.filter((playerId) => roomPlayerIds.has(playerId)).slice(0, 2);

      if (next.length === 0 && room.players.length === 2) {
        return room.players.map((player) => player.id);
      }

      return next;
    });
  }, [room]);

  const activeRoomCode = room?.code || roomCode || '';
  const badgeClassName = isHost
    ? 'border-sky-400/20 bg-sky-400/10 text-sky-200'
    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';

  const selectedGame = room?.availableGames.find((game) => game.id === room.selectedGameId) ?? null;
  const selectedPlayersStillInRoom = !!room
    && selectedPlayerIds.every((playerId) => room.players.some((player) => player.id === playerId));
  const canStartConnect4 = !!room
    && room.status === 'lobby'
    && room.selectedGameId === 'connect4'
    && selectedPlayerIds.length === 2
    && selectedPlayersStillInRoom;

  const lobbyHint = useMemo(() => {
    if (!room) {
      return '';
    }

    if (!room.selectedGameId) {
      return 'Select a game to continue.';
    }

    if (room.selectedGameId === 'connect4' && selectedPlayerIds.length !== 2) {
      return 'Choose the 2 active players before starting.';
    }

    if (room.selectedGameId === 'connect4' && !selectedPlayersStillInRoom) {
      return 'One of the selected players is no longer in the room. Choose the active players again.';
    }

    return selectedGame ? `${selectedGame.name} is ready to start.` : 'The selected game is ready.';
  }, [room, selectedGame, selectedPlayerIds.length, selectedPlayersStillInRoom]);

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  const handleSelectGame = async (gameId: string) => {
    setSelectedPlayerIds([]);
    await selectGame(gameId);
  };

  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }

      if (current.length >= 2) {
        return [...current.slice(1), playerId];
      }

      return [...current, playerId];
    });
  };

  const handleStartGame = async () => {
    if (!canStartConnect4) {
      return;
    }

    setIsStartingGame(true);
    await startGame({ activePlayerIds: selectedPlayerIds });
    setIsStartingGame(false);
  };

  if (roomClosedReason) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
        <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
          Room closed
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">This lobby is no longer available</h2>
        <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">{roomClosedReason}</p>
        <Link
          to="/"
          onClick={clearRoomClosedReason}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
        >
          Back home
        </Link>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  if (room.status === 'in_game') {
    return (
      <GameShell
        room={room}
        currentPlayerId={currentPlayerId}
        isHost={isHost}
        onReturnToLobby={async () => {
          await returnToLobby();
        }}
        onGameAction={async (action) => {
          await sendGameAction(action);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${badgeClassName}`}>
              {isHost ? 'Host view' : 'Player view'}
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {isHost ? 'Choose a game and get the room ready' : 'Waiting for the host to start the game'}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
              {isHost
                ? 'Select one of the available games, configure any game-specific options, and start the session when the room is ready.'
                : 'The host is choosing the first game. Stay connected - when the game starts, this page will switch automatically.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</div>
              <div className="mt-2 font-medium text-white">{selectedGame ? `${selectedGame.name} selected` : 'Choose a game'}</div>
            </div>
            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Leave room
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <RoomCodeCard roomCode={activeRoomCode} />

          {isHost ? (
            <GamePicker
              games={room.availableGames}
              selectedGameId={room.selectedGameId}
              onSelect={handleSelectGame}
            />
          ) : (
            <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Lobby status</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {selectedGame
                  ? `${selectedGame.name} is selected. Waiting for the host to configure the match and start it.`
                  : 'The host has not chosen a game yet.'}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <PlayerList players={room.players} currentPlayerId={currentPlayerId} />

          {room.selectedGameId === 'connect4' ? (
            <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Connect 4 setup</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Choose exactly 2 active players for this match, then start the game.
                  </p>
                </div>
                {isHost ? (
                  <button
                    type="button"
                    disabled={!canStartConnect4 || isStartingGame}
                    onClick={handleStartGame}
                    className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isStartingGame ? 'Starting...' : 'Start Connect 4'}
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {room.players.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      disabled={!isHost}
                      onClick={() => handleTogglePlayer(player.id)}
                      className={`rounded-3xl border px-5 py-4 text-left transition ${
                        isSelected
                          ? 'border-sky-400/40 bg-sky-400/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                      } ${!isHost ? 'cursor-default' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-white">{player.name}</div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {player.isHost ? 'Host' : 'Player'}
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            Selected
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {lobbyHint}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};
