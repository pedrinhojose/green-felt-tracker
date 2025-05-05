
import { useEffect, useState, useRef } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportScreenshot } from "@/lib/utils/exportUtils";
import html2canvas from "html2canvas";

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
      
      // Cria um elemento temporário para renderizar o ranking com estilo otimizado para exportação
      const exportDiv = document.createElement('div');
      exportDiv.id = 'ranking-export';
      exportDiv.style.padding = '20px';
      exportDiv.style.backgroundColor = '#0A3B23'; // Cor de fundo do poker green
      exportDiv.style.borderRadius = '12px';
      exportDiv.style.width = '100%';
      exportDiv.style.maxWidth = '800px';
      exportDiv.style.margin = '0 auto';
      exportDiv.style.overflow = 'visible'; // Garante que o conteúdo não seja cortado
      
      // Adiciona cabeçalho
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '20px';
      header.style.padding = '10px 20px';
      header.style.borderBottom = '2px solid #072818';
      
      const title = document.createElement('h2');
      title.textContent = 'Ranking do Poker';
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.color = '#ffffff';
      
      const subtitle = document.createElement('p');
      subtitle.textContent = activeSeason ? activeSeason.name : 'Temporada Ativa';
      subtitle.style.color = '#D4AF37';
      subtitle.style.fontSize = '16px';
      
      const titleContainer = document.createElement('div');
      titleContainer.appendChild(title);
      titleContainer.appendChild(subtitle);
      
      header.appendChild(titleContainer);
      
      // Adicionar a data da exportação
      const dateContainer = document.createElement('div');
      dateContainer.textContent = new Date().toLocaleDateString('pt-BR');
      dateContainer.style.color = '#ffffff';
      dateContainer.style.fontSize = '14px';
      
      header.appendChild(dateContainer);
      
      exportDiv.appendChild(header);
      
      // Clona a tabela de ranking
      const tableClone = rankingTableRef.current.cloneNode(true) as HTMLElement;
      
      // Ajusta o estilo da tabela para garantir que tudo seja visível
      tableClone.style.width = '100%';
      tableClone.style.borderCollapse = 'collapse';
      tableClone.style.tableLayout = 'fixed'; // Força coluna de tamanho fixo
      
      // Ajusta o estilo das células para garantir que tudo seja visível
      const cells = tableClone.querySelectorAll('td, th');
      cells.forEach((cell: HTMLElement) => {
        cell.style.whiteSpace = 'nowrap'; // Evita quebra de linha
        cell.style.padding = '8px 12px';
        cell.style.overflow = 'visible';
      });
      
      // Garanta que as células de pontos tenham espaço suficiente
      const pointCells = tableClone.querySelectorAll('td:last-child, th:last-child');
      pointCells.forEach((cell: HTMLElement) => {
        cell.style.textAlign = 'right';
        cell.style.minWidth = '80px'; // Garante espaço mínimo para os pontos
      });
      
      exportDiv.appendChild(tableClone);
      
      // Adiciona ao DOM temporariamente para captura
      document.body.appendChild(exportDiv);
      
      // Captura a imagem
      const canvas = await html2canvas(exportDiv, {
        scale: 2, // Escala maior para melhor qualidade
        backgroundColor: '#0A3B23',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: exportDiv.offsetWidth,
        height: exportDiv.offsetHeight,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        x: 0,
        y: 0,
      });
      
      // Remove o elemento temporário
      document.body.removeChild(exportDiv);
      
      // Converte para URL e faz o download
      const imageUrl = canvas.toDataURL('image/png');
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
