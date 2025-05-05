
import html2canvas from 'html2canvas';
import { RankingEntry, Season } from '../db/models';
import { useToast } from "@/components/ui/use-toast";

/**
 * Função para gerar e exportar uma imagem do ranking como PNG
 * @param sortedRankings Lista ordenada de jogadores no ranking
 * @param activeSeason Temporada ativa atual
 * @param getInitials Função para obter as iniciais de um nome
 * @param getMedalEmoji Função para obter o emoji correspondente à posição
 * @returns Promise resolvida com a URL da imagem gerada
 */
export const exportRankingAsImage = async (
  sortedRankings: RankingEntry[],
  activeSeason: Season | null,
  getInitials: (name: string) => string,
  getMedalEmoji: (position: number) => string,
): Promise<string> => {
  try {
    // Cria um elemento temporário para renderizar o ranking com estilo otimizado para exportação
    const exportDiv = document.createElement('div');
    exportDiv.id = 'ranking-export';
    (exportDiv as HTMLElement).style.padding = '15px';
    (exportDiv as HTMLElement).style.backgroundColor = '#0A3B23';
    (exportDiv as HTMLElement).style.borderRadius = '12px';
    (exportDiv as HTMLElement).style.width = '100%';
    (exportDiv as HTMLElement).style.maxWidth = '400px';  // Largura ideal para visualização
    (exportDiv as HTMLElement).style.margin = '0 auto';
    (exportDiv as HTMLElement).style.overflow = 'visible';
    
    // Adiciona cabeçalho - mais compacto
    const header = document.createElement('div');
    (header as HTMLElement).style.display = 'flex';
    (header as HTMLElement).style.justifyContent = 'space-between';
    (header as HTMLElement).style.alignItems = 'center';
    (header as HTMLElement).style.marginBottom = '10px';
    (header as HTMLElement).style.padding = '6px 10px';
    (header as HTMLElement).style.borderBottom = '2px solid #072818';
    
    const title = document.createElement('h2');
    (title as HTMLElement).textContent = 'Ranking do Poker';
    (title as HTMLElement).style.fontSize = '18px';
    (title as HTMLElement).style.fontWeight = 'bold';
    (title as HTMLElement).style.color = '#ffffff';
    
    const subtitle = document.createElement('p');
    (subtitle as HTMLElement).textContent = activeSeason ? activeSeason.name : 'Temporada Ativa';
    (subtitle as HTMLElement).style.color = '#D4AF37';
    (subtitle as HTMLElement).style.fontSize = '12px';
    
    const titleContainer = document.createElement('div');
    titleContainer.appendChild(title);
    titleContainer.appendChild(subtitle);
    
    header.appendChild(titleContainer);
    
    // Adicionar a data da exportação
    const dateContainer = document.createElement('div');
    (dateContainer as HTMLElement).textContent = new Date().toLocaleDateString('pt-BR');
    (dateContainer as HTMLElement).style.color = '#ffffff';
    (dateContainer as HTMLElement).style.fontSize = '11px';
    
    header.appendChild(dateContainer);
    
    exportDiv.appendChild(header);
    
    // Criar a tabela de ranking
    const tableElement = document.createElement('table');
    tableElement.style.width = '100%';
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.tableLayout = 'fixed';
    tableElement.style.fontSize = '13px';
    
    // Cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.borderBottom = '1px solid #072818';
    
    const headers = ['#', 'Jogador', 'Jogos', 'Pontos'];
    const headerWidths = ['36px', '200px', '40px', '50px'];
    
    headers.forEach((headerText, index) => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.padding = '4px 6px';
      th.style.textAlign = index === 0 || index === 1 ? 'left' : 'center';
      th.style.width = headerWidths[index];
      th.style.color = '#ffffff';
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    tableElement.appendChild(thead);
    
    // Corpo da tabela
    const tbody = document.createElement('tbody');
    
    sortedRankings.forEach((ranking, index) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #072818';
      
      // Coluna de posição
      const positionCell = document.createElement('td');
      positionCell.style.padding = '4px 6px';
      const medalSpan = document.createElement('span');
      medalSpan.textContent = getMedalEmoji(index);
      medalSpan.style.display = 'inline-flex';
      medalSpan.style.alignItems = 'center';
      medalSpan.style.justifyContent = 'center';
      medalSpan.style.width = '24px';
      medalSpan.style.height = '24px';
      medalSpan.style.backgroundColor = '#072818';
      medalSpan.style.borderRadius = '50%';
      medalSpan.style.textAlign = 'center';
      positionCell.appendChild(medalSpan);
      row.appendChild(positionCell);
      
      // Coluna do jogador (otimizada para ocupar menos espaço)
      const playerCell = document.createElement('td');
      playerCell.style.padding = '4px 6px';
      playerCell.style.maxWidth = '200px';
      playerCell.style.overflow = 'hidden';
      playerCell.style.whiteSpace = 'nowrap';
      playerCell.style.textOverflow = 'ellipsis';
      
      const playerDiv = document.createElement('div');
      playerDiv.style.display = 'flex';
      playerDiv.style.alignItems = 'center';
      playerDiv.style.gap = '4px'; // Gap reduzido
      
      // Avatar
      const avatarDiv = document.createElement('div');
      avatarDiv.style.width = '20px'; // Avatar menor
      avatarDiv.style.height = '20px'; // Avatar menor
      avatarDiv.style.borderRadius = '50%';
      avatarDiv.style.backgroundColor = '#1e3a8a';
      avatarDiv.style.color = 'white';
      avatarDiv.style.display = 'flex';
      avatarDiv.style.alignItems = 'center';
      avatarDiv.style.justifyContent = 'center';
      avatarDiv.style.fontSize = '9px'; // Fonte menor
      avatarDiv.style.fontWeight = 'bold';
      avatarDiv.style.flexShrink = '0';
      
      if (ranking.photoUrl) {
        const img = document.createElement('img');
        img.src = ranking.photoUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        avatarDiv.appendChild(img);
      } else {
        avatarDiv.textContent = getInitials(ranking.playerName);
      }
      
      // Nome do jogador
      const nameDiv = document.createElement('div');
      nameDiv.textContent = ranking.playerName;
      nameDiv.style.fontWeight = '500';
      nameDiv.style.overflow = 'hidden';
      nameDiv.style.textOverflow = 'ellipsis';
      nameDiv.style.color = '#ffffff';
      
      playerDiv.appendChild(avatarDiv);
      playerDiv.appendChild(nameDiv);
      playerCell.appendChild(playerDiv);
      row.appendChild(playerCell);
      
      // Jogos
      const gamesCell = document.createElement('td');
      gamesCell.textContent = ranking.gamesPlayed.toString();
      gamesCell.style.textAlign = 'center';
      gamesCell.style.padding = '4px 6px';
      gamesCell.style.color = '#ffffff';
      row.appendChild(gamesCell);
      
      // Pontos
      const pointsCell = document.createElement('td');
      pointsCell.textContent = ranking.totalPoints.toString();
      pointsCell.style.textAlign = 'center';
      pointsCell.style.fontWeight = 'bold';
      pointsCell.style.padding = '4px 6px';
      pointsCell.style.color = '#D4AF37'; // Cor dourada
      row.appendChild(pointsCell);
      
      tbody.appendChild(row);
    });
    
    tableElement.appendChild(tbody);
    exportDiv.appendChild(tableElement);
    
    // Adiciona ao DOM temporariamente para captura
    document.body.appendChild(exportDiv);
    
    // Captura a imagem
    const canvas = await html2canvas(exportDiv, {
      scale: 2, // Escala maior para melhor qualidade
      backgroundColor: '#0A3B23',
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    // Remove o elemento temporário
    document.body.removeChild(exportDiv);
    
    // Converte para URL e retorna
    const imageUrl = canvas.toDataURL('image/png');
    return imageUrl;
  } catch (error) {
    console.error("Erro ao exportar ranking:", error);
    throw new Error("Não foi possível exportar o ranking como imagem.");
  }
};

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
