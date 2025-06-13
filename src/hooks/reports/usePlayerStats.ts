
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Game, Player } from "@/lib/db/models";
import { PlayerPerformanceStats, getPlayerName } from "./types";

export function usePlayerStats() {
  const { games, activeSeason, players, rankings } = usePoker();
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);

  useEffect(() => {
    console.log("=== usePlayerStats DEBUG ===");
    console.log("activeSeason:", activeSeason?.name || 'none');
    console.log("games count:", games?.length || 0);
    console.log("players count:", players?.length || 0);
    console.log("rankings count:", rankings?.length || 0);
    
    if (!activeSeason || !games.length || !players.length) {
      console.log("Missing required data for player stats calculation");
      setPlayerStats([]);
      return;
    }
    
    const finishedGames = games.filter(game => game.isFinished);
    console.log("Finished games count:", finishedGames.length);
    
    // Usar rankings como fonte principal de dados, complementando com cálculos dos jogos
    const playerStatsMap = new Map<string, PlayerPerformanceStats>();
    
    // Calcular valores de buy-in, rebuy e add-on
    const buyInValue = activeSeason.financialParams.buyIn;
    const rebuyValue = activeSeason.financialParams.rebuy;
    const addonValue = activeSeason.financialParams.addon;
    
    console.log("Financial params:", { buyInValue, rebuyValue, addonValue });
    
    // Obter o número de posições premiadas baseado no schema de premiação semanal
    const weeklyPrizePositions = activeSeason.weeklyPrizeSchema.length;
    console.log("Weekly prize positions:", weeklyPrizePositions);
    
    // Primeiro, criar estatísticas baseadas no ranking (fonte principal)
    rankings.forEach(ranking => {
      const player = players.find(p => p.id === ranking.playerId);
      
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
        // Novas métricas
        roi: 0,
        winRate: 0,
        itmRate: 0,
        biggestPrize: 0
      });
    });
    
    console.log("Initial player stats from rankings:", playerStatsMap.size);
    
    // Agora calcular dados financeiros e outras estatísticas dos jogos
    finishedGames.forEach(game => {
      game.players.forEach(gamePlayer => {
        let playerStat = playerStatsMap.get(gamePlayer.playerId);
        
        if (!playerStat) {
          // Se o jogador não está no ranking, criar entrada baseada nos jogos
          const player = players.find(p => p.id === gamePlayer.playerId);
          const playerName = getPlayerName(gamePlayer.playerId, players);
          
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
    setPlayerStats(playerStatsArray);
  }, [games, activeSeason, players, rankings]); // Adicionar rankings como dependência

  return { playerStats };
}
