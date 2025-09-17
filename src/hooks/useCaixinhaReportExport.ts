import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCurrency } from '@/lib/utils/dateUtils';

interface CaixinhaTransaction {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  created_by: string;
  type: 'deposit' | 'withdrawal';
}

interface CaixinhaReportData {
  seasonName: string;
  organizationName: string;
  totalAccumulated: number;
  totalDeposits: number;
  totalWithdrawals: number;
  availableBalance: number;
  participatingPlayersCount: number;
  transactions: CaixinhaTransaction[];
}

export const useCaixinhaReportExport = () => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const generatePdfReport = async (data: CaixinhaReportData): Promise<jsPDF> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório da Caixinha', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Organização: ${data.organizationName}`, margin, 35);
    doc.text(`Temporada: ${data.seasonName}`, margin, 42);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 49);

    // Financial Summary
    let yPosition = 65;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const summaryData = [
      ['Total dos Jogos:', formatCurrency(data.totalAccumulated)],
      ['Total de Depósitos:', formatCurrency(data.totalDeposits)],
      ['Total de Saques:', formatCurrency(data.totalWithdrawals)],
      ['Saldo Disponível:', formatCurrency(data.availableBalance)],
      ['Jogadores Participantes:', data.participatingPlayersCount.toString()],
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(label, margin, yPosition);
      doc.text(value, margin + 80, yPosition);
      yPosition += 8;
    });

    // Transactions History
    yPosition += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Histórico de Transações', margin, yPosition);

    yPosition += 10;

    if (data.transactions.length > 0) {
      const tableData = data.transactions.map(transaction => [
        new Date(transaction.withdrawal_date).toLocaleDateString('pt-BR'),
        transaction.type === 'deposit' ? 'Depósito' : 'Saque',
        formatCurrency(transaction.amount),
        transaction.description || '-'
      ]);

      (doc as any).autoTable({
        head: [['Data', 'Tipo', 'Valor', 'Descrição']],
        body: tableData,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 'auto' }
        }
      });
    } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma transação registrada.', margin, yPosition);
    }

    // Footer
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Gerado pelo APA Poker Club', pageWidth / 2, footerY, { align: 'center' });

    return doc;
  };

  const exportCaixinhaReportAsPdf = async (data: CaixinhaReportData, filename: string = 'relatorio-caixinha') => {
    setIsExportingPdf(true);
    
    try {
      const doc = await generatePdfReport(data);
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportCaixinhaReportAsImage = async (elementId: string, filename: string = 'relatorio-caixinha') => {
    setIsExportingImage(true);
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#1a1f2c',
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    } finally {
      setIsExportingImage(false);
    }
  };

  return {
    isExportingPdf,
    isExportingImage,
    exportCaixinhaReportAsPdf,
    exportCaixinhaReportAsImage,
  };
};