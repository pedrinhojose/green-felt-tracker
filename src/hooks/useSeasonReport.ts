
import { usePoker } from "@/contexts/PokerContext";
import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Game, GamePlayer, Player } from "@/lib/db/models";

export interface PlayerPerformanceStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  victories: number;
  averagePosition: number;
  totalWinnings: number;
  totalInvestment: number;
  balance: number;
}

export interface SeasonSummary {
  totalGames: number;
  totalPlayers: number;
  totalPrizePool: number;
  totalBuyIns: number;
  totalRebuys: number;
  totalAddons: number;
}

export function useSeasonReport() {
  const { games, activeSeason, players } = usePoker();
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary>({
    totalGames: 0,
    totalPlayers: 0,
    totalPrizePool: 0,
    totalBuyIns: 0,
    totalRebuys: 0,
    totalAddons: 0
  });
  
  // Calcular estatísticas dos jogadores e resumo da temporada
  useEffect(() => {
    if (!activeSeason || !games.length || !players.length) return;
    
    const finishedGames = games.filter(game => game.isFinished);
    
    // Calcular resumo da temporada
    const summary: SeasonSummary = {
      totalGames: finishedGames.length,
      totalPlayers: 0,
      totalPrizePool: finishedGames.reduce((sum, game) => sum + game.totalPrizePool, 0),
      totalBuyIns: 0,
      totalRebuys: 0,
      totalAddons: 0
    };
    
    // Mapa para armazenar dados de desempenho por jogador
    const playerStatsMap = new Map<string, PlayerPerformanceStats>();
    
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
      
      // Processar dados de cada jogador na partida
      game.players.forEach(gamePlayer => {
        // Adicionar jogador ao conjunto de jogadores únicos
        uniquePlayers.add(gamePlayer.playerId);
        
        // Buscar ou criar estatísticas do jogador
        let playerStat = playerStatsMap.get(gamePlayer.playerId);
        const playerName = getPlayerName(gamePlayer.playerId, players);
        
        if (!playerStat) {
          playerStat = {
            playerId: gamePlayer.playerId,
            playerName,
            gamesPlayed: 0,
            victories: 0,
            averagePosition: 0,
            totalWinnings: 0,
            totalInvestment: 0,
            balance: 0
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
      });
    });
    
    // Atualizar número total de jogadores únicos
    summary.totalPlayers = uniquePlayers.size;
    
    // Converter mapa para array e ordenar por saldo (maior para menor)
    const playerStatsArray = Array.from(playerStatsMap.values())
      .sort((a, b) => b.balance - a.balance);
    
    setPlayerStats(playerStatsArray);
    setSeasonSummary(summary);
  }, [games, activeSeason, players]);
  
  // Função para obter nome do jogador pelo ID
  const getPlayerName = (playerId: string, playersList: Player[]): string => {
    const player = playersList.find(p => p.id === playerId);
    return player?.name || 'Jogador Desconhecido';
  };
  
  // Exportar relatório como PDF
  const exportReportAsPdf = async () => {
    const reportElement = document.getElementById('season-report');
    if (!reportElement) return;
    
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: '#1a2e35',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Relatório_Temporada_${activeSeason?.name || 'Atual'}.pdf`);
  };
  
  // Exportar relatório como imagem
  const exportReportAsImage = async () => {
    const reportElement = document.getElementById('season-report');
    if (!reportElement) return;
    
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: '#1a2e35',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Criar um link temporário e simular um clique nele para fazer o download
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `Relatório_Temporada_${activeSeason?.name || 'Atual'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return {
    playerStats,
    seasonSummary,
    exportReportAsPdf,
    exportReportAsImage
  };
}
