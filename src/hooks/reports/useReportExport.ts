
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function useReportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  
  // Função para criar uma versão otimizada para mobile do relatório
  const createMobileOptimizedElement = (originalElement: HTMLElement): HTMLElement => {
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Aplicar estilos otimizados para mobile
    clone.style.width = '390px'; // Largura padrão de mobile
    clone.style.maxWidth = '100%';
    clone.style.fontSize = '14px';
    clone.style.lineHeight = '1.4';
    clone.style.padding = '16px';
    clone.style.backgroundColor = '#1a2e35';
    clone.style.color = '#FFFFFF';
    
    // Otimizar tabelas para mobile
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      (table as HTMLElement).style.fontSize = '11px';
      (table as HTMLElement).style.width = '100%';
      
      // Ajustar células para serem mais compactas
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.padding = '4px 2px';
        (cell as HTMLElement).style.whiteSpace = 'nowrap';
        (cell as HTMLElement).style.overflow = 'hidden';
        (cell as HTMLElement).style.textOverflow = 'ellipsis';
      });
    });
    
    // Ajustar cards para layout mobile
    const cards = clone.querySelectorAll('[class*="grid-cols"]');
    cards.forEach(card => {
      (card as HTMLElement).style.display = 'flex';
      (card as HTMLElement).style.flexDirection = 'column';
      (card as HTMLElement).style.gap = '8px';
    });
    
    // Ajustar avatares para serem menores
    const avatars = clone.querySelectorAll('[class*="h-16"], [class*="w-16"]');
    avatars.forEach(avatar => {
      (avatar as HTMLElement).style.width = '40px';
      (avatar as HTMLElement).style.height = '40px';
    });
    
    return clone;
  };
  
  // Exportar relatório como PDF otimizado para A4
  const exportReportAsPdf = async (reportElementId: string, filename: string) => {
    setIsExporting(true);
    try {
      const reportElement = document.getElementById(reportElementId);
      if (!reportElement) {
        console.error(`Element with id ${reportElementId} not found`);
        return;
      }
      
      // Configurações otimizadas para PDF A4
      const canvas = await html2canvas(reportElement, {
        scale: 1.5, // Escala menor para otimizar para impressão
        backgroundColor: '#ffffff', // Fundo branco para impressão
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 794, // Largura A4 em pixels (210mm)
        height: 1123, // Altura A4 em pixels (297mm)
        scrollX: 0,
        scrollY: 0
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG com alta qualidade
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Se o conteúdo for muito alto, ajustar para caber na página
      if (imgHeight > 297) { // A4 height in mm
        const scaledHeight = 297;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(imgData, 'JPEG', (210 - scaledWidth) / 2, 0, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }
      
      pdf.save(filename);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Exportar relatório como imagem otimizada para mobile
  const exportReportAsImage = async (reportElementId: string, filename: string) => {
    setIsExportingImage(true);
    try {
      const reportElement = document.getElementById(reportElementId);
      if (!reportElement) {
        console.error(`Element with id ${reportElementId} not found`);
        return;
      }
      
      // Criar versão otimizada para mobile
      const mobileElement = createMobileOptimizedElement(reportElement);
      
      // Adicionar temporariamente ao DOM (fora da tela)
      mobileElement.style.position = 'absolute';
      mobileElement.style.left = '-9999px';
      mobileElement.style.top = '0';
      document.body.appendChild(mobileElement);
      
      // Aguardar um frame para garantir que o elemento seja renderizado
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const canvas = await html2canvas(mobileElement, {
        scale: 2, // Alta resolução para mobile
        backgroundColor: '#1a2e35',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 390, // Largura mobile padrão
        scrollX: 0,
        scrollY: 0
      });
      
      // Remover elemento temporário
      document.body.removeChild(mobileElement);
      
      const imgData = canvas.toDataURL('image/png', 1.0); // PNG com máxima qualidade
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = imgData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
