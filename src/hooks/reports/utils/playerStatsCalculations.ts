
import { Game, Player, Season, RankingEntry } from "@/lib/db/models";
import { PlayerPerformanceStats, getPlayerName } from "../types";

interface CalculationParams {
  targetGames: Game[];
  targetPlayers: Player[];
  targetRankings: RankingEntry[];
  targetSeason: Season;
}

export function calculatePlayerStats({
  targetGames,
  targetPlayers,
  targetRankings,
  targetSeason
}: CalculationParams): PlayerPerformanceStats[] {
  console.log("Final data counts:", {
    games: targetGames.length,
    players: targetPlayers.length,
    rankings: targetRankings.length
  });
  
  // Se não há rankings, criar estatísticas apenas baseadas nos jogos
  if (targetRankings.length === 0 && targetGames.length === 0) {
    console.log("No rankings or games data available");
    return [];
  }
  
  const finishedGames = targetGames.filter(game => game.isFinished);
  console.log("Finished games count:", finishedGames.length);
  
  // Calcular valores de buy-in, rebuy e add-on
  const buyInValue = targetSeason?.financialParams.buyIn || 0;
  const rebuyValue = targetSeason?.financialParams.rebuy || 0;
  const addonValue = targetSeason?.financialParams.addon || 0;
  
  console.log("Financial params:", { buyInValue, rebuyValue, addonValue });
  
  // Obter o número de posições premiadas baseado no schema de premiação semanal
  const weeklyPrizePositions = targetSeason?.weeklyPrizeSchema?.length || 3;
  console.log("Weekly prize positions:", weeklyPrizePositions);
  
  // Usar rankings como fonte principal de dados, complementando com cálculos dos jogos
  const playerStatsMap = new Map<string, PlayerPerformanceStats>();
  
  // Primeiro, criar estatísticas baseadas no ranking (fonte principal)
  targetRankings.forEach(ranking => {
    const player = targetPlayers.find(p => p.id === ranking.playerId);
    
    playerStatsMap.set(ranking.playerId, {
      playerId: ranking.playerId,
      playerName: ranking.playerName,
      photoUrl: player?.photoUrl || ranking.photoUrl,
      gamesPlayed: ranking.gamesPlayed,
      victories: 0, // Será calculado abaixo
      averagePosition: 0, // Será calculado abaixo
      totalWinnings: 0, // Será calculado abaixo
      totalInvestment: 0, // Será calculado abaixo
      balance: 0, // Será calculado abaixo
      totalPoints: ranking.totalPoints, // Usar pontos do ranking
      totalRebuys: 0, // Será calculado abaixo
      roi: 0,
      winRate: 0,
      itmRate: 0,
      biggestPrize: 0
    });
  });
  
  console.log("Initial player stats from rankings:", playerStatsMap.size);
  
  // Se não há rankings mas há jogos, criar estatísticas apenas dos jogos
  if (playerStatsMap.size === 0 && finishedGames.length > 0) {
    console.log("Creating stats from games only (no rankings available)");
    
    // Identificar todos os jogadores que participaram
    const playersInGames = new Set<string>();
    finishedGames.forEach(game => {
      game.players.forEach(gamePlayer => {
        playersInGames.add(gamePlayer.playerId);
      });
    });
    
    // Criar entrada para cada jogador
    playersInGames.forEach(playerId => {
      const player = targetPlayers.find(p => p.id === playerId);
      const playerName = getPlayerName(playerId, targetPlayers);
      
      playerStatsMap.set(playerId, {
        playerId,
        playerName,
        photoUrl: player?.photoUrl,
        gamesPlayed: 0, // Será calculado abaixo
        victories: 0,
        averagePosition: 0,
        totalWinnings: 0,
        totalInvestment: 0,
        balance: 0,
        totalPoints: 0, // Sem pontos se não há ranking
        totalRebuys: 0,
        roi: 0,
        winRate: 0,
        itmRate: 0,
        biggestPrize: 0
      });
    });
  }
  
  // Agora calcular dados financeiros e outras estatísticas dos jogos
  finishedGames.forEach(game => {
    game.players.forEach(gamePlayer => {
      let playerStat = playerStatsMap.get(gamePlayer.playerId);
      
      if (!playerStat) {
        // Se o jogador não está no ranking, criar entrada baseada nos jogos
        const player = targetPlayers.find(p => p.id === gamePlayer.playerId);
        const playerName = getPlayerName(gamePlayer.playerId, targetPlayers);
        
        console.log("Player not in ranking, creating from games:", playerName);
        
        playerStat = {
          playerId: gamePlayer.playerId,
          playerName,
          photoUrl: player?.photoUrl,
          gamesPlayed: 0,
          victories: 0,
          averagePosition: 0,
          totalWinnings: 0,
          totalInvestment: 0,
          balance: 0,
          totalPoints: 0, // Sem pontos se não estiver no ranking
          totalRebuys: 0,
          roi: 0,
          winRate: 0,
          itmRate: 0,
          biggestPrize: 0
        };
        playerStatsMap.set(gamePlayer.playerId, playerStat);
      }
      
      // Contar jogos apenas se o jogador não foi excluído da origem do ranking
      if (targetRankings.find(r => r.playerId === gamePlayer.playerId) || targetRankings.length === 0) {
        // Incrementar jogos apenas se não foi contado pelo ranking
        if (targetRankings.length === 0) {
          // Se não há rankings, contar pelo jogo
          playerStat.gamesPlayed++;
        }
      }
      
      // Verificar se o jogador venceu esta partida
      if (gamePlayer.position === 1) {
        playerStat.victories++;
      }
      
      // Calcular ganhos (prêmios)
      const prize = gamePlayer.prize || 0;
      playerStat.totalWinnings += prize;
      
      // Atualizar maior prêmio
      if (prize > playerStat.biggestPrize) {
        playerStat.biggestPrize = prize;
      }
      
      // Calcular investimento (buy-in + rebuys + add-ons)
      const investment = 
        (gamePlayer.buyIn ? buyInValue : 0) + 
        (gamePlayer.rebuys * rebuyValue) + 
        (gamePlayer.addons * addonValue);
      
      playerStat.totalInvestment += investment;
      
      // Adicionar rebuys
      playerStat.totalRebuys += gamePlayer.rebuys || 0;
    });
  });
  
  return calculateFinalMetrics(playerStatsMap, finishedGames, weeklyPrizePositions);
}

