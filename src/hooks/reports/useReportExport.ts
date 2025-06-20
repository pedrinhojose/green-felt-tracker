
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlayerPerformanceStats, SeasonSummary, JackpotWinner } from "../useSeasonReport";
import { formatCurrency } from "@/lib/utils/dateUtils";

export function useReportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  
  // Função para detectar se é mobile
  const isMobileDevice = (): boolean => {
    return window.innerWidth <= 768;
  };
  
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
  
  // Função para calcular largura otimizada baseada no dispositivo
  const calculateOptimalWidth = (originalElement: HTMLElement, isMobile: boolean): number => {
    if (isMobile) {
      // Para mobile, usar largura fixa otimizada
      return 375; // Largura padrão do iPhone
    }
    
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
  
  // Função para criar uma versão otimizada para mobile
  const createMobileOptimizedElement = (originalElement: HTMLElement): HTMLElement => {
    console.log("=== createMobileOptimizedElement DEBUG ===");
    console.log("Creating mobile-optimized version...");
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Aplicar estilos otimizados para mobile
    clone.style.cssText = `
      width: 375px !important;
      max-width: none !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      padding: 16px !important;
      margin: 0 !important;
      background-color: #1a2e35 !important;
      color: #FFFFFF !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      min-height: 400px !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    `;
    
    // Aplicar cores diretamente nos elementos filhos
    const applyInlineStyles = (element: HTMLElement) => {
      // Aplicar cores para elementos com classes específicas
      if (element.classList?.contains('text-poker-gold') || element.textContent?.includes('R$')) {
        element.style.color = '#D4AF37 !important';
      }
      if (element.classList?.contains('bg-poker-green')) {
        element.style.backgroundColor = '#0F5132 !important';
      }
      if (element.classList?.contains('bg-poker-dark-green')) {
        element.style.backgroundColor = '#0A3D29 !important';
      }
      if (element.classList?.contains('text-green-400')) {
        element.style.color = '#4ADE80 !important';
      }
      if (element.classList?.contains('text-red-400')) {
        element.style.color = '#F87171 !important';
      }
      if (element.classList?.contains('text-blue-400')) {
        element.style.color = '#60A5FA !important';
      }
      if (element.classList?.contains('text-gray-400')) {
        element.style.color = '#9CA3AF !important';
      }
      if (element.classList?.contains('text-amber-700')) {
        element.style.color = '#B45309 !important';
      }
      if (element.classList?.contains('border-gray-700')) {
        element.style.borderColor = '#374151 !important';
      }
      if (element.classList?.contains('bg-gray-700')) {
        element.style.backgroundColor = '#374151 !important';
      }
      
      // Aplicar aos filhos
      Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
          applyInlineStyles(child);
        }
      });
    };
    
    applyInlineStyles(clone);
    
    // Otimizar tabelas especificamente para mobile
    const tables = clone.querySelectorAll('table');
    console.log("Found tables for mobile optimization:", tables.length);
    
    tables.forEach((table, tableIndex) => {
      console.log(`Processing table ${tableIndex + 1} for mobile`);
      (table as HTMLElement).style.cssText = `
        font-size: 10px !important;
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        background-color: #1a2e35 !important;
        color: #FFFFFF !important;
        margin: 0 !important;
      `;
      
      // Ajustar células para mobile
      const cells = table.querySelectorAll('td, th');
      console.log(`Found ${cells.length} cells in table ${tableIndex + 1}`);
      
      cells.forEach((cell, index) => {
        const cellElement = cell as HTMLElement;
        const isHeader = cell.tagName === 'TH';
        
        // Larguras específicas para cada coluna (mobile)
        let cellWidth = '8%'; // padrão
        if (index === 0) cellWidth = '20%'; // Nome do jogador
        else if (index >= 6) cellWidth = '12%'; // Colunas financeiras
        
        cellElement.style.cssText = `
          padding: 4px 2px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          width: ${cellWidth} !important;
          max-width: ${cellWidth} !important;
          font-size: ${isHeader ? '9px' : '8px'} !important;
          background-color: inherit !important;
          color: inherit !important;
          text-align: ${index === 0 ? 'left' : index >= 6 ? 'right' : 'center'} !important;
        `;
      });
      
      // Ajustar cabeçalhos
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        (header as HTMLElement).style.cssText += `
          background-color: rgba(41, 128, 185, 0.8) !important;
          font-weight: bold !important;
          color: #FFFFFF !important;
          padding: 4px 2px !important;
          font-size: 9px !important;
        `;
      });
    });
    
    // Otimizar cards para layout mobile
    const cards = clone.querySelectorAll('[class*="grid"]');
    console.log("Found grid elements for mobile:", cards.length);
    
    cards.forEach(card => {
      (card as HTMLElement).style.cssText = `
        display: grid !important;
        gap: 8px !important;
        margin-bottom: 8px !important;
        grid-template-columns: 1fr !important;
      `;
    });
    
    // Garantir que avatares sejam menores em mobile
    const avatars = clone.querySelectorAll('[class*="h-16"], [class*="w-16"], [class*="h-12"], [class*="w-12"]');
    avatars.forEach(avatar => {
      (avatar as HTMLElement).style.cssText = `
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;
    });
    
    console.log("Mobile-optimized element created");
    return clone;
  };
  
  // Função para criar uma versão otimizada de alta qualidade do relatório - DESKTOP
  const createHighQualityElement = (originalElement: HTMLElement): HTMLElement => {
    console.log("=== createHighQualityElement DEBUG ===");
    console.log("Original element dimensions:", originalElement.offsetWidth, "x", originalElement.offsetHeight);
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Calcular largura ótima baseada no conteúdo
    const optimalWidth = calculateOptimalWidth(originalElement, false);
    console.log("Optimal width calculated:", optimalWidth);
    
    // Aplicar estilos otimizados para alta qualidade com valores inline
    clone.style.cssText = `
      width: ${optimalWidth}px !important;
      max-width: none !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
      padding: 24px !important;
      margin: 0 !important;
      background-color: #1a2e35 !important;
      color: #FFFFFF !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      min-height: 600px !important;
      box-sizing: border-box !important;
    `;
    
    // Aplicar cores diretamente nos elementos filhos
    const applyInlineStyles = (element: HTMLElement) => {
      // Aplicar cores para elementos com classes específicas
      if (element.classList?.contains('text-poker-gold') || element.textContent?.includes('R$')) {
        element.style.color = '#D4AF37 !important';
      }
      if (element.classList?.contains('bg-poker-green')) {
        element.style.backgroundColor = '#0F5132 !important';
      }
      if (element.classList?.contains('bg-poker-dark-green')) {
        element.style.backgroundColor = '#0A3D29 !important';
      }
      if (element.classList?.contains('text-green-400')) {
        element.style.color = '#4ADE80 !important';
      }
      if (element.classList?.contains('text-red-400')) {
        element.style.color = '#F87171 !important';
      }
      if (element.classList?.contains('text-blue-400')) {
        element.style.color = '#60A5FA !important';
      }
      if (element.classList?.contains('text-gray-400')) {
        element.style.color = '#9CA3AF !important';
      }
      if (element.classList?.contains('text-amber-700')) {
        element.style.color = '#B45309 !important';
      }
      if (element.classList?.contains('border-gray-700')) {
        element.style.borderColor = '#374151 !important';
      }
      if (element.classList?.contains('bg-gray-700')) {
        element.style.backgroundColor = '#374151 !important';
      }
      
      // Aplicar aos filhos
      Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
          applyInlineStyles(child);
        }
      });
    };
    
    applyInlineStyles(clone);
    
    // Otimizar tabelas para alta qualidade
    const tables = clone.querySelectorAll('table');
    console.log("Found tables:", tables.length);
    
    tables.forEach((table, tableIndex) => {
      console.log(`Processing table ${tableIndex + 1}`);
      (table as HTMLElement).style.cssText = `
        font-size: 14px !important;
        width: 100% !important;
        table-layout: auto !important;
        border-collapse: collapse !important;
        background-color: #1a2e35 !important;
        color: #FFFFFF !important;
      `;
      
      // Ajustar células para melhor legibilidade
      const cells = table.querySelectorAll('td, th');
      console.log(`Found ${cells.length} cells in table ${tableIndex + 1}`);
      
      cells.forEach((cell, index) => {
        const cellElement = cell as HTMLElement;
        cellElement.style.cssText = `
          padding: 8px 12px !important;
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          min-width: fit-content !important;
          background-color: inherit !important;
          color: inherit !important;
        `;
        
        // Dar mais espaço para colunas financeiras (últimas colunas)
        const isFinancialColumn = index >= cells.length - 4;
        if (isFinancialColumn) {
          cellElement.style.minWidth = '120px !important';
          cellElement.style.textAlign = 'right !important';
        }
      });
      
      // Ajustar cabeçalhos
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        (header as HTMLElement).style.cssText = `
          background-color: rgba(41, 128, 185, 0.8) !important;
          font-weight: bold !important;
          color: #FFFFFF !important;
          padding: 8px 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        `;
      });
    });
    
    // Otimizar cards para layout melhor
    const cards = clone.querySelectorAll('[class*="grid"]');
    console.log("Found grid elements:", cards.length);
    
    cards.forEach(card => {
      (card as HTMLElement).style.cssText = `
        display: grid !important;
        gap: 16px !important;
        margin-bottom: 16px !important;
      `;
    });
    
    // Garantir que avatares sejam visíveis
    const avatars = clone.querySelectorAll('[class*="h-16"], [class*="w-16"], [class*="h-12"], [class*="w-12"]');
    avatars.forEach(avatar => {
      (avatar as HTMLElement).style.cssText = `
        width: 48px !important;
        height: 48px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;
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
  
  // Exportar relatório como imagem - VERSÃO OTIMIZADA PARA MOBILE
  const exportReportAsImage = async (reportElementId: string, filename: string) => {
    console.log("=== OPTIMIZED IMAGE EXPORT DEBUG ===");
    console.log("Target element ID:", reportElementId);
    
    setIsExportingImage(true);
    try {
      const reportElement = document.getElementById(reportElementId);
      if (!reportElement) {
        console.error(`Element with id ${reportElementId} not found`);
        return;
      }
      
      console.log("Element found, dimensions:", reportElement.offsetWidth, "x", reportElement.offsetHeight);
      
      // Detectar se é mobile
      const isMobile = isMobileDevice();
      console.log("Is mobile device:", isMobile);
      
      // Criar versão otimizada baseada no dispositivo
      const optimizedElement = isMobile 
        ? createMobileOptimizedElement(reportElement)
        : createHighQualityElement(reportElement);
      
      console.log("Optimized element created for:", isMobile ? 'mobile' : 'desktop');
      
      // Adicionar temporariamente ao DOM
      optimizedElement.style.position = 'absolute';
      optimizedElement.style.top = '-9999px';
      optimizedElement.style.left = '-9999px';
      optimizedElement.style.visibility = 'hidden';
      document.body.appendChild(optimizedElement);
      
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Starting html2canvas with optimized settings...");
      
      // Configurações otimizadas baseadas no dispositivo
      const canvasOptions = {
        scale: isMobile ? 2 : 1,
        backgroundColor: '#1a2e35',
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: isMobile ? 375 : optimizedElement.scrollWidth,
        height: optimizedElement.scrollHeight,
        windowWidth: isMobile ? 375 : window.innerWidth,
        windowHeight: window.innerHeight,
        imageTimeout: 0,
        removeContainer: false
      };
      
      const canvas = await html2canvas(optimizedElement, canvasOptions);
      
      console.log(`Canvas created: ${canvas.width}x${canvas.height} for ${isMobile ? 'mobile' : 'desktop'}`);
      
      // Remover elemento temporário
      document.body.removeChild(optimizedElement);
      
      // Converter para PNG
      const dataURL = canvas.toDataURL('image/png', 1.0);
      console.log("Data URL length:", dataURL.length);
      
      // Criar e baixar
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Download triggered successfully for", isMobile ? 'mobile' : 'desktop', "version");
      
    } catch (error) {
      console.error("Error in image export:", error);
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
