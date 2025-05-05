
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
      (exportDiv as HTMLElement).style.padding = '15px';
      (exportDiv as HTMLElement).style.backgroundColor = '#0A3B23';
      (exportDiv as HTMLElement).style.borderRadius = '12px';
      (exportDiv as HTMLElement).style.width = '100%';
      (exportDiv as HTMLElement).style.maxWidth = '450px';  // Reduz ainda mais a largura máxima
      (exportDiv as HTMLElement).style.margin = '0 auto';
      (exportDiv as HTMLElement).style.overflow = 'visible';
      
      // Adiciona cabeçalho - mais compacto
      const header = document.createElement('div');
      (header as HTMLElement).style.display = 'flex';
      (header as HTMLElement).style.justifyContent = 'space-between';
      (header as HTMLElement).style.alignItems = 'center';
      (header as HTMLElement).style.marginBottom = '10px';  // Reduz ainda mais o espaço
      (header as HTMLElement).style.padding = '6px 10px';  // Reduz ainda mais o padding
      (header as HTMLElement).style.borderBottom = '2px solid #072818';
      
      const title = document.createElement('h2');
      (title as HTMLElement).textContent = 'Ranking do Poker';
      (title as HTMLElement).style.fontSize = '18px';  // Fonte ainda menor
      (title as HTMLElement).style.fontWeight = 'bold';
      (title as HTMLElement).style.color = '#ffffff';
      
      const subtitle = document.createElement('p');
      (subtitle as HTMLElement).textContent = activeSeason ? activeSeason.name : 'Temporada Ativa';
      (subtitle as HTMLElement).style.color = '#D4AF37';
      (subtitle as HTMLElement).style.fontSize = '12px';  // Fonte ainda menor
      
      const titleContainer = document.createElement('div');
      titleContainer.appendChild(title);
      titleContainer.appendChild(subtitle);
      
      header.appendChild(titleContainer);
      
      // Adicionar a data da exportação
      const dateContainer = document.createElement('div');
      (dateContainer as HTMLElement).textContent = new Date().toLocaleDateString('pt-BR');
      (dateContainer as HTMLElement).style.color = '#ffffff';
      (dateContainer as HTMLElement).style.fontSize = '11px';  // Fonte ainda menor
      
      header.appendChild(dateContainer);
      
      exportDiv.appendChild(header);
      
      // Clona a tabela de ranking
      const tableClone = rankingTableRef.current.cloneNode(true) as HTMLElement;
      
      // Ajusta o estilo da tabela para telas menores
      tableClone.style.width = '100%';
      tableClone.style.borderCollapse = 'collapse';
      tableClone.style.tableLayout = 'fixed';
      tableClone.style.fontSize = '13px'; // Fonte ainda menor
      
      // Ajusta o estilo das células para otimizar espaço
      const cells = tableClone.querySelectorAll('td, th');
      cells.forEach((cell) => {
        const cellElement = cell as HTMLElement;
        cellElement.style.whiteSpace = 'nowrap';
        cellElement.style.padding = '4px 6px'; // Padding ainda menor
        cellElement.style.overflow = 'visible';
      });
      
      // Configurando larguras específicas para cada coluna
      const columns = tableClone.querySelectorAll('tr');
      columns.forEach((row) => {
        const rowElement = row as HTMLElement;
        const cells = rowElement.querySelectorAll('td, th');
        if (cells.length > 0) {
          // Posição (# com medalha)
          if (cells[0]) {
            (cells[0] as HTMLElement).style.width = '36px';
            (cells[0] as HTMLElement).style.maxWidth = '36px';
          }
          
          // Nome do jogador - Reduz ainda mais o espaço para nome
          if (cells[1]) {
            (cells[1] as HTMLElement).style.maxWidth = '140px'; // Reduz o tamanho máximo da coluna de nomes
            (cells[1] as HTMLElement).style.width = '140px';
            (cells[1] as HTMLElement).style.overflow = 'hidden';
            (cells[1] as HTMLElement).style.textOverflow = 'ellipsis';
            
            // Tenta acessar o texto do nome do jogador para verificar se está sendo cortado
            const playerNameDiv = cells[1].querySelector('.font-medium');
            if (playerNameDiv) {
              (playerNameDiv as HTMLElement).style.width = '100%';
              (playerNameDiv as HTMLElement).style.overflow = 'hidden';
              (playerNameDiv as HTMLElement).style.textOverflow = 'ellipsis';
            }
            
            // Reduz ainda mais o tamanho do Avatar
            const avatar = cells[1].querySelector('.h-10.w-10, .h-7.w-7') as HTMLElement;
            if (avatar) {
              avatar.style.height = '24px';
              avatar.style.width = '24px';
              avatar.style.minWidth = '24px'; // Evita que o avatar comprima
              avatar.classList.remove('h-10', 'w-10', 'h-7', 'w-7');
              avatar.classList.add('h-6', 'w-6');
              
              // Ajustar a gap entre o avatar e o nome
              const playerDiv = cells[1].querySelector('.flex.items-center.gap-3');
              if (playerDiv) {
                (playerDiv as HTMLElement).classList.remove('gap-3');
                (playerDiv as HTMLElement).classList.add('gap-2');
                (playerDiv as HTMLElement).style.gap = '6px'; // Reduz o espaço entre avatar e nome
              }
            }
          }
          
          // Jogos - Ainda mais compacto
          if (cells[2]) {
            (cells[2] as HTMLElement).style.width = '40px';
            (cells[2] as HTMLElement).style.maxWidth = '40px';
            (cells[2] as HTMLElement).style.textAlign = 'center';
          }
          
          // Pontos - Ainda mais compacto
          if (cells[3]) {
            (cells[3] as HTMLElement).style.width = '50px';
            (cells[3] as HTMLElement).style.maxWidth = '50px';
            (cells[3] as HTMLElement).style.textAlign = 'center';
          }
        }
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