function calculateFinalMetrics(
  playerStatsMap: Map<string, PlayerPerformanceStats>,
  finishedGames: Game[],
  weeklyPrizePositions: number
): PlayerPerformanceStats[] {
  // Calcular métricas finais para cada jogador
  playerStatsMap.forEach((playerStat, playerId) => {
    const playerGames = finishedGames
      .flatMap(game => game.players)
      .filter(gamePlayer => gamePlayer.playerId === playerId && gamePlayer.position);
    
    // Calcular posição média
    if (playerGames.length > 0) {
      const totalPositions = playerGames.reduce((sum, gamePlayer) => 
        sum + (gamePlayer.position || 0), 0);
      playerStat.averagePosition = totalPositions / playerGames.length;
    }
    
    // Calcular saldo final
    playerStat.balance = playerStat.totalWinnings - playerStat.totalInvestment;
    
    // Calcular ROI (Return on Investment)
    if (playerStat.totalInvestment > 0) {
      playerStat.roi = ((playerStat.totalWinnings - playerStat.totalInvestment) / playerStat.totalInvestment) * 100;
    }
    
    // Calcular taxa de vitórias
    if (playerStat.gamesPlayed > 0) {
      playerStat.winRate = (playerStat.victories / playerStat.gamesPlayed) * 100;
    }
    
    // Calcular taxa de ITM (In The Money)
    if (playerStat.gamesPlayed > 0) {
      const itmCount = playerGames.filter(gamePlayer => 
        gamePlayer.position && gamePlayer.position <= weeklyPrizePositions
      ).length;
      playerStat.itmRate = (itmCount / playerStat.gamesPlayed) * 100;
    }
  });
  
  // Converter mapa para array e ordenar por total de pontos (do ranking)
  const playerStatsArray = Array.from(playerStatsMap.values())
    .sort((a, b) => b.totalPoints - a.totalPoints);
  
  console.log("Final player stats calculated:", playerStatsArray.length);
  console.log("Sample player stat:", playerStatsArray[0]);
  
  return playerStatsArray;
}
