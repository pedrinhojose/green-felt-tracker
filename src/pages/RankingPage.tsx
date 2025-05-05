
import { useEffect, useState, useRef } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportScreenshot } from "@/lib/utils/exportUtils";

export default function RankingPage() {
  const { rankings, activeSeason, players } = usePoker();
  const [sortedRankings, setSortedRankings] = useState(rankings);
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const rankingTableRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Sort rankings by total points in descending order
    const sorted = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
    setSortedRankings(sorted);
    
    // Debug para verificar os dados
    console.log("Rankings atualizados:", rankings);
    console.log("Temporada ativa:", activeSeason?.id);
  }, [rankings, activeSeason]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return (position + 1).toString();
    }
  };

  const handleExportRanking = async () => {
    if (!rankingTableRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Exporta o elemento como imagem
      const imageUrl = await exportScreenshot('ranking-table');
      
      // Cria um link temporário para download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `ranking-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Ranking exportado",
        description: "O ranking foi exportado como imagem com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar ranking:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o ranking como imagem.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Ranking</h2>
          <p className="text-muted-foreground">
            {activeSeason ? activeSeason.name : 'Nenhuma temporada ativa'}
          </p>
        </div>
        
        <Button 
          onClick={handleExportRanking} 
          disabled={isExporting || sortedRankings.length === 0}
          className="bg-poker-gold hover:bg-poker-gold/80 text-black"
        >
          {isExporting ? "Exportando..." : "Exportar Ranking"}
          <Download className="ml-2" size={18} />
        </Button>
      </div>
      
      {sortedRankings.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="ranking-table" ref={rankingTableRef} className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-poker-dark-green">
                    <th className="text-left py-2 px-4">#</th>
                    <th className="text-left py-2 px-4">Jogador</th>
                    <th className="text-center py-2 px-4">Jogos</th>
                    <th className="text-center py-2 px-4">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRankings.map((ranking, index) => (
                    <tr key={ranking.playerId} className="border-b border-poker-dark-green hover:bg-poker-dark-green/30">
                      <td className="py-3 px-4 font-semibold">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-poker-dark-green text-center">
                          {getMedalEmoji(index)}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {ranking.photoUrl ? (
                              <AvatarImage src={ranking.photoUrl} alt={ranking.playerName} />
                            ) : null}
                            <AvatarFallback className="bg-poker-navy text-white">
                              {getInitials(ranking.playerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{ranking.playerName}</div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-center">{ranking.gamesPlayed}</td>
                      
                      <td className="py-3 px-4 text-center font-bold text-poker-gold">{ranking.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Nenhuma pontuação registrada ainda</p>
          <Card className="max-w-md mx-auto p-6 bg-poker-dark-green">
            <CardContent className="text-center">
              <p>
                O ranking será atualizado após a finalização das partidas.
                {!activeSeason && ' Crie uma temporada para começar.'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
