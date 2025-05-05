
import html2canvas from 'html2canvas';
import { RankingEntry, Season } from '../db/models';
import { createRankingContainer, createRankingHeader, createRankingFooter } from './rankingHtmlGenerator';
import { createRankingTable } from './rankingTableGenerator';

/**
 * Função para gerar e exportar uma imagem do ranking como PNG
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
    
    // Adiciona ao DOM temporariamente para captura
    document.body.appendChild(exportDiv);
    
    // Captura a imagem
    const canvas = await html2canvas(exportDiv, {
      scale: 2, // Escala maior para melhor qualidade
      backgroundColor: '#111827',
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
