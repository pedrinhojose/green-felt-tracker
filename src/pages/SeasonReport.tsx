
import { useNavigate } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, ArrowLeft } from "lucide-react";
import PlayerPerformanceTable from "@/components/reports/PlayerPerformanceTable";
import SeasonPrizePoolSummary from "@/components/reports/SeasonPrizePoolSummary";
import JackpotWinnersCard from "@/components/reports/JackpotWinnersCard";
import { useSeasonReport } from "@/hooks/useSeasonReport";

export default function SeasonReport() {
  const navigate = useNavigate();
  const { activeSeason } = usePoker();
  
  const { 
    playerStats, 
    seasonSummary,
    jackpotWinners,
    totalJackpot,
    isExporting,
    isExportingImage,
    exportReportAsPdf,
    exportReportAsImage
  } = useSeasonReport();
  
  const handleExportPdf = async () => {
    try {
      await exportReportAsPdf();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };
  
  const handleExportImage = async () => {
    try {
      await exportReportAsImage();
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };
  
  if (!activeSeason) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Nenhuma temporada ativa</h2>
        <Button onClick={() => navigate('/temporada')}>Ir para Configuração de Temporada</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/partidas')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Partidas
            </Button>
            <h2 className="text-2xl font-bold text-white">
              Relatório da Temporada: {activeSeason.name}
            </h2>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              {isExporting ? "Exportando..." : "Exportar PDF"}
              <FileText className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleExportImage}
              disabled={isExportingImage}
              variant="outline"
              size="sm"
            >
              {isExportingImage ? "Exportando..." : "Exportar Imagem"}
              <Image className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div id="season-report" className="space-y-6">
          {/* Resumo da Temporada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Resumo da Temporada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-poker-green/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Partidas</p>
                  <p className="text-2xl font-bold">{seasonSummary.totalGames}</p>
                </div>
                
                <div className="bg-poker-green/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Jogadores</p>
                  <p className="text-2xl font-bold">{seasonSummary.totalPlayers}</p>
                </div>
                
                <div className="bg-poker-green/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Premiação</p>
                  <p className="text-2xl font-bold text-poker-gold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seasonSummary.totalPrizePool)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Ganhadores do Jackpot */}
          {jackpotWinners.length > 0 && (
            <JackpotWinnersCard 
              jackpotWinners={jackpotWinners} 
              totalJackpot={totalJackpot}
            />
          )}
          
          {/* Resumo financeiro da temporada */}
          <SeasonPrizePoolSummary seasonSummary={seasonSummary} />
          
          {/* Tabela de desempenho dos jogadores */}
          <PlayerPerformanceTable playerStats={playerStats} />
        </div>
      </div>
    </div>
  );
}
