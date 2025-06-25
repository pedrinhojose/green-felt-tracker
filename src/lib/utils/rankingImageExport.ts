
import html2canvas from 'html2canvas';
import { RankingEntry, Season } from '../db/models';
import { createRankingContainer, createRankingHeader, createRankingFooter } from './rankingHtmlGenerator';
import { createRankingTable } from './rankingTableGenerator';

/**
 * Função para calcular largura necessária dinamicamente
 */
const calculateRequiredWidth = (element: HTMLElement): number => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.width = 'max-content';
  clone.style.maxWidth = 'none';
  
  document.body.appendChild(clone);
  const requiredWidth = Math.max(clone.scrollWidth, clone.offsetWidth);
  document.body.removeChild(clone);
  
  return requiredWidth;
};

/**
 * Função para gerar e exportar uma imagem do ranking como PNG - OTIMIZADA PARA MOBILE
 * @param sortedRankings Lista ordenada de jogadores no ranking
 * @param activeSeason Temporada ativa atual
 * @param getInitials Função para obter as iniciais de um nome
 * @param getMedalEmoji Função opcional para obter emoji de medalha baseado na posição
 * @returns Promise resolvida com a URL da imagem gerada
 */
export const exportRankingAsImage = async (
  sortedRankings: RankingEntry[],
  activeSeason: Season | null,
  getInitials: (name: string) => string,
  getMedalEmoji?: (position: number) => string
): Promise<string> => {
  try {
    console.log("=== RANKING EXPORT DEBUG ===");
    console.log("Starting ranking export with", sortedRankings.length, "players");
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    console.log("Is mobile device:", isMobile);
    
    // Cria um elemento temporário para renderizar o ranking
    const exportDiv = createRankingContainer();
    
    // Adiciona cabeçalho
    const header = createRankingHeader(activeSeason);
    exportDiv.appendChild(header);
    
    // Criar a tabela de ranking
    const tableElement = createRankingTable(sortedRankings, getInitials, getMedalEmoji);
    exportDiv.appendChild(tableElement);
    
    // Adiciona rodapé
    const footer = createRankingFooter();
    exportDiv.appendChild(footer);
    
    // Calcular largura necessária
    document.body.appendChild(exportDiv);
    const requiredWidth = calculateRequiredWidth(exportDiv);
    console.log("Required width calculated:", requiredWidth);
    
    // Configurar largura otimizada baseada no conteúdo
    const optimalWidth = isMobile 
      ? Math.max(requiredWidth + 80, 600)  // Mobile: mínimo 600px + padding
      : Math.max(requiredWidth + 60, 700); // Desktop: mínimo 700px + padding
    
    exportDiv.style.width = `${optimalWidth}px`;
    exportDiv.style.maxWidth = `${optimalWidth}px`;
    exportDiv.style.minWidth = `${optimalWidth}px`;
    exportDiv.style.padding = '20px';
    exportDiv.style.boxSizing = 'border-box';
    
    // Otimizar tabela para não cortar
    const table = exportDiv.querySelector('table');
    if (table) {
      (table as HTMLElement).style.tableLayout = 'auto';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.minWidth = 'max-content';
    }
    
    // Aguardar renderização
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log("Final export dimensions:", exportDiv.offsetWidth, "x", exportDiv.offsetHeight);
    
    // Captura a imagem com configurações otimizadas
    const canvas = await html2canvas(exportDiv, {
      scale: 2, // Sempre usar escala alta
      backgroundColor: '#111827',
      logging: true,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: exportDiv.offsetWidth,
      windowHeight: exportDiv.offsetHeight,
    });
    
    console.log(`Canvas created: ${canvas.width}x${canvas.height}`);
    
    // Remove o elemento temporário
    document.body.removeChild(exportDiv);
    
    // Converte para URL e retorna
    const imageUrl = canvas.toDataURL('image/png', 1.0);
    console.log("Image URL generated successfully, length:", imageUrl.length);
    
    return imageUrl;
  } catch (error) {
    console.error("Erro ao exportar ranking:", error);
    throw new Error("Não foi possível exportar o ranking como imagem.");
  }
};
