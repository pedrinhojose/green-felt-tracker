
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from "@/lib/db";
import { RankingEntry } from "@/lib/db/models";
import { v5 as uuidv5 } from 'uuid';

export function useRankingSync() {
  const { games, activeSeason } = usePoker();
  const { toast } = useToast();

  const recalculateRankings = async (seasonId?: string): Promise<RankingEntry[]> => {
    if (!seasonId || !activeSeason) {
      console.warn("No season ID provided or no active season");
      return [];
    }

    try {
      console.log("Recalculando rankings para temporada:", seasonId);
      
      // Buscar dados atualizados dos jogadores diretamente do banco
      const freshPlayers = await pokerDB.getPlayers();
      console.log("Jogadores atualizados carregados:", freshPlayers.length);
      
      // Buscar jogos diretamente do banco para garantir dados atualizados
      const allGames = await pokerDB.getGames(seasonId);
      const finishedGames = allGames.filter(game => 
        game.seasonId === seasonId && game.isFinished
      );
      
      if (finishedGames.length === 0) {
        console.log("Nenhum jogo finalizado encontrado para esta temporada");
        return [];
      }

      // Carregar scoreSchema da temporada para normalizar pontos
      const seasonData = await pokerDB.getSeason(seasonId);
      const scoreSchema = seasonData?.scoreSchema ?? [];

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
          // Buscar dados atualizados do jogador
          const player = freshPlayers.find(p => p.id === gamePlayer.playerId);
          if (!player) return;

          // Buscar ou criar estatísticas do jogador
          let playerStat = playerStatsMap.get(gamePlayer.playerId);
          
          if (!playerStat) {
            playerStat = {
              playerId: gamePlayer.playerId,
              playerName: player.name,
              photoUrl: player.photoUrl, // Usar dados atualizados do banco
              totalPoints: 0,
              gamesPlayed: 0,
              bestPosition: 99 // Iniciar com um valor alto
            };
            playerStatsMap.set(gamePlayer.playerId, playerStat);
          }

          // Atualizar estatísticas
          playerStat.gamesPlayed++;
          const normalizedPoints = (typeof gamePlayer.points === 'number' && !Number.isNaN(gamePlayer.points))
            ? gamePlayer.points
            : (scoreSchema.find((e: any) => e.position === gamePlayer.position)?.points ?? 0);
          playerStat.totalPoints += normalizedPoints;
          
          // Atualizar melhor posição (menor número é melhor)
          if (gamePlayer.position && gamePlayer.position < playerStat.bestPosition) {
            playerStat.bestPosition = gamePlayer.position;
          }
        });
      });

      // Converter para array de rankings
      const newRankings: RankingEntry[] = Array.from(playerStatsMap.values()).map(stat => ({
        id: uuidv5(`${stat.playerId}-${seasonId}`, uuidv5.URL),
        playerId: stat.playerId,
        playerName: stat.playerName,
        photoUrl: stat.photoUrl, // Garantir que a foto esteja sincronizada
        totalPoints: stat.totalPoints,
        gamesPlayed: stat.gamesPlayed,
        bestPosition: stat.bestPosition === 99 ? 0 : stat.bestPosition,
        seasonId: seasonId
      }));

      // Salvar rankings em paralelo para reduzir tempo de I/O
      await Promise.all(newRankings.map(r => pokerDB.saveRanking(r)));

      console.log(`Rankings recalculados e salvos: ${newRankings.length} jogadores`);
      console.log("Fotos sincronizadas:", newRankings.filter(r => r.photoUrl).length, "de", newRankings.length);
      
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

  const syncPlayerPhotosInRankings = async (seasonId?: string): Promise<void> => {
    if (!seasonId) return;

    try {
      console.log("Sincronizando fotos dos jogadores nos rankings...");
      
      // Buscar dados atualizados dos jogadores
      const freshPlayers = await pokerDB.getPlayers();
      
      // Buscar rankings atuais
      const currentRankings = await pokerDB.getRankings(seasonId);
      
      // Atualizar fotos nos rankings
      for (const ranking of currentRankings) {
        const player = freshPlayers.find(p => p.id === ranking.playerId);
        
        if (player && player.photoUrl !== ranking.photoUrl) {
          console.log(`Atualizando foto do jogador ${player.name}: ${ranking.photoUrl} -> ${player.photoUrl}`);
          
          const updatedRanking = {
            ...ranking,
            photoUrl: player.photoUrl,
            playerName: player.name // Sincronizar nome também
          };
          
          await pokerDB.saveRanking(updatedRanking);
        }
      }
      
      console.log("Sincronização de fotos concluída");
    } catch (error) {
      console.error("Erro ao sincronizar fotos dos jogadores:", error);
    }
  };

  const validateRankingConsistency = async (seasonId?: string): Promise<boolean> => {
    if (!seasonId) return true;

    try {
      // Primeiro sincronizar fotos
      await syncPlayerPhotosInRankings(seasonId);
      
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
    syncPlayerPhotosInRankings,
    validateRankingConsistency
  };
}
