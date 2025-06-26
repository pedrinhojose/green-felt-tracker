
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createGameReport } from './reports/gameReportGenerator';
import { pokerDB } from '../db';

/**
 * Função para calcular dimensões necessárias dinamicamente
 */
const calculateRequiredDimensions = (element: HTMLElement): { width: number; height: number } => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.width = 'max-content';
  clone.style.height = 'auto';
  clone.style.maxWidth = 'none';
  clone.style.overflow = 'visible';
  
  document.body.appendChild(clone);
  const requiredWidth = Math.max(clone.scrollWidth, clone.offsetWidth);
  const requiredHeight = Math.max(clone.scrollHeight, clone.offsetHeight);
  document.body.removeChild(clone);
  
  return { width: requiredWidth, height: requiredHeight };
};

/**
 * Exporta um relatório de partida como PDF
 */
export const exportGameReport = async (gameId: string, players: any[]) => {
  try {
    const game = await pokerDB.getGame(gameId);
    if (!game) throw new Error('Partida não encontrada');
    
    const season = game.seasonId ? await pokerDB.getSeason(game.seasonId) : null;
    const seasonName = season?.name || 'Temporada Desconhecida';
    
    const reportElement = await createGameReport(game, players, seasonName);
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;
    
    // Cabeçalho do PDF
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(`RELATÓRIO DA PARTIDA #${game.number.toString().padStart(3, '0')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Temporada: ${seasonName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.text(`Data: ${new Date(game.date).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Dados dos jogadores para a tabela - incluindo coluna de pontos
    const tableData = game.players.map(gamePlayer => {
      const player = players.find(p => p.id === gamePlayer.playerId);
      return [
        player?.name || 'Desconhecido',
        gamePlayer.position?.toString() || '-',
        gamePlayer.points.toString(), // Nova coluna de pontos
        gamePlayer.buyIn ? 'R$ 50,00' : '-',
        gamePlayer.rebuys.toString(),
        gamePlayer.addons ? 'R$ 25,00' : '-',
        `R$ ${(gamePlayer.prize || 0).toFixed(2).replace('.', ',')}`
      ];
    });
    
    autoTable(pdf, {
      head: [['Jogador', 'Pos.', 'Pontos', 'Buy-in', 'Rebuys', 'Add-on', 'Prêmio']],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [155, 135, 245] }
    });
    
    // Convert blob to URL for opening in new tab
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    return pdfUrl;
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    throw error;
  }
};

/**
 * Exporta um relatório de partida como imagem - VERSÃO CORRIGIDA PARA EVITAR CORTES
 */
export const exportGameReportAsImage = async (gameId: string, players: any[]) => {
  try {
    console.log("=== GAME REPORT IMAGE EXPORT DEBUG ===");
    console.log("Starting game report image export for gameId:", gameId);
    
    const game = await pokerDB.getGame(gameId);
    if (!game) throw new Error('Partida não encontrada');
    
    const season = game.seasonId ? await pokerDB.getSeason(game.seasonId) : null;
    const seasonName = season?.name || 'Temporada Desconhecida';
    
    // Criar elemento do relatório
    const reportElement = await createGameReport(game, players, seasonName);
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    console.log("Is mobile device:", isMobile);
    
    // Calcular dimensões necessárias
    document.body.appendChild(reportElement);
    const { width: requiredWidth, height: requiredHeight } = calculateRequiredDimensions(reportElement);
    console.log("Required dimensions:", requiredWidth, "x", requiredHeight);
    
    // Configurar dimensões otimizadas - aumentar altura para evitar cortes
    const optimalWidth = isMobile 
      ? Math.max(requiredWidth + 80, 600)  // Mobile: mínimo 600px + padding
      : Math.max(requiredWidth + 60, 800); // Desktop: mínimo 800px + padding
    
    const optimalHeight = requiredHeight + 80; // Altura com padding extra aumentado
    
    reportElement.style.width = `${optimalWidth}px`;
    reportElement.style.height = `${optimalHeight}px`;
    reportElement.style.minWidth = `${optimalWidth}px`;
    reportElement.style.minHeight = `${optimalHeight}px`;
    reportElement.style.maxWidth = `${optimalWidth}px`;
    reportElement.style.overflow = 'visible';
    reportElement.style.position = 'absolute';
    reportElement.style.top = '-99999px';
    reportElement.style.left = '0';
    reportElement.style.zIndex = '-1';
    
    // Aguardar renderização
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Final export dimensions:", reportElement.offsetWidth, "x", reportElement.offsetHeight);
    
    // Configurações otimizadas do html2canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Sempre usar escala alta
      backgroundColor: '#1a1f2c',
      logging: true,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: optimalWidth,
      height: optimalHeight,
      windowWidth: optimalWidth,
      windowHeight: optimalHeight,
      x: 0,
      y: 0
    });
    
    console.log(`Canvas created: ${canvas.width}x${canvas.height}`);
    
    // Remove o elemento temporário
    document.body.removeChild(reportElement);
    
    // Converte para URL e retorna
    const imageUrl = canvas.toDataURL('image/png', 1.0);
    console.log("Image URL generated successfully, length:", imageUrl.length);
    
    return imageUrl;
  } catch (error) {
    console.error("Erro ao exportar relatório como imagem:", error);
    throw new Error("Não foi possível exportar o relatório como imagem.");
  }
};
