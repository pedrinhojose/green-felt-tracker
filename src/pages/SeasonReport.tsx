
import { useNavigate } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, ArrowLeft, Share } from "lucide-react";
import PlayerPerformanceTable from "@/components/reports/PlayerPerformanceTable";
import SeasonPrizePoolSummary from "@/components/reports/SeasonPrizePoolSummary";
import JackpotWinnersCard from "@/components/reports/JackpotWinnersCard";
import BestWorstPlayersCard from "@/components/reports/BestWorstPlayersCard";
import { useSeasonReport } from "@/hooks/useSeasonReport";
import { useShareableLink } from "@/hooks/useShareableLink";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SeasonReport() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  console.log("=== SeasonReport Component DEBUG ===");
  console.log("Component rendering...");
  
  // Always call all hooks first, before any conditional logic
  let activeSeason = null;
  let contextError = null;
  
  try {
    console.log("Accessing usePoker context...");
    const pokerContext = usePoker();
    activeSeason = pokerContext.activeSeason;
    console.log("Active season from context:", activeSeason?.name || 'none');
  } catch (error) {
    console.error("Error accessing usePoker context:", error);
    contextError = error;
  }
  
  // Always call useSeasonReport hook regardless of context state
  console.log("Getting season report data...");
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
  
  const { generateShareableLink, isGenerating } = useShareableLink();
  
  console.log("Season report data retrieved:");
  console.log("- playerStats count:", playerStats?.length || 0);
  console.log("- seasonSummary:", seasonSummary);
  console.log("- jackpotWinners count:", jackpotWinners?.length || 0);
  console.log("- totalJackpot:", totalJackpot);
  
  // Now handle conditional rendering after all hooks are called
  if (contextError) {
    console.log("Context error detected, showing loading");
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold mx-auto mb-4"></div>
        <h2 className="text-xl text-white">Carregando dados...</h2>
      </div>
    );
  }
  
  if (!activeSeason) {
    console.log("No active season found");
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Nenhuma temporada ativa</h2>
        <Button onClick={() => navigate('/season')}>Ir para Configuração de Temporada</Button>
      </div>
    );
  }
  
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

  const handleExportLink = async () => {
    try {
      if (activeSeason?.id) {
        await generateShareableLink(activeSeason.id);
      }
    } catch (error) {
      console.error("Error generating shareable link:", error);
    }
  };
  
  return (
    <div className={`container mx-auto ${isMobile ? 'px-1 py-2' : 'px-4 py-6'}`}>
      <div className="flex flex-col space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center ${isMobile ? 'px-2' : ''}`}>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/games')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Partidas
            </Button>
            <h2 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Relatório da Temporada: {activeSeason.name}
            </h2>
          </div>
          
          <div className={`flex gap-2 mt-4 sm:mt-0 ${isMobile ? 'w-full' : ''}`}>
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className={isMobile ? 'flex-1' : ''}
            >
              {isExporting ? "Exportando..." : "Exportar PDF"}
              <FileText className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleExportImage}
              disabled={isExportingImage}
              variant="outline"
              size="sm"
              className={isMobile ? 'flex-1' : ''}
            >
              {isExportingImage ? "Exportando..." : "Exportar Imagem"}
              <Image className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleExportLink}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className={isMobile ? 'flex-1' : ''}
            >
              {isGenerating ? "Gerando..." : "Exportar Link"}
              <Share className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div id="season-report" className={`space-y-4 ${isMobile ? 'px-1' : ''}`}>
          {/* Resumo da Temporada - sempre mostra */}
          <Card>
            <CardHeader className={isMobile ? 'pb-3' : ''}>
              <CardTitle className={isMobile ? "text-base" : "text-xl"}>Resumo da Temporada</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'pt-0' : ''}>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div className="bg-poker-green/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total de Partidas</p>
                  <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {seasonSummary?.totalGames || 0}
                  </p>
                </div>
                
                <div className="bg-poker-green/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total de Jogadores</p>
                  <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {seasonSummary?.totalPlayers || 0}
                  </p>
                </div>
                
                <div className="bg-poker-green/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Premiação</p>
                  <p className={`font-bold text-poker-gold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seasonSummary?.totalPrizePool || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Destaques (Melhor Jogador e Rey do Rebuy) */}
          <BestWorstPlayersCard playerStats={playerStats} />
          
          {/* Card de Ganhadores do Jackpot */}
          <JackpotWinnersCard 
            jackpotWinners={jackpotWinners} 
            totalJackpot={totalJackpot}
          />
          
          {/* Resumo financeiro da temporada */}
          <SeasonPrizePoolSummary seasonSummary={seasonSummary} />
          
          {/* Tabela de desempenho dos jogadores */}
          <PlayerPerformanceTable playerStats={playerStats} />
        </div>
      </div>
    </div>
  );
}
