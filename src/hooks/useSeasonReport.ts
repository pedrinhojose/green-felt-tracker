
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
  const { activeSeason, players } = usePoker();
  const { playerStats } = usePlayerStats();
  const { seasonSummary } = useSeasonSummary();
  const { isExporting, isExportingImage, exportReportAsPdf, exportReportAsImage } = useReportExport();
  
  // Calcular os ganhadores do jackpot
  const calculateJackpotWinners = (): JackpotWinner[] => {
    if (!activeSeason || !playerStats.length) return [];
    
    // Ordenar jogadores por pontuação (já estão ordenados)
    const sortedPlayers = [...playerStats];
    
    // Obter o schema de premiação da temporada
    const prizeSchema = activeSeason.seasonPrizeSchema;
    
    // Total do jackpot
    const totalJackpot = activeSeason.jackpot;
    
    // Calcular premiação para os jogadores no top (de acordo com o schema)
    const winners: JackpotWinner[] = [];
    
    for (let i = 0; i < Math.min(prizeSchema.length, sortedPlayers.length); i++) {
      const playerStat = sortedPlayers[i];
      const prizeEntry = prizeSchema[i];
      
      if (!prizeEntry) continue;
      
      // Encontrar dados do jogador
      const playerData = players.find((p: Player) => p.id === playerStat.playerId);
      
      if (playerData) {
        winners.push({
          playerId: playerStat.playerId,
          playerName: playerStat.playerName,
          photoUrl: playerData.photoUrl,
          position: prizeEntry.position,
          jackpotAmount: (totalJackpot * prizeEntry.percentage) / 100
        });
      }
    }
    
    return winners;
  };
  
  const jackpotWinners = calculateJackpotWinners();
  const totalJackpot = activeSeason?.jackpot || 0;
  
  // Exportar relatório da temporada como PDF
  const exportSeasonReportAsPdf = async () => {
    if (!activeSeason) return;
    
    await exportReportAsPdf(
      'season-report',
      `Relatório_Temporada_${activeSeason.name || 'Atual'}.pdf`
    );
  };
  
  // Exportar relatório da temporada como imagem
  const exportSeasonReportAsImage = async () => {
    if (!activeSeason) return;
    
    await exportReportAsImage(
      'season-report',
      `Relatório_Temporada_${activeSeason.name || 'Atual'}.png`
    );
  };
  
  return {
    playerStats,
    seasonSummary,
    jackpotWinners,
    totalJackpot,
    isExporting,
    isExportingImage,
    exportReportAsPdf: exportSeasonReportAsPdf,
    exportReportAsImage: exportSeasonReportAsImage
  };
}
