
import { usePoker } from "@/contexts/PokerContext";
import { usePlayerStats } from "./reports/usePlayerStats";
import { useSeasonSummary } from "./reports/useSeasonSummary";
import { useReportExport } from "./reports/useReportExport";
import { PlayerPerformanceStats, SeasonSummary } from "./reports/types";

export type { PlayerPerformanceStats, SeasonSummary };

export function useSeasonReport() {
  const { activeSeason } = usePoker();
  const { playerStats } = usePlayerStats();
  const { seasonSummary } = useSeasonSummary();
  const { isExporting, isExportingImage, exportReportAsPdf, exportReportAsImage } = useReportExport();
  
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
    isExporting,
    isExportingImage,
    exportReportAsPdf: exportSeasonReportAsPdf,
    exportReportAsImage: exportSeasonReportAsImage
  };
}
