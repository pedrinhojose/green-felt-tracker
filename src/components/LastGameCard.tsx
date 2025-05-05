
import { Button } from "@/components/ui/button";
import { usePoker } from "@/contexts/PokerContext";
import { formatDate, formatCurrency } from "@/lib/utils/dateUtils";
import { exportGameReport } from "@/lib/utils/exportUtils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function LastGameCard() {
  const { lastGame, players } = usePoker();
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  // Get winner of the last game
  const winner = lastGame?.players.find(player => player.position === 1);
  const winnerName = winner ? players.find(p => p.id === winner.playerId)?.name || 'Desconhecido' : 'Não finalizado';
  
  const handleExportReport = async () => {
    if (!lastGame) return;
    
    try {
      setIsExporting(true);
      const pdfUrl = await exportGameReport(lastGame.id, lastGame, players);
      
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
          
          <Button 
            onClick={handleExportReport} 
            disabled={isExporting || !lastGame.isFinished}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            {isExporting ? "Exportando..." : "Exportar Relatório"}
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Nenhuma partida registrada
        </div>
      )}
    </div>
  );
}
