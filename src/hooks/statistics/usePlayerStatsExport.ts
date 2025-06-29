
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePoker } from '@/contexts/PokerContext';
import { usePlayerStats } from '@/hooks/reports/usePlayerStats';
import { usePlayerRating } from '@/hooks/usePlayerRating';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';

export function usePlayerStatsExport() {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const { games, players, activeSeason } = usePoker();
  const { playerStats } = usePlayerStats();
  const playerRatings = usePlayerRating(playerStats);

  // Função para detectar mobile
  const isMobileDevice = (): boolean => {
    return window.innerWidth <= 768;
  };

  // Exportar estatísticas como PDF
  const exportPlayerStatsPdf = async (playerId: string, playerName: string) => {
    setIsExportingPdf(true);
    
    try {
      const playerData = playerStats.find(p => p.playerId === playerId);
      const playerRating = playerRatings.find(r => r.playerId === playerId);
      const playerGames = games.filter(game => 
        game.seasonId === activeSeason?.id && 
        game.players.some(p => p.playerId === playerId)
      );

      if (!playerData) {
        throw new Error('Dados do jogador não encontrados');
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPosition = 20;

      // Cabeçalho
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(`ESTATÍSTICAS DO JOGADOR`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(16);
      pdf.text(playerName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Informações da temporada
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(`Temporada: ${activeSeason?.name || 'N/A'}`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition + 5, { align: 'center' });
      yPosition += 25;

      // Estatísticas Principais
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("RESUMO GERAL", 20, yPosition);
      yPosition += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      
      const mainStats = [
        ['Partidas Jogadas:', playerData.gamesPlayed.toString()],
        ['Vitórias:', playerData.victories.toString()],
        ['Taxa de Vitórias:', `${playerData.winRate.toFixed(1)}%`],
        ['Posição Média:', playerData.averagePosition.toFixed(1)],
        ['Total de Pontos:', playerData.totalPoints.toString()],
        ['ROI:', `${playerData.roi.toFixed(1)}%`],
        ['Taxa ITM:', `${playerData.itmRate.toFixed(1)}%`],
        ['Total Investido:', formatCurrency(playerData.totalInvestment)],
        ['Total Ganhos:', formatCurrency(playerData.totalWinnings)],
        ['Saldo Final:', formatCurrency(playerData.balance)],
        ['Maior Prêmio:', formatCurrency(playerData.biggestPrize)],
      ];

      if (playerRating) {
        mainStats.push(['Rating (Estrelas):', `${playerRating.stars}/5 (${playerRating.rating})`]);
      }

      mainStats.forEach(([label, value]) => {
        pdf.text(label, 20, yPosition);
        pdf.text(value, 100, yPosition);
        yPosition += 6;
      });

      yPosition += 15;

      // Histórico de Partidas
      if (playerGames.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("HISTÓRICO DE PARTIDAS", 20, yPosition);
        yPosition += 15;

        // Preparar dados da tabela
        const sortedGames = [...playerGames].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const tableData = sortedGames.map(game => {
          const gamePlayer = game.players.find(p => p.playerId === playerId);
          if (!gamePlayer) return [];

          return [
            `#${game.number.toString().padStart(3, '0')}`,
            formatDate(game.date),
            gamePlayer.position?.toString() || '-',
            gamePlayer.points.toString(),
            gamePlayer.rebuys.toString(),
            gamePlayer.addons.toString(),
            gamePlayer.joinedDinner ? 'Sim' : 'Não',
            formatCurrency(gamePlayer.prize),
            formatCurrency(gamePlayer.balance)
          ];
        });

        autoTable(pdf, {
          head: [['Partida', 'Data', 'Pos.', 'Pts', 'RB', 'AD', 'Janta', 'Prêmio', 'Saldo']],
          body: tableData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 25 },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15, halign: 'center' },
            5: { cellWidth: 15, halign: 'center' },
            6: { cellWidth: 15, halign: 'center' },
            7: { cellWidth: 25, halign: 'right' },
            8: { cellWidth: 25, halign: 'right' },
          },
        });
      }

      // Salvar PDF
      const filename = `estatisticas-${playerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Exportar estatísticas como imagem
  const exportPlayerStatsImage = async (playerId: string, playerName: string) => {
    setIsExportingImage(true);

    try {
      const elementId = `player-stats-${playerId}`;
      const element = document.getElementById(elementId);
      
      if (!element) {
        throw new Error('Elemento de estatísticas não encontrado');
      }

      const isMobile = isMobileDevice();
      
      // Calcular dimensões necessárias
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.visibility = 'hidden';
      clone.style.width = 'max-content';
      clone.style.maxWidth = 'none';
      
      document.body.appendChild(clone);
      const requiredWidth = Math.max(clone.scrollWidth, clone.offsetWidth);
      const requiredHeight = Math.max(clone.scrollHeight, clone.offsetHeight);
      document.body.removeChild(clone);

      // Configurar dimensões otimizadas
      const optimalWidth = isMobile 
        ? Math.max(requiredWidth + 80, 600)  
        : Math.max(requiredWidth + 60, 900);
      
      const optimalHeight = requiredHeight + 80;

      // Criar elemento temporário otimizado
      const tempElement = element.cloneNode(true) as HTMLElement;
      tempElement.style.position = 'absolute';
      tempElement.style.top = '-99999px';
      tempElement.style.left = '0';
      tempElement.style.width = `${optimalWidth}px`;
      tempElement.style.height = `${optimalHeight}px`;
      tempElement.style.minWidth = `${optimalWidth}px`;
      tempElement.style.minHeight = `${optimalHeight}px`;
      tempElement.style.maxWidth = `${optimalWidth}px`;
      tempElement.style.overflow = 'visible';
      tempElement.style.padding = '20px';
      tempElement.style.boxSizing = 'border-box';
      tempElement.style.backgroundColor = '#1a2e35';
      
      document.body.appendChild(tempElement);

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capturar imagem
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        backgroundColor: '#1a2e35',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: optimalWidth,
        height: optimalHeight,
        windowWidth: optimalWidth,
        windowHeight: optimalHeight,
      });

      // Remover elemento temporário
      document.body.removeChild(tempElement);

      // Fazer download
      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `estatisticas-${playerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      throw error;
    } finally {
      setIsExportingImage(false);
    }
  };

  return {
    isExportingPdf,
    isExportingImage,
    exportPlayerStatsPdf,
    exportPlayerStatsImage
  };
}
