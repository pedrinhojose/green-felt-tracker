
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { SeasonSummary } from "./types";

export function useSeasonSummary() {
  const { games, activeSeason } = usePoker();
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary>({
    totalGames: 0,
    totalPlayers: 0,
    totalPrizePool: 0,
    totalBuyIns: 0,
    totalRebuys: 0,
    totalAddons: 0,
    totalDinnerCost: 0
  });

  useEffect(() => {
    if (!activeSeason || !games.length) return;
    
    const finishedGames = games.filter(game => game.isFinished);
    
    // Calcular resumo da temporada
    const summary: SeasonSummary = {
      totalGames: finishedGames.length,
      totalPlayers: 0,
      totalPrizePool: finishedGames.reduce((sum, game) => sum + game.totalPrizePool, 0),
      totalBuyIns: 0,
      totalRebuys: 0,
      totalAddons: 0,
      totalDinnerCost: 0
    };
    
    // Inicializar conjunto para contar jogadores únicos
    const uniquePlayers = new Set<string>();
    
    // Calcular valores de buy-in, rebuy e add-on
    const buyInValue = activeSeason.financialParams.buyIn;
    const rebuyValue = activeSeason.financialParams.rebuy;
    const addonValue = activeSeason.financialParams.addon;
    
    // Processar todas as partidas finalizadas
    finishedGames.forEach(game => {
      // Contar buy-ins, rebuys e add-ons para o resumo da temporada
      const gameBuyIns = game.players.filter(p => p.buyIn).length * buyInValue;
      const gameRebuys = game.players.reduce((sum, p) => sum + p.rebuys, 0) * rebuyValue;
      const gameAddons = game.players.reduce((sum, p) => sum + p.addons, 0) * addonValue;
      
      summary.totalBuyIns += gameBuyIns;
      summary.totalRebuys += gameRebuys;
      summary.totalAddons += gameAddons;
      
      // Adicionar o custo da janta
      summary.totalDinnerCost += game.dinnerCost || 0;
      
      // Adicionar jogadores ao conjunto de jogadores únicos
      game.players.forEach(gamePlayer => {
        uniquePlayers.add(gamePlayer.playerId);
      });
    });
    
    // Atualizar número total de jogadores únicos
    summary.totalPlayers = uniquePlayers.size;
    
    setSeasonSummary(summary);
  }, [games, activeSeason]);

  return { seasonSummary };
}
