
import { useToast } from "@/components/ui/use-toast";
import { RankingEntry, Season } from '../db/models';
import { exportRankingAsImage } from './rankingImageExport';

/**
 * Hook personalizado para o download do ranking como imagem
 */
export const useRankingExport = () => {
  const { toast } = useToast();

  const downloadRankingAsImage = async (
    sortedRankings: RankingEntry[],
    activeSeason: Season | null,
    getInitials: (name: string) => string,
    getMedalEmoji: (position: number) => string
  ) => {
    try {
      const imageUrl = await exportRankingAsImage(sortedRankings, activeSeason, getInitials, getMedalEmoji);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `poker-ranking-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Ranking exportado",
        description: "O ranking foi exportado como imagem com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao exportar ranking:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o ranking como imagem.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return { downloadRankingAsImage };
};

// Re-export exportRankingAsImage for direct usage if needed
export { exportRankingAsImage };
