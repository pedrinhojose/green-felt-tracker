import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlayerPerformanceStats, SeasonSummary, JackpotWinner } from "../useSeasonReport";
import { formatCurrency } from "@/lib/utils/dateUtils";

export function useReportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  
  // Função para gerar PDF profissional usando jsPDF
  const generatePdfReport = async (
    seasonName: string,
    seasonSummary: SeasonSummary,
    jackpotWinners: JackpotWinner[],
    totalJackpot: number,
    playerStats: PlayerPerformanceStats[]
  ) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;
    
    // Configurar fonte
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    
    // Título principal
    pdf.text(`RELATÓRIO DA TEMPORADA: ${seasonName.toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Data de geração
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('pt-BR');
    pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Seção 1: Resumo da Temporada
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("RESUMO DA TEMPORADA", 20, yPosition);
    yPosition += 10;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Total de Partidas: ${seasonSummary.totalGames}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total de Jogadores: ${seasonSummary.totalPlayers}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Premiação: ${formatCurrency(seasonSummary.totalPrizePool)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Buy-ins: ${formatCurrency(seasonSummary.totalBuyIns)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Rebuys: ${formatCurrency(seasonSummary.totalRebuys)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Add-ons: ${formatCurrency(seasonSummary.totalAddons)}`, 20, yPosition);
    yPosition += 15;
    
    // Seção 2: Ganhadores do Jackpot
    if (jackpotWinners.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("GANHADORES DO JACKPOT", 20, yPosition);
      yPosition += 10;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(`Valor Total do Jackpot: ${formatCurrency(totalJackpot)}`, 20, yPosition);
      yPosition += 10;
      
      jackpotWinners.forEach((winner, index) => {
        pdf.text(`${winner.position}º Lugar: ${winner.playerName} - ${formatCurrency(winner.jackpotAmount)}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 15;
    }
    
    // Seção 3: Tabela de Desempenho dos Jogadores
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("DESEMPENHO DOS JOGADORES", 20, yPosition);
    yPosition += 15;
    
    // Configurar dados da tabela
    const tableColumns = [
      'Jogador',
      'J',
      'V', 
      'RB',
      'Pos. Med',
      'Pontos',
      'Maior Prêmio',
      'Ganhos',
      'Perdas',
      'Saldo'
    ];
    
    const tableRows = playerStats.map(player => [
      player.playerName,
      player.gamesPlayed.toString(),
      player.victories.toString(),
      player.totalRebuys.toString(),
      player.averagePosition > 0 ? player.averagePosition.toFixed(1) : "-",
      (player.totalPoints || 0).toString(),
      formatCurrency(player.biggestPrize),
      formatCurrency(player.totalWinnings),
      formatCurrency(player.totalInvestment),
      formatCurrency(player.balance)
    ]);
    
    // Gerar tabela usando autoTable
    autoTable(pdf, {
      head: [tableColumns],
      body: tableRows,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Jogador
        1: { cellWidth: 10, halign: 'center' }, // J
        2: { cellWidth: 10, halign: 'center' }, // V
        3: { cellWidth: 10, halign: 'center' }, // RB
        4: { cellWidth: 15, halign: 'center' }, // Pos. Med
        5: { cellWidth: 15, halign: 'center' }, // Pontos
        6: { cellWidth: 20, halign: 'right' }, // Maior Prêmio
        7: { cellWidth: 20, halign: 'right' }, // Ganhos
        8: { cellWidth: 20, halign: 'right' }, // Perdas
        9: { cellWidth: 20, halign: 'right' }, // Saldo
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 10, right: 10 },
    });
    
    // Rodapé
    const finalY = (pdf as any).lastAutoTable.finalY + 20;
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.text(`Relatório gerado automaticamente em ${currentDate}`, pageWidth / 2, finalY, { align: 'center' });
    
    return pdf;
  };
  
  // Função para calcular largura dinâmica baseada no conteúdo
  const calculateOptimalWidth = (originalElement: HTMLElement): number => {
    const table = originalElement.querySelector('table');
    if (!table) return 800; // largura padrão se não houver tabela
    
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return 800;
    
    // Contar colunas da primeira linha
    const firstRow = rows[0];
    const columns = firstRow.querySelectorAll('th, td').length;
    
    // Largura mínima por coluna baseada no tipo de dados
    const minColumnWidth = 120; // largura adequada para dados financeiros
    const padding = 32; // padding lateral
    const minWidth = Math.max(800, (columns * minColumnWidth) + padding);
    
    return Math.min(minWidth, 1400); // máximo de 1400px para manter qualidade
  };
  
  // Função para criar uma versão otimizada de alta qualidade do relatório
  const createHighQualityElement = (originalElement: HTMLElement): HTMLElement => {
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Calcular largura ótima baseada no conteúdo
    const optimalWidth = calculateOptimalWidth(originalElement);
    
    // Aplicar estilos otimizados para alta qualidade
    clone.style.width = `${optimalWidth}px`;
    clone.style.maxWidth = 'none'; // remover limitação de largura
    clone.style.fontSize = '16px'; // fonte maior para melhor legibilidade
    clone.style.lineHeight = '1.5';
    clone.style.padding = '20px';
    clone.style.backgroundColor = '#1a2e35';
    clone.style.color = '#FFFFFF';
    clone.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    // Otimizar tabelas para alta qualidade
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      (table as HTMLElement).style.fontSize = '14px';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.tableLayout = 'auto'; // permitir largura natural
      (table as HTMLElement).style.borderCollapse = 'collapse';
      
      // Ajustar células para melhor legibilidade
      const cells = table.querySelectorAll('td, th');
      cells.forEach((cell, index) => {
        const cellElement = cell as HTMLElement;
        cellElement.style.padding = '8px 12px';
        cellElement.style.whiteSpace = 'nowrap';
        cellElement.style.overflow = 'visible'; // permitir conteúdo visível
        cellElement.style.textOverflow = 'clip';
        cellElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        cellElement.style.minWidth = 'fit-content';
        
        // Dar mais espaço para colunas financeiras (últimas colunas)
        const isFinancialColumn = index >= cells.length - 4; // últimas 4 colunas
        if (isFinancialColumn) {
          cellElement.style.minWidth = '120px';
          cellElement.style.textAlign = 'right';
        }
      });
      
      // Ajustar cabeçalhos
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        (header as HTMLElement).style.backgroundColor = 'rgba(41, 128, 185, 0.8)';
        (header as HTMLElement).style.fontWeight = 'bold';
        (header as HTMLElement).style.color = '#FFFFFF';
      });
    });
    
    // Otimizar cards para layout horizontal
    const cards = clone.querySelectorAll('[class*="grid-cols"]');
    cards.forEach(card => {
      (card as HTMLElement).style.display = 'flex';
      (card as HTMLElement).style.flexDirection = 'row';
      (card as HTMLElement).style.flexWrap = 'wrap';
      (card as HTMLElement).style.gap = '16px';
      (card as HTMLElement).style.justifyContent = 'space-between';
    });
    
    // Ajustar avatares para serem proporcionais
    const avatars = clone.querySelectorAll('[class*="h-16"], [class*="w-16"]');
    avatars.forEach(avatar => {
      (avatar as HTMLElement).style.width = '48px';
      (avatar as HTMLElement).style.height = '48px';
    });
    
    return clone;
  };
  
  // Exportar relatório como PDF otimizado para A4
  const exportReportAsPdf = async (
    seasonName: string,
    seasonSummary: SeasonSummary,
    jackpotWinners: JackpotWinner[],
    totalJackpot: number,
    playerStats: PlayerPerformanceStats[],
    filename: string
  ) => {
    setIsExporting(true);
    try {
      const pdf = await generatePdfReport(seasonName, seasonSummary, jackpotWinners, totalJackpot, playerStats);
      pdf.save(filename);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Exportar relatório como imagem de alta qualidade
  const exportReportAsImage = async (reportElementId: string, filename: string) => {
    setIsExportingImage(true);
    try {
      const reportElement = document.getElementById(reportElementId);
      if (!reportElement) {
        console.error(`Element with id ${reportElementId} not found`);
        return;
      }
      
      // Criar versão otimizada de alta qualidade
      const highQualityElement = createHighQualityElement(reportElement);
      
      // Adicionar temporariamente ao DOM (fora da tela)
      highQualityElement.style.position = 'absolute';
      highQualityElement.style.left = '-9999px';
      highQualityElement.style.top = '0';
      highQualityElement.style.zIndex = '-1';
      document.body.appendChild(highQualityElement);
      
      // Aguardar múltiplos frames para garantir renderização completa
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 100); // tempo extra para fontes carregarem
          });
        });
      });
      
      // Configurações otimizadas para alta qualidade
      const canvas = await html2canvas(highQualityElement, {
        scale: 3, // escala muito alta para qualidade superior
        backgroundColor: '#1a2e35',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: highQualityElement.offsetWidth,
        height: highQualityElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: highQualityElement.offsetWidth,
        windowHeight: highQualityElement.offsetHeight,
        foreignObjectRendering: true, // melhor renderização de texto
        imageTimeout: 15000, // timeout maior para renderização
        removeContainer: true
      });
      
      // Remover elemento temporário
      document.body.removeChild(highQualityElement);
      
      // Converter para PNG com máxima qualidade
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = imgData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Imagem exportada com dimensões: ${canvas.width}x${canvas.height}`);
    } catch (error) {
      console.error("Error exporting image:", error);
    } finally {
      setIsExportingImage(false);
    }
  };

  return {
    isExporting,
    isExportingImage,
    exportReportAsPdf,
    exportReportAsImage
  };
}
