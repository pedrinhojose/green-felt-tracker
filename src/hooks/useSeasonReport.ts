
import { usePoker } from "@/contexts/PokerContext";
import { usePlayerStats } from "./reports/usePlayerStats";
import { useSeasonSummary } from "./reports/useSeasonSummary";
import { useReportExport } from "./reports/useReportExport";
import { PlayerPerformanceStats, SeasonSummary } from "./reports/types";
import { Player } from "@/lib/db/models";

export type { PlayerPerformanceStats, SeasonSummary };

export interface JackpotWinner {
  playerId: string;
  playerName: string;
  photoUrl?: string;
  position: number;
  jackpotAmount: number;
}

export function useSeasonReport() {
  const { activeSeason, players, rankings } = usePoker();
  
  console.log("=== useSeasonReport DEBUG ===");
  console.log("activeSeason:", activeSeason?.name || 'none');
  console.log("players count:", players?.length || 0);
  console.log("rankings count:", rankings?.length || 0);
  
  const { playerStats } = usePlayerStats();
  const { seasonSummary } = useSeasonSummary();
  const { isExporting, isExportingImage, exportReportAsPdf, exportReportAsImage } = useReportExport();
  
  console.log("playerStats count:", playerStats?.length || 0);
  console.log("seasonSummary:", seasonSummary);
  
  // Calcular os ganhadores do jackpot usando o ranking (pontuação) em vez do saldo financeiro
  const calculateJackpotWinners = (): JackpotWinner[] => {
    console.log("=== calculateJackpotWinners DEBUG ===");
    
    if (!activeSeason) {
      console.log("No active season");
      return [];
    }
    
    if (!rankings.length) {
      console.log("No rankings available");
      return [];
    }
    
    console.log("Active season:", activeSeason.name);
    console.log("Rankings available:", rankings.length);
    console.log("Prize schema:", activeSeason.seasonPrizeSchema);
    
    // Ordenar jogadores por pontuação (os rankings já estão ordenados por pontos)
    const sortedRankings = [...rankings];
    
    // Obter o schema de premiação da temporada
    const prizeSchema = activeSeason.seasonPrizeSchema;
    
    // Total do jackpot
    const totalJackpot = activeSeason.jackpot;
    
    console.log("Total jackpot:", totalJackpot);
    console.log("Prize schema length:", prizeSchema?.length || 0);
    
    // Calcular premiação para os jogadores no top (de acordo com o schema)
    const winners: JackpotWinner[] = [];
    
    if (!prizeSchema || !Array.isArray(prizeSchema)) {
      console.log("Invalid prize schema");
      return [];
    }
    
    for (let i = 0; i < Math.min(prizeSchema.length, sortedRankings.length); i++) {
      const ranking = sortedRankings[i];
      const prizeEntry = prizeSchema[i];
      
      if (!prizeEntry) continue;
      
      // Encontrar dados do jogador para obter a foto mais atualizada
      const playerData = players.find((p: Player) => p.id === ranking.playerId);
      
      if (playerData) {
        // Corrigir o problema da photoUrl - extrair o valor string se for um objeto
        let photoUrl: string | undefined = undefined;
        
        if (playerData.photoUrl) {
          if (typeof playerData.photoUrl === 'string') {
            photoUrl = playerData.photoUrl;
          } else if (typeof playerData.photoUrl === 'object' && 'value' in playerData.photoUrl) {
            const urlValue = (playerData.photoUrl as any).value;
            photoUrl = urlValue !== 'undefined' ? urlValue : undefined;
          }
        }
        
        const winner = {
          playerId: ranking.playerId,
          playerName: ranking.playerName,
          photoUrl: photoUrl, // Usar a foto corrigida
          position: prizeEntry.position,
          jackpotAmount: (totalJackpot * prizeEntry.percentage) / 100
        };
        
        console.log("Adding winner:", winner);
        winners.push(winner);
      }
    }
    
    console.log("Total winners calculated:", winners.length);
    return winners;
  };
  
  const jackpotWinners = calculateJackpotWinners();
  const totalJackpot = activeSeason?.jackpot || 0;
  
  console.log("Final data summary:");
  console.log("- playerStats:", playerStats?.length || 0);
  console.log("- jackpotWinners:", jackpotWinners?.length || 0);
  console.log("- totalJackpot:", totalJackpot);
  console.log("- seasonSummary.totalGames:", seasonSummary?.totalGames || 0);
  
  // Exportar relatório da temporada como PDF profissional para impressão
  const exportSeasonReportAsPdf = async () => {
    if (!activeSeason) return;
    
    await exportReportAsPdf(
      activeSeason.name || 'Temporada Atual',
      seasonSummary,
      jackpotWinners,
      totalJackpot,
      playerStats,
      `Relatorio_Temporada_${activeSeason.name?.replace(/\s+/g, '_') || 'Atual'}.pdf`
    );
  };
  
  // Exportar relatório da temporada como imagem otimizada para mobile
  const exportSeasonReportAsImage = async () => {
    if (!activeSeason) return;
    
    await exportReportAsImage(
      'season-report',
      `Relatorio_Temporada_${activeSeason.name?.replace(/\s+/g, '_') || 'Atual'}.png`
    );
  };
  
  return {
    playerStats: playerStats || [],
    seasonSummary: seasonSummary || {
      totalGames: 0,
      totalPlayers: 0,
      totalPrizePool: 0,
      totalBuyIns: 0,
      totalRebuys: 0,
      totalAddons: 0,
      totalDinnerCost: 0
    },
    jackpotWinners: jackpotWinners || [],
    totalJackpot,
    isExporting,
    isExportingImage,
    exportReportAsPdf: exportSeasonReportAsPdf,
    exportReportAsImage: exportSeasonReportAsImage
  };
}
