
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
  const { playerStats } = usePlayerStats();
  const { seasonSummary } = useSeasonSummary();
  const { isExporting, isExportingImage, exportReportAsPdf, exportReportAsImage } = useReportExport();
  
  // Calcular os ganhadores do jackpot usando o ranking (pontuação) em vez do saldo financeiro
  const calculateJackpotWinners = (): JackpotWinner[] => {
    if (!activeSeason || !rankings.length) return [];
    
    // Ordenar jogadores por pontuação (os rankings já estão ordenados por pontos)
    const sortedRankings = [...rankings];
    
    // Obter o schema de premiação da temporada
    const prizeSchema = activeSeason.seasonPrizeSchema;
    
    // Total do jackpot
    const totalJackpot = activeSeason.jackpot;
    
    // Calcular premiação para os jogadores no top (de acordo com o schema)
    const winners: JackpotWinner[] = [];
    
    for (let i = 0; i < Math.min(prizeSchema.length, sortedRankings.length); i++) {
      const ranking = sortedRankings[i];
      const prizeEntry = prizeSchema[i];
      
      if (!prizeEntry) continue;
      
      // Encontrar dados do jogador para obter a foto mais atualizada
      const playerData = players.find((p: Player) => p.id === ranking.playerId);
      
      if (playerData) {
        winners.push({
          playerId: ranking.playerId,
          playerName: ranking.playerName,
          photoUrl: playerData.photoUrl, // Usar diretamente a foto do objeto player que está atualizado
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
