
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Game, Player } from '../db/models';
import { formatDate, formatCurrency } from './dateUtils';
import { pokerDB } from '../db'; // Updated import path
import { createGameReport } from './reports/gameReportGenerator';

export const exportGameReport = async (gameId: string, players: Player[]): Promise<string> => {
  try {
    // Buscar o jogo diretamente do banco de dados usando o ID
    const game = await pokerDB.getGame(gameId);
    if (!game) {
      throw new Error("Jogo não encontrado");
    }
    
    // Buscar informações da temporada
    const season = await pokerDB.getSeason(game.seasonId);
    if (!season) {
      throw new Error("Temporada não encontrada");
    }
    
    const doc = new jsPDF();
    
    // Adiciona o plugin autoTable ao jsPDF
    autoTable(doc, {});

    // Add title
    doc.setFontSize(18);
    doc.text(`Relatório de Partida #${game.number.toString().padStart(3, '0')}`, 14, 22);
    
    // Add season name
    doc.setFontSize(14);
    doc.text(`Temporada: ${season.name}`, 14, 30);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Data: ${formatDate(game.date)}`, 14, 38);
    
    // Add prize pool
    doc.text(`Premiação Total: ${formatCurrency(game.totalPrizePool)}`, 14, 45);
    
    // Create players table
    const playerMap = new Map(players.map(player => [player.id, player]));
    
    const tableData = game.players.map(gamePlayer => {
      const player = playerMap.get(gamePlayer.playerId);
      return [
        gamePlayer.position ? gamePlayer.position.toString() : '-',
        player?.name || 'Jogador Desconhecido',
        gamePlayer.buyIn ? 'Sim' : 'Não',
        gamePlayer.rebuys.toString(),
        gamePlayer.addons.toString(),
        gamePlayer.joinedDinner ? 'Sim' : 'Não',
        formatCurrency(gamePlayer.prize),
        gamePlayer.points.toString(),
        formatCurrency(gamePlayer.balance),
      ];
    }).sort((a, b) => {
      const posA = a[0] === '-' ? 999 : parseInt(a[0]);
      const posB = b[0] === '-' ? 999 : parseInt(b[0]);
      return posA - posB;
    });
    
    // Usar autoTable como função independente ao invés de método do doc
    autoTable(doc, {
      head: [['Pos.', 'Nome', 'Buy-in', 'Rebuys', 'Add-ons', 'Janta', 'Prêmio', 'Pontos', 'Saldo']],
      body: tableData,
      startY: 53, // Ajustado para acomodar a linha adicional da temporada
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [10, 59, 35] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Salva e retorna o PDF como URL de blob
    const blobURL = doc.output('bloburl');
    return blobURL.toString();
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw new Error("Falha ao gerar o relatório do jogo");
  }
};

/**
 * Exporta o relatório do jogo como uma imagem otimizada para visualização em celular
 * @param gameId ID do jogo a ser exportado
 * @param players Lista de jogadores
 * @returns URL da imagem gerada
 */
export const exportGameReportAsImage = async (gameId: string, players: Player[]): Promise<string> => {
  try {
    // Buscar o jogo do banco de dados
    const game = await pokerDB.getGame(gameId);
    if (!game) {
      throw new Error("Jogo não encontrado");
    }
    
    // Buscar informações da temporada
    const season = await pokerDB.getSeason(game.seasonId);
    if (!season) {
      throw new Error("Temporada não encontrada");
    }
    
    // Criar o elemento HTML do relatório
    const reportElement = createGameReport(game, players, season.name);
    
    // Adicionar ao DOM temporariamente para captura
    document.body.appendChild(reportElement);
    
    // Capturar como imagem
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Escala maior para melhor qualidade
      backgroundColor: '#1A1F2C',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    // Remover do DOM
    document.body.removeChild(reportElement);
    
    // Converter para URL e retornar
    const imageUrl = canvas.toDataURL('image/png');
    return imageUrl;
  } catch (error) {
    console.error("Erro ao exportar relatório como imagem:", error);
    throw new Error("Falha ao gerar a imagem do relatório");
  }
};

export const exportScreenshot = async (elementId: string): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }
  
  // Configure the options for the screenshot
  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true,
  });
  
  return canvas.toDataURL('image/png');
};

export const downloadBackup = (json: string, filename: string = 'apa-poker-backup.json') => {
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
