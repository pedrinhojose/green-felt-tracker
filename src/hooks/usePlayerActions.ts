
import { useStartGame } from './player-actions/useStartGame';
import { useLatePlayerActions } from './player-actions/useLatePlayerActions';
import { usePlayerStatsActions } from './player-actions/usePlayerStatsActions';
import { useEliminationActions } from './player-actions/useEliminationActions';
import { useRemovePlayerActions } from './player-actions/useRemovePlayerActions';
import { Game } from "@/lib/db/models";

export function usePlayerActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  // Importamos cada hook específico
  const { handleStartGame } = useStartGame(game, setGame);
  const { addLatePlayer } = useLatePlayerActions(game, setGame);
  const { updatePlayerStats } = usePlayerStatsActions(game, setGame);
  const { eliminatePlayer, reactivatePlayer } = useEliminationActions(game, setGame);
  const { removePlayer } = useRemovePlayerActions(game, setGame);

  return {
    handleStartGame,
    updatePlayerStats,
    eliminatePlayer,
    reactivatePlayer,
    addLatePlayer,
    removePlayer
  };
}
