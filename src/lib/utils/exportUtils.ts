import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Game, Player } from '../db/models';
import { formatDate, formatCurrency } from './dateUtils';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportGameReport = async (gameId: string, game: Game, players: Player[]): Promise<string> => {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(`Relatório de Partida #${game.number.toString().padStart(3, '0')}`, 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Data: ${formatDate(game.date)}`, 14, 30);
    
    // Add prize pool
    doc.text(`Premiação Total: ${formatCurrency(game.totalPrizePool)}`, 14, 37);
    
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
    
    doc.autoTable({
      head: [['Pos.', 'Nome', 'Buy-in', 'Rebuys', 'Add-ons', 'Janta', 'Prêmio', 'Pontos', 'Saldo']],
      body: tableData,
      startY: 45,
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
