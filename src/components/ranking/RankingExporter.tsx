
import { Button } from "@/components/ui/button";
import { RankingEntry } from "@/lib/db/models";
import { Season } from "@/lib/db/models";
import { Download } from "lucide-react";
import { useState } from "react";
import { useRankingExport } from "@/lib/utils/rankingExportUtils";

interface RankingExporterProps {
  sortedRankings: RankingEntry[];
  activeSeason: Season | null;
  getInitials: (name: string) => string;
  getMedalEmoji: (position: number) => string;
}

export default function RankingExporter({ sortedRankings, activeSeason, getInitials, getMedalEmoji }: RankingExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { downloadRankingAsImage } = useRankingExport();

  const handleExportRanking = async () => {
    try {
      setIsExporting(true);
      await downloadRankingAsImage(sortedRankings, activeSeason, getInitials, getMedalEmoji);
    } catch (error) {
      console.error("Erro ao exportar ranking:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExportRanking} 
      disabled={isExporting || sortedRankings.length === 0}
      className="bg-poker-gold hover:bg-poker-gold/80 text-black"
    >
      {isExporting ? "Exportando..." : "Exportar Ranking"}
      <Download className="ml-2" size={18} />
    </Button>
  );
}

export { RankingExporter };
