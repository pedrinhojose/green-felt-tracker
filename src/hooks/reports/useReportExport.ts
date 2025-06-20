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
  
  // Função para criar versão otimizada SIMPLIFICADA - só ajustes essenciais
  const createOptimizedElement = (originalElement: HTMLElement, isMobile: boolean): HTMLElement => {
    console.log("=== createOptimizedElement DEBUG ===");
    console.log("Creating optimized version for:", isMobile ? 'mobile' : 'desktop');
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Aplicar apenas ajustes mínimos e essenciais
    if (isMobile) {
      // Mobile: apenas reduzir largura e manter proporções
      clone.style.width = '375px';
      clone.style.maxWidth = '375px';
      clone.style.fontSize = '12px';
    } else {
      // Desktop: manter largura original
      clone.style.width = '800px';
      clone.style.maxWidth = '800px';
      clone.style.fontSize = '14px';
    }
    
    // Ajustes básicos comuns
    clone.style.margin = '0';
    clone.style.padding = '16px';
    clone.style.boxSizing = 'border-box';
    clone.style.backgroundColor = '#1a2e35';
    clone.style.color = 'white';
    
    console.log("Optimized element created with dimensions:", clone.style.width);
    console.log("Element content length:", clone.innerHTML.length);
    
    return clone;
  };
  
  // Exportar relatório como imagem - VERSÃO CORRIGIDA E SIMPLIFICADA
  const exportReportAsImage = async (reportElementId: string, filename: string) => {
    console.log("=== SIMPLIFIED IMAGE EXPORT DEBUG ===");
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
      
      // Criar versão otimizada com ajustes mínimos
      const optimizedElement = createOptimizedElement(reportElement, isMobile);
      
      console.log("Optimized element created");
      console.log("Optimized element content length:", optimizedElement.innerHTML.length);
      
      // Adicionar temporariamente ao DOM para renderização
      optimizedElement.style.position = 'absolute';
      optimizedElement.style.top = '-9999px';
      optimizedElement.style.left = '0';
      optimizedElement.style.visibility = 'visible'; // Mudança: tornar visível
      optimizedElement.style.zIndex = '-1';
      document.body.appendChild(optimizedElement);
      
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Starting html2canvas with simplified options...");
      
      // Configurações simplificadas e otimizadas do html2canvas
      const canvasOptions = {
        backgroundColor: '#1a2e35',
        scale: isMobile ? 1.5 : 1, // Reduzir escala para evitar problemas
        logging: true,
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc: Document) => {
          console.log("html2canvas cloned document");
          const clonedElement = clonedDoc.body.querySelector(`[style*="position: absolute"]`);
          if (clonedElement) {
            console.log("Found cloned element in document");
          }
        }
      };
      
      const canvas = await html2canvas(optimizedElement, canvasOptions);
      
      console.log(`Canvas created successfully: ${canvas.width}x${canvas.height}`);
      
      // Remover elemento temporário
      document.body.removeChild(optimizedElement);
      
      // Verificar se o canvas tem conteúdo válido
      if (canvas.width === 0 || canvas.height === 0) {
        console.error("Canvas has invalid dimensions");
        throw new Error("Canvas dimensions are invalid");
      }
      
      // Verificar se o canvas não está vazio
      const ctx = canvas.getContext('2d');
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData?.data.some(pixel => pixel !== 0);
      
      if (!hasContent) {
        console.error("Canvas appears to be empty");
        throw new Error("Canvas content is empty");
      }
      
      // Converter para PNG com qualidade máxima
      const dataURL = canvas.toDataURL('image/png', 1.0);
      console.log("Data URL generated, length:", dataURL.length);
      
      if (dataURL === 'data:,' || dataURL.length < 100) {
        console.error("Invalid data URL generated");
        throw new Error("Failed to generate valid image data");
      }
      
      // Criar e iniciar download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Download completed successfully");
      
    } catch (error) {
      console.error("Error in image export:", error);
      
      // Fallback: tentar exportar o elemento original sem otimizações
      console.log("Attempting fallback export...");
      try {
        const originalElement = document.getElementById(reportElementId);
        if (originalElement) {
          const canvas = await html2canvas(originalElement, {
            backgroundColor: '#1a2e35',
            scale: 1,
            logging: true
          });
          
          const dataURL = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log("Fallback export completed");
        }
      } catch (fallbackError) {
        console.error("Fallback export also failed:", fallbackError);
      }
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
