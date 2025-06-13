
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
      console.log("Element innerHTML length:", reportElement.innerHTML.length);
      
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
      highQualityElement.style.visibility = 'visible'; // Mudança: tornar visível para renderização
      document.body.appendChild(highQualityElement);
      
      console.log("Added temporary element to DOM");
      console.log("Temporary element dimensions:", highQualityElement.offsetWidth, "x", highQualityElement.offsetHeight);
      
      // Aguardar renderização completa - AUMENTADO
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 1000); // Aumentado para 1000ms
          });
        });
      });
      
      console.log("Starting canvas capture...");
      
      // Configurações otimizadas para alta qualidade
      const canvas = await html2canvas(highQualityElement, {
        scale: 2,
        backgroundColor: '#1a2e35',
        logging: true,
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
          const clonedElement = clonedDoc.body.querySelector('[style*="position: absolute"]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.visibility = 'visible';
            clonedElement.style.position = 'static';
          }
        }
      });
      
      // Remover elemento temporário
      document.body.removeChild(highQualityElement);
      
      console.log(`Canvas created with dimensions: ${canvas.width}x${canvas.height}`);
      
      // Verificação melhorada de conteúdo do canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      
      // Verificar se o canvas tem pixels não transparentes
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let hasVisibleContent = false;
      
      // Verificar pixels com alpha > 0 (não completamente transparentes)
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) { // canal alpha
          hasVisibleContent = true;
          break;
        }
      }
      
      console.log("Canvas has visible content:", hasVisibleContent);
      
      // MUDANÇA: Exportar mesmo se parecer vazio para debug
      if (!hasVisibleContent) {
        console.warn("Canvas appears to be empty, but proceeding with export for debugging");
      }
      
      // Converter para PNG com máxima qualidade
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Verificar se a imagem foi gerada
      if (imgData === 'data:,') {
        console.error("Failed to generate image data");
        return;
      }
      
      console.log("Image data generated, size:", imgData.length, "characters");
      
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
