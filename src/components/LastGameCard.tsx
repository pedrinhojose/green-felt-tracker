
import { Button } from "@/components/ui/button";
import { usePoker } from "@/contexts/PokerContext";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FileImage, Image } from "lucide-react";

export default function LastGameCard() {
  const { lastGame, players } = usePoker();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const { toast } = useToast();
  
  // Get winner of the last game
  const winner = lastGame?.players.find(player => player.position === 1);
  const winnerName = winner ? players.find(p => p.id === winner.playerId)?.name || 'Desconhecido' : 'Não finalizado';
  
  const handleExportReport = async () => {
    if (!lastGame) return;
    
    try {
      setIsExporting(true);
      
      // Importa a função de forma dinâmica
      const { exportGameReport } = await import("@/lib/utils/exportUtils");
      
      // Estamos passando apenas o ID do jogo, já que o exportGameReport
      // buscará o jogo completo diretamente do banco de dados
      const pdfUrl = await exportGameReport(lastGame.id, players);
      
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
  
  const handleExportReportAsImage = async () => {
    if (!lastGame) return;
    
    try {
      setIsExportingImage(true);
      
      // Importa a função de forma dinâmica
      const { exportGameReportAsImage } = await import("@/lib/utils/exportUtils");
      
      const imageUrl = await exportGameReportAsImage(lastGame.id, players);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `poker-report-${lastGame.number}-${new Date().toISOString().split('T')[0]}.png`;
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

  return (
    <div className="card-dashboard">
      <h3 className="card-dashboard-header">Última Partida</h3>
      
      {lastGame ? (
        <div className="flex flex-col">
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">Partida #{lastGame.number.toString().padStart(3, '0')}</div>
            <div className="text-sm">{formatDate(lastGame.date)}</div>
            <div className="mt-2 font-medium">Vencedor: {winnerName}</div>
            <div className="mt-1">Prêmio: {winner ? formatCurrency(winner.prize) : 'N/A'}</div>
            <div className="mt-1">Total: {formatCurrency(lastGame.totalPrizePool)}</div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleExportReport} 
              disabled={isExporting || !lastGame.isFinished}
              className="bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              {isExporting ? "Exportando..." : "Exportar PDF"}
              <FileImage className="ml-2" size={18} />
            </Button>
            
            <Button 
              onClick={handleExportReportAsImage} 
              disabled={isExportingImage || !lastGame.isFinished}
              variant="outline"
              className="border-poker-gold text-poker-gold hover:bg-poker-gold/10"
            >
              {isExportingImage ? "Exportando..." : "Exportar Imagem"}
              <Image className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Nenhuma partida registrada
        </div>
      )}
    </div>
  );
}
