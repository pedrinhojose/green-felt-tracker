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
  
  // Função para criar versão otimizada para mobile - SIMPLIFICADA
  const createMobileOptimizedElement = (originalElement: HTMLElement): HTMLElement => {
    console.log("=== createMobileOptimizedElement DEBUG ===");
    console.log("Creating mobile-optimized version...");
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Aplicar apenas estilos essenciais para mobile
    clone.style.width = '375px';
    clone.style.maxWidth = 'none';
    clone.style.fontSize = '12px';
    clone.style.padding = '16px';
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';
    
    // Otimizar apenas as tabelas para mobile
    const tables = clone.querySelectorAll('table');
    console.log("Found tables for mobile optimization:", tables.length);
    
    tables.forEach((table, tableIndex) => {
      console.log(`Processing table ${tableIndex + 1} for mobile`);
      const tableElement = table as HTMLElement;
      
      // Estilos básicos da tabela
      tableElement.style.fontSize = '10px';
      tableElement.style.width = '100%';
      tableElement.style.borderCollapse = 'collapse';
      
      // Ajustar células para mobile
      const cells = table.querySelectorAll('td, th');
      cells.forEach((cell, index) => {
        const cellElement = cell as HTMLElement;
        
        // Larguras específicas para cada coluna (mobile)
        if (index === 0) cellElement.style.width = '20%'; // Nome do jogador
        else if (index >= 6) cellElement.style.width = '12%'; // Colunas financeiras
        else cellElement.style.width = '8%'; // Outras colunas
        
        cellElement.style.padding = '4px 2px';
        cellElement.style.fontSize = cell.tagName === 'TH' ? '9px' : '8px';
        cellElement.style.textAlign = index === 0 ? 'left' : index >= 6 ? 'right' : 'center';
      });
    });
    
    console.log("Mobile-optimized element created");
    return clone;
  };
  
  // Função para criar versão de alta qualidade - SIMPLIFICADA
  const createHighQualityElement = (originalElement: HTMLElement): HTMLElement => {
    console.log("=== createHighQualityElement DEBUG ===");
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Aplicar estilos básicos para desktop
    clone.style.width = '800px';
    clone.style.fontSize = '14px';
    clone.style.padding = '24px';
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';
    
    console.log("High-quality element created");
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
  
  // Exportar relatório como imagem - VERSÃO CORRIGIDA
  const exportReportAsImage = async (reportElementId: string, filename: string) => {
    console.log("=== CORRECTED IMAGE EXPORT DEBUG ===");
    console.log("Target element ID:", reportElementId);
    
    setIsExportingImage(true);
    try {
      const reportElement = document.getElementById(reportElementId);
      if (!reportElement) {
        console.error(`Element with id ${reportElementId} not found`);
        return;
      }
      
      console.log("Element found, dimensions:", reportElement.offsetWidth, "x", reportElement.offsetHeight);
      console.log("Element has content:", reportElement.innerHTML.length > 0);
      
      // Detectar se é mobile
      const isMobile = isMobileDevice();
      console.log("Is mobile device:", isMobile);
      
      // Criar versão otimizada baseada no dispositivo
      const optimizedElement = isMobile 
        ? createMobileOptimizedElement(reportElement)
        : createHighQualityElement(reportElement);
      
      console.log("Optimized element created for:", isMobile ? 'mobile' : 'desktop');
      console.log("Optimized element content length:", optimizedElement.innerHTML.length);
      
      // Adicionar temporariamente ao DOM
      optimizedElement.style.position = 'absolute';
      optimizedElement.style.top = '-9999px';
      optimizedElement.style.left = '0';
      optimizedElement.style.visibility = 'hidden';
      optimizedElement.style.zIndex = '-1';
      document.body.appendChild(optimizedElement);
      
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("Starting html2canvas...");
      
      // Configurações simplificadas do html2canvas
      const canvasOptions = {
        scale: isMobile ? 2 : 1,
        backgroundColor: '#1a2e35',
        logging: true,
        useCORS: true,
        allowTaint: true
      };
      
      const canvas = await html2canvas(optimizedElement, canvasOptions);
      
      console.log(`Canvas created: ${canvas.width}x${canvas.height}`);
      
      // Remover elemento temporário
      document.body.removeChild(optimizedElement);
      
      // Verificar se o canvas tem conteúdo
      if (canvas.width === 0 || canvas.height === 0) {
        console.error("Canvas has no dimensions");
        return;
      }
      
      // Converter para PNG
      const dataURL = canvas.toDataURL('image/png', 1.0);
      console.log("Data URL length:", dataURL.length);
      
      if (dataURL === 'data:,') {
        console.error("Canvas is empty");
        return;
      }
      
      // Criar e baixar
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Download triggered successfully");
      
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
