
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Game, Player } from "@/lib/db/models";

export function useGameExport(game: Game | null, players: Player[]) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  
  // Game report export functionality
  const handleExportReport = async () => {
    if (!game) return;
    
    try {
      setIsExporting(true);
      
      const { exportGameReport } = await import("@/lib/utils/exportUtils");
      // Now the function returns a URL string instead of a Blob
      const pdfUrl = await exportGameReport(game.id, players);
      
      // Open the PDF in a new tab
      window.open(pdfUrl, '_blank');
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório foi aberto em uma nova aba.",
      });
    } catch (error) {
      console.error("Error exporting game report:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório de jogo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Game report export as image functionality
  const handleExportReportAsImage = async () => {
    if (!game) return;
    
    try {
      setIsExportingImage(true);
      
      const { exportGameReportAsImage } = await import("@/lib/utils/exportUtils");
      const imageUrl = await exportGameReportAsImage(game.id, players);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `poker-report-${game.number}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Imagem gerada com sucesso",
        description: "A imagem do relatório foi baixada.",
      });
    } catch (error) {
      console.error("Error exporting game report as image:", error);
      toast({
        title: "Erro ao gerar imagem",
        description: "Não foi possível gerar a imagem do relatório.",
        variant: "destructive",
      });
    } finally {
      setIsExportingImage(false);
    }
  };
  
  return {
    isExporting,
    isExportingImage,
    handleExportReport,
    handleExportReportAsImage,
  };
}
