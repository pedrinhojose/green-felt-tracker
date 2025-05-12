
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Game, Player } from "@/lib/db/models";
import { PlayerPerformanceStats, getPlayerName } from "./types";

export function usePlayerStats() {
  const { games, activeSeason, players } = usePoker();
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);

  useEffect(() => {
    if (!activeSeason || !games.length || !players.length) return;
    
    const finishedGames = games.filter(game => game.isFinished);
    
    // Mapa para armazenar dados de desempenho por jogador
    const playerStatsMap = new Map<string, PlayerPerformanceStats>();
    
    // Calcular valores de buy-in, rebuy e add-on
    const buyInValue = activeSeason.financialParams.buyIn;
    const rebuyValue = activeSeason.financialParams.rebuy;
    const addonValue = activeSeason.financialParams.addon;
    
    // Processar todas as partidas finalizadas
    finishedGames.forEach(game => {
      // Processar dados de cada jogador na partida
      game.players.forEach(gamePlayer => {
        // Buscar ou criar estatísticas do jogador
        let playerStat = playerStatsMap.get(gamePlayer.playerId);
        const player = players.find(p => p.id === gamePlayer.playerId);
        const playerName = getPlayerName(gamePlayer.playerId, players);
        
        if (!playerStat) {
          playerStat = {
            playerId: gamePlayer.playerId,
            playerName,
            photoUrl: player?.photoUrl, // Obter a foto do objeto player atualizado
            gamesPlayed: 0,
            victories: 0,
            averagePosition: 0,
            totalWinnings: 0,
            totalInvestment: 0,
            balance: 0,
            totalPoints: 0,
            totalRebuys: 0
          };
          playerStatsMap.set(gamePlayer.playerId, playerStat);
        }
        
        // Atualizar estatísticas do jogador
        playerStat.gamesPlayed++;
        
        // Verificar se o jogador venceu esta partida
        if (gamePlayer.position === 1) {
          playerStat.victories++;
        }
        
        // Adicionar posição para calcular média depois
        if (gamePlayer.position) {
          playerStat.averagePosition = 
            (playerStat.averagePosition * (playerStat.gamesPlayed - 1) + gamePlayer.position) / 
            playerStat.gamesPlayed;
        }
        
        // Calcular ganhos (prêmios)
        playerStat.totalWinnings += gamePlayer.prize || 0;
        
        // Calcular investimento (buy-in + rebuys + add-ons)
        const investment = 
          (gamePlayer.buyIn ? buyInValue : 0) + 
          (gamePlayer.rebuys * rebuyValue) + 
          (gamePlayer.addons * addonValue);
        
        playerStat.totalInvestment += investment;
        
        // Atualizar saldo
        playerStat.balance = playerStat.totalWinnings - playerStat.totalInvestment;
        
        // Adicionar pontos
        playerStat.totalPoints += gamePlayer.points || 0;
        
        // Adicionar rebuys
        playerStat.totalRebuys += gamePlayer.rebuys || 0;
      });
    });
    
    // Converter mapa para array e ordenar por saldo (maior para menor)
    const playerStatsArray = Array.from(playerStatsMap.values())
      .sort((a, b) => b.balance - a.balance);
    
    // Atualizar as fotos com os dados mais recentes dos jogadores
    const updatedPlayerStats = playerStatsArray.map(stat => {
      const player = players.find(p => p.id === stat.playerId);
      return {
        ...stat,
        photoUrl: player?.photoUrl // Garantir que a URL da foto mais recente seja usada
      };
    });
    
    setPlayerStats(updatedPlayerStats);
  }, [games, activeSeason, players]);

  return { playerStats };
}
