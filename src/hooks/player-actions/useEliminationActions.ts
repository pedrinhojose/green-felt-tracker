import { useRef } from "react"; // fix: lock mechanism for eliminations
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";
import { useEliminationData } from "@/hooks/elimination/useEliminationData";

// Helper: find next available position (no duplicates)
function findAvailablePosition(players: GamePlayer[], desiredPosition: number): number {
  const takenPositions = new Set(
    players.filter(p => p.isEliminated && p.position !== null).map(p => p.position)
  );
  let pos = desiredPosition;
  while (takenPositions.has(pos) && pos >= 1) {
    pos--;
  }
  return Math.max(pos, 1);
}

export function useEliminationActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { saveElimination } = useEliminationData();
  const isProcessing = useRef(false);

  const eliminatePlayer = async (playerId: string, eliminatorId?: string) => {
    if (!game) return;

    if (isProcessing.current) {
      toast({ title: "Aguarde", description: "Processando eliminação anterior..." });
      return;
    }
    isProcessing.current = true;

    try {
      // Read fresh state
      const currentPlayers = game.players;
      const eliminatedPlayersCount = currentPlayers.filter(p => p.isEliminated).length;
      const totalPlayers = currentPlayers.length;
      const desiredPosition = totalPlayers - eliminatedPlayersCount;
      const position = findAvailablePosition(currentPlayers, desiredPosition);

      const updatedPlayers = currentPlayers.map(player => {
        if (player.playerId === playerId) {
          return { ...player, position, isEliminated: true };
        }
        return player;
      });

      await updateGame({ id: game.id, players: updatedPlayers });

      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        await saveElimination({
          game_id: game.id,
          eliminated_player_id: playerId,
          eliminator_player_id: eliminatorId || null,
          position,
          elimination_time: new Date().toISOString(),
          organization_id: orgId
        });
      }

      setGame(prev => {
        if (!prev) return null;
        return { ...prev, players: updatedPlayers };
      });

      toast({ title: "Jogador eliminado", description: `Posição final: ${position}º lugar` });

      // Auto-finish: if only one player remains
      const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
      if (remainingPlayers.length === 1) {
        const winner = remainingPlayers[0];
        const finalPlayers = updatedPlayers.map(player => {
          if (player.playerId === winner.playerId) {
            return { ...player, position: 1, isEliminated: true };
          }
          return player;
        });

        await updateGame({ id: game.id, players: finalPlayers });
        setGame(prev => prev ? { ...prev, players: finalPlayers } : null);

        toast({ title: "Partida finalizada!", description: "Um vencedor foi determinado. Você pode encerrar a partida." });
      }
    } catch (error) {
      console.error("Error eliminating player:", error);
      toast({ title: "Erro", description: "Não foi possível eliminar o jogador.", variant: "destructive" });
    } finally {
      isProcessing.current = false;
    }
  };

  const reactivatePlayer = async (playerId: string) => {
    if (!game) return;

    if (isProcessing.current) {
      toast({ title: "Aguarde", description: "Processando ação anterior..." });
      return;
    }
    isProcessing.current = true;

    try {
      const reactivatedPlayer = game.players.find(p => p.playerId === playerId);
      const reactivatedPosition = reactivatedPlayer?.position ?? null;

      // Remove elimination and recalculate positions for players with worse (higher number) positions
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) {
          return { ...player, position: null, isEliminated: false };
        }
        // Recalculate: players eliminated after this one (higher position number = worse placement)
        // need to move up one position (position - 1 means better placement... but actually
        // when someone is reactivated, players who were eliminated BEFORE them (worse position)
        // should keep their positions. We don't need to shift.
        // Actually: if player at position 5 is reactivated, no one else's position changes
        // because positions represent final standings, not order of elimination.
        return player;
      });

      await updateGame({ id: game.id, players: updatedPlayers });
      setGame(prev => prev ? { ...prev, players: updatedPlayers } : null);

      toast({ title: "Jogador reativado", description: "O jogador foi reintegrado à partida." });
    } catch (error) {
      console.error("Error reactivating player:", error);
      toast({ title: "Erro", description: "Não foi possível reativar o jogador.", variant: "destructive" });
    } finally {
      isProcessing.current = false;
    }
  };

  const eliminateMultiplePlayers = async (playerIds: string[], eliminatorId?: string) => {
    if (!game || playerIds.length === 0) return;

    if (isProcessing.current) {
      toast({ title: "Aguarde", description: "Processando eliminação anterior..." });
      return;
    }
    isProcessing.current = true;

    try {
      const currentPlayers = game.players;
      const eliminatedPlayersCount = currentPlayers.filter(p => p.isEliminated).length;
      const totalPlayers = currentPlayers.length;

      // Track taken positions to avoid duplicates within the batch
      const takenPositions = new Set(
        currentPlayers.filter(p => p.isEliminated && p.position !== null).map(p => p.position)
      );

      const updatedPlayers = currentPlayers.map(player => {
        if (playerIds.includes(player.playerId)) {
          const batchIndex = playerIds.indexOf(player.playerId);
          let position = totalPlayers - eliminatedPlayersCount - batchIndex;
          // Ensure no duplicate
          while (takenPositions.has(position) && position >= 1) {
            position--;
          }
          position = Math.max(position, 1);
          takenPositions.add(position);
          return { ...player, position, isEliminated: true };
        }
        return player;
      });

      await updateGame({ id: game.id, players: updatedPlayers });

      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        for (const playerId of playerIds) {
          const playerData = updatedPlayers.find(p => p.playerId === playerId);
          if (playerData) {
            await saveElimination({
              game_id: game.id,
              eliminated_player_id: playerId,
              eliminator_player_id: eliminatorId || null,
              position: playerData.position || 0,
              elimination_time: new Date().toISOString(),
              organization_id: orgId
            });
          }
        }
      }

      setGame(prev => prev ? { ...prev, players: updatedPlayers } : null);

      toast({ title: "Jogadores eliminados", description: `${playerIds.length} jogador(es) eliminado(s)` });

      const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
      if (remainingPlayers.length === 1) {
        const winner = remainingPlayers[0];
        const finalPlayers = updatedPlayers.map(player => {
          if (player.playerId === winner.playerId) {
            return { ...player, position: 1, isEliminated: true };
          }
          return player;
        });

        await updateGame({ id: game.id, players: finalPlayers });
        setGame(prev => prev ? { ...prev, players: finalPlayers } : null);

        toast({ title: "Partida finalizada!", description: "Um vencedor foi determinado. Você pode encerrar a partida." });
      }
    } catch (error) {
      console.error("Error eliminating multiple players:", error);
      toast({ title: "Erro", description: "Não foi possível eliminar os jogadores.", variant: "destructive" });
    } finally {
      isProcessing.current = false;
    }
  };

  return { eliminatePlayer, reactivatePlayer, eliminateMultiplePlayers };
}
