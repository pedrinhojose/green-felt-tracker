
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
    pdf.setTextColor(0, 0, 0); // Preto
    pdf.text(`RESULTADO DA PARTIDA #${game.number.toString().padStart(3, '0')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80); // Cinza escuro
    pdf.text(`Temporada: ${seasonName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.text(`Data: ${new Date(game.date).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Ordenar jogadores por posição (igual à imagem)
    const sortedPlayers = [...game.players]
      .sort((a, b) => {
        if (a.position === null) return 1;
        if (b.position === null) return -1;
        return a.position - b.position;
      });

    // Dados dos jogadores para a tabela - estrutura igual à imagem
    const tableData = sortedPlayers.map(gamePlayer => {
      const player = players.find(p => p.id === gamePlayer.playerId);
      return [
        gamePlayer.position?.toString() || '-', // Posição
        player?.name || 'Desconhecido', // Jogador
        gamePlayer.points.toString(), // Pontos (nova coluna)
        gamePlayer.rebuys.toString(), // Rebuys
        gamePlayer.addons.toString(), // Add-ons
        gamePlayer.joinedDinner ? 'Sim' : 'Não', // Janta (nova coluna)
        `R$ ${gamePlayer.balance.toFixed(2).replace('.', ',')}` // Saldo (nova coluna)
      ];
    });
    
    autoTable(pdf, {
      head: [['Pos.', 'Jogador', 'Pontos', 'Rebuys', 'Add-ons', 'Janta', 'Saldo']], // Cabeçalhos atualizados
      body: tableData,
      startY: yPosition,
      styles: { 
        fontSize: 8,
        textColor: [0, 0, 0] // Texto preto
      },
      headStyles: { 
        fillColor: [220, 220, 220], // Cinza claro para cabeçalho
        textColor: [0, 0, 0], // Texto preto
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Cinza muito claro para linhas alternadas
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // Pos.
        1: { cellWidth: 35 }, // Jogador
        2: { cellWidth: 20, halign: 'center' }, // Pontos
        3: { cellWidth: 20, halign: 'center' }, // Rebuys
        4: { cellWidth: 20, halign: 'center' }, // Add-ons
        5: { cellWidth: 20, halign: 'center' }, // Janta
        6: { cellWidth: 25, halign: 'right' }, // Saldo
      },
      // Remover coloração especial do saldo - manter apenas preto
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          const balance = parseFloat(data.cell.text[0].replace('R$ ', '').replace(',', '.'));
          if (balance >= 0) {
            data.cell.styles.fontStyle = 'bold'; // Negrito para valores positivos
          }
        }
      }
    });
    
    // Atualizar yPosition após a tabela
    yPosition = (pdf as any).lastAutoTable.finalY + 20;
    
    // Seção VENCEDORES
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Preto
    pdf.text('VENCEDORES', 20, yPosition);
    yPosition += 15;
    
    // Encontrar os 3 primeiros colocados
    const winners = sortedPlayers.filter(p => p.position && p.position <= 3);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0); // Texto preto
    
    winners.forEach((gamePlayer, index) => {
      const player = players.find(p => p.id === gamePlayer.playerId);
      const playerName = player?.name || 'Desconhecido';
      const position = gamePlayer.position;
      const prize = gamePlayer.prize;
      
      // Usar negrito para destacar posições sem cores
      if (position === 1) {
        pdf.setFont("helvetica", "bold");
      } else {
        pdf.setFont("helvetica", "normal");
      }
      
      pdf.text(`${position}° ${playerName}`, 20, yPosition);
      pdf.text(`R$ ${prize.toFixed(2).replace('.', ',')}`, pageWidth - 40, yPosition, { align: 'right' });
      yPosition += 12;
    });
    
    yPosition += 10;
    
    // Dados da janta e prêmio total
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80); // Cinza escuro
    
    const dinnerParticipants = game.players.filter(p => p.joinedDinner);
    const totalDinnerCost = game.dinnerCost || 0;
    const dinnerPerPerson = dinnerParticipants.length > 0 ? totalDinnerCost / dinnerParticipants.length : 0;
    
    pdf.text('Total Janta:', 20, yPosition);
    pdf.text(`R$ ${totalDinnerCost.toFixed(2).replace('.', ',')}`, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 12;
    
    pdf.text('Janta por Pessoa:', 20, yPosition);
    pdf.text(`R$ ${dinnerPerPerson.toFixed(2).replace('.', ',')}`, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 12;
    
    // Prêmio total em negrito
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0); // Preto
    pdf.text('Prêmio Total:', 20, yPosition);
    pdf.text(`R$ ${game.totalPrizePool.toFixed(2).replace('.', ',')}`, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 20;
    
    // Linha divisória
    pdf.setDrawColor(128, 128, 128);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;
    
    // Dados do Jackpot
    if (season) {
      const playerCount = game.players.filter(p => p.buyIn).length;
      const jackpotContribution = playerCount * (season.financialParams.jackpotContribution || 0);
      const currentJackpot = season.jackpot || 0;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80); // Cinza escuro
      
      pdf.text('Retirado ao Jackpot:', 20, yPosition);
      pdf.text(`R$ ${jackpotContribution.toFixed(2).replace('.', ',')}`, pageWidth - 40, yPosition, { align: 'right' });
      yPosition += 12;
      
      // Jackpot acumulado em negrito
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0); // Preto
      pdf.text('Jackpot Acumulado:', 20, yPosition);
      pdf.text(`R$ ${currentJackpot.toFixed(2).replace('.', ',')}`, pageWidth - 40, yPosition, { align: 'right' });
    }
    
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
