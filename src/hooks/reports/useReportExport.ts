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
  
  // Função para criar uma versão otimizada de alta qualidade do relatório - MELHORADA
  const createHighQualityElement = (originalElement: HTMLElement): HTMLElement => {
    console.log("=== createHighQualityElement DEBUG ===");
    console.log("Original element dimensions:", originalElement.offsetWidth, "x", originalElement.offsetHeight);
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Calcular largura ótima baseada no conteúdo
    const optimalWidth = calculateOptimalWidth(originalElement);
    console.log("Optimal width calculated:", optimalWidth);
    
    // Aplicar estilos otimizados para alta qualidade
    clone.style.width = `${optimalWidth}px`;
    clone.style.maxWidth = 'none';
    clone.style.fontSize = '16px';
    clone.style.lineHeight = '1.5';
    clone.style.padding = '24px';
    clone.style.margin = '0';
    clone.style.backgroundColor = '#1a2e35';
    clone.style.color = '#FFFFFF';
    clone.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    clone.style.minHeight = '600px'; // Garantir altura mínima
    clone.style.boxSizing = 'border-box';
    
    // Aplicar cores CSS personalizadas diretamente
    const style = document.createElement('style');
    style.textContent = `
      .poker-gold { color: #D4AF37 !important; }
      .bg-poker-green { background-color: #0F5132 !important; }
      .bg-poker-dark-green { background-color: #0A3D29 !important; }
      .text-poker-gold { color: #D4AF37 !important; }
      .border-poker-gold { border-color: #D4AF37 !important; }
      .text-green-400 { color: #4ADE80 !important; }
      .text-red-400 { color: #F87171 !important; }
      .text-blue-400 { color: #60A5FA !important; }
      .text-gray-400 { color: #9CA3AF !important; }
      .text-amber-700 { color: #B45309 !important; }
      .border-gray-700 { border-color: #374151 !important; }
      .bg-gray-700 { background-color: #374151 !important; }
    `;
    clone.appendChild(style);
    
    // Otimizar tabelas para alta qualidade
    const tables = clone.querySelectorAll('table');
    console.log("Found tables:", tables.length);
    
    tables.forEach((table, tableIndex) => {
      console.log(`Processing table ${tableIndex + 1}`);
      (table as HTMLElement).style.fontSize = '14px';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.tableLayout = 'auto';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.backgroundColor = '#1a2e35';
      (table as HTMLElement).style.color = '#FFFFFF';
      
      // Ajustar células para melhor legibilidade
      const cells = table.querySelectorAll('td, th');
      console.log(`Found ${cells.length} cells in table ${tableIndex + 1}`);
      
      cells.forEach((cell, index) => {
        const cellElement = cell as HTMLElement;
        cellElement.style.padding = '8px 12px';
        cellElement.style.whiteSpace = 'nowrap';
        cellElement.style.overflow = 'visible';
        cellElement.style.textOverflow = 'clip';
        cellElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        cellElement.style.minWidth = 'fit-content';
        cellElement.style.backgroundColor = 'inherit';
        cellElement.style.color = 'inherit';
        
        // Dar mais espaço para colunas financeiras (últimas colunas)
        const isFinancialColumn = index >= cells.length - 4;
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
    
    // Otimizar cards para layout melhor
    const cards = clone.querySelectorAll('[class*="grid"]');
    console.log("Found grid elements:", cards.length);
    
    cards.forEach(card => {
      (card as HTMLElement).style.display = 'grid';
      (card as HTMLElement).style.gap = '16px';
      (card as HTMLElement).style.marginBottom = '16px';
    });
    
    // Garantir que avatares sejam visíveis
    const avatars = clone.querySelectorAll('[class*="h-16"], [class*="w-16"], [class*="h-12"], [class*="w-12"]');
    avatars.forEach(avatar => {
      (avatar as HTMLElement).style.width = '48px';
      (avatar as HTMLElement).style.height = '48px';
      (avatar as HTMLElement).style.display = 'flex';
      (avatar as HTMLElement).style.alignItems = 'center';
      (avatar as HTMLElement).style.justifyContent = 'center';
    });
    
    console.log("Clone element prepared with dimensions:", clone.style.width, "x", clone.style.minHeight);
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
  
  // Exportar relatório como imagem de alta qualidade - CORRIGIDO E MELHORADO
  const exportReportAsImage = async (reportElementId: string, filename: string) => {
    console.log("=== exportReportAsImage DEBUG ===");
    console.log("Searching for element with ID:", reportElementId);
    console.log("Target filename:", filename);
    
    setIsExportingImage(true);
    try {
      const reportElement = document.getElementById(reportElementId);
      if (!reportElement) {
        console.error(`Element with id ${reportElementId} not found`);
        console.log("Available elements with IDs:", Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
      }
      
      console.log("Found element:", reportElement);
      console.log("Element dimensions:", reportElement.offsetWidth, "x", reportElement.offsetHeight);
      console.log("Element children count:", reportElement.children.length);
      
      // Verificar se o elemento tem conteúdo
      if (reportElement.children.length === 0) {
        console.error("Element has no children, nothing to export");
        return;
      }
      
      // Criar versão otimizada de alta qualidade
      const highQualityElement = createHighQualityElement(reportElement);
      
      // Adicionar temporariamente ao DOM (fora da tela)
      highQualityElement.style.position = 'absolute';
      highQualityElement.style.left = '-9999px';
      highQualityElement.style.top = '0';
      highQualityElement.style.zIndex = '-1';
      highQualityElement.style.visibility = 'hidden';
      document.body.appendChild(highQualityElement);
      
      console.log("Added temporary element to DOM");
      
      // Aguardar renderização completa
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 500); // tempo maior para garantir renderização
          });
        });
      });
      
      console.log("Starting canvas capture...");
      
      // Configurações otimizadas para alta qualidade
      const canvas = await html2canvas(highQualityElement, {
        scale: 2, // escala reduzida mas ainda alta qualidade
        backgroundColor: '#1a2e35',
        logging: true, // habilitar logs para debug
        useCORS: true,
        allowTaint: true,
        width: highQualityElement.offsetWidth,
        height: Math.max(highQualityElement.offsetHeight, 600),
        scrollX: 0,
        scrollY: 0,
        windowWidth: highQualityElement.offsetWidth,
        windowHeight: Math.max(highQualityElement.offsetHeight, 600),
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          console.log("Clone document created, applying final styles...");
          const clonedElement = clonedDoc.getElementById(reportElementId);
          if (clonedElement) {
            clonedElement.style.visibility = 'visible';
          }
        }
      });
      
      // Remover elemento temporário
      document.body.removeChild(highQualityElement);
      
      console.log(`Canvas created with dimensions: ${canvas.width}x${canvas.height}`);
      
      // Verificar se o canvas tem conteúdo
      const ctx = canvas.getContext('2d');
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData?.data.some(pixel => pixel !== 0);
      
      if (!hasContent) {
        console.error("Canvas appears to be empty");
        return;
      }
      
      // Converter para PNG com máxima qualidade
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = imgData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Imagem exportada com sucesso: ${canvas.width}x${canvas.height}`);
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
