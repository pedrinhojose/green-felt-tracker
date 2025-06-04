
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from "@/lib/db";
import { RankingEntry } from "@/lib/db/models";

export function useRankingSync() {
  const { games, activeSeason, players } = usePoker();
  const { toast } = useToast();

  const recalculateRankings = async (seasonId?: string): Promise<RankingEntry[]> => {
    if (!seasonId || !activeSeason) {
      console.warn("No season ID provided or no active season");
      return [];
    }

    try {
      console.log("Recalculando rankings para temporada:", seasonId);
      
      // Filtrar apenas jogos finalizados da temporada
      const finishedGames = games.filter(game => 
        game.seasonId === seasonId && game.isFinished
      );
      
      if (finishedGames.length === 0) {
        console.log("Nenhum jogo finalizado encontrado para esta temporada");
        return [];
      }

      // Mapa para calcular estatísticas por jogador
      const playerStatsMap = new Map<string, {
        playerId: string;
        playerName: string;
        photoUrl?: string;
        totalPoints: number;
        gamesPlayed: number;
        bestPosition: number;
      }>();

      // Processar todos os jogos finalizados
      finishedGames.forEach(game => {
        game.players.forEach(gamePlayer => {
          // Buscar dados do jogador
          const player = players.find(p => p.id === gamePlayer.playerId);
          if (!player) return;

          // Buscar ou criar estatísticas do jogador
          let playerStat = playerStatsMap.get(gamePlayer.playerId);
          
          if (!playerStat) {
            playerStat = {
              playerId: gamePlayer.playerId,
              playerName: player.name,
              photoUrl: player.photoUrl,
              totalPoints: 0,
              gamesPlayed: 0,
              bestPosition: 99 // Iniciar com um valor alto
            };
            playerStatsMap.set(gamePlayer.playerId, playerStat);
          }

          // Atualizar estatísticas
          playerStat.gamesPlayed++;
          playerStat.totalPoints += gamePlayer.points || 0;
          
          // Atualizar melhor posição (menor número é melhor)
          if (gamePlayer.position && gamePlayer.position < playerStat.bestPosition) {
            playerStat.bestPosition = gamePlayer.position;
          }
        });
      });

      // Converter para array de rankings
      const newRankings: RankingEntry[] = Array.from(playerStatsMap.values()).map(stat => ({
        id: `${stat.playerId}-${seasonId}`,
        playerId: stat.playerId,
        playerName: stat.playerName,
        photoUrl: stat.photoUrl,
        totalPoints: stat.totalPoints,
        gamesPlayed: stat.gamesPlayed,
        bestPosition: stat.bestPosition === 99 ? 0 : stat.bestPosition,
        seasonId: seasonId
      }));

      // Salvar cada ranking no banco de dados
      for (const ranking of newRankings) {
        await pokerDB.saveRanking(ranking);
      }

      console.log(`Rankings recalculados e salvos: ${newRankings.length} jogadores`);
      
      return newRankings.sort((a, b) => b.totalPoints - a.totalPoints);
    } catch (error) {
      console.error("Erro ao recalcular rankings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível recalcular os rankings.",
        variant: "destructive",
      });
      return [];
    }
  };

  const validateRankingConsistency = async (seasonId?: string): Promise<boolean> => {
    if (!seasonId) return true;

    try {
      // Obter rankings atuais do banco
      const currentRankings = await pokerDB.getRankings(seasonId);
      
      // Calcular rankings baseados nos jogos
      const calculatedRankings = await recalculateRankings(seasonId);
      
      // Comparar se há discrepâncias
      let hasDiscrepancies = false;
      
      for (const calculated of calculatedRankings) {
        const current = currentRankings.find(r => r.playerId === calculated.playerId);
        
        if (!current || current.totalPoints !== calculated.totalPoints) {
          hasDiscrepancies = true;
          console.warn(`Discrepância encontrada para jogador ${calculated.playerName}:`, {
            current: current?.totalPoints || 0,
            calculated: calculated.totalPoints
          });
        }
      }
      
      if (hasDiscrepancies) {
        toast({
          title: "Inconsistência detectada",
          description: "Os pontos do ranking foram recalculados para corrigir discrepâncias.",
        });
      }
      
      return !hasDiscrepancies;
    } catch (error) {
      console.error("Erro ao validar consistência dos rankings:", error);
      return false;
    }
  };

  return {
    recalculateRankings,
    validateRankingConsistency
  };
}
