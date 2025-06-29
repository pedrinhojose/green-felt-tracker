
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileText } from 'lucide-react';
import { usePlayerStatsExport } from '@/hooks/statistics/usePlayerStatsExport';

interface PlayerExportButtonsProps {
  playerId: string;
  playerName: string;
}

export function PlayerExportButtons({ playerId, playerName }: PlayerExportButtonsProps) {
  const { toast } = useToast();
  const { 
    isExportingPdf, 
    isExportingImage, 
    exportPlayerStatsPdf, 
    exportPlayerStatsImage 
  } = usePlayerStatsExport();

  const handleExportPdf = async () => {
    try {
      await exportPlayerStatsPdf(playerId, playerName);
      toast({
        title: "PDF Exportado",
        description: "As estatísticas foram exportadas em PDF com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportImage = async () => {
    try {
      await exportPlayerStatsImage(playerId, playerName);
      toast({
        title: "Imagem Exportada",
        description: "As estatísticas foram exportadas como imagem com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a imagem.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Button
        onClick={handleExportPdf}
        disabled={isExportingPdf}
        className="bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        {isExportingPdf ? "Exportando..." : "Exportar PDF"}
        <FileText className="ml-2 h-4 w-4" />
      </Button>
      
      <Button
        onClick={handleExportImage}
        disabled={isExportingImage}
        className="bg-poker-gold hover:bg-poker-gold/80 text-black"
        size="sm"
      >
        {isExportingImage ? "Exportando..." : "Exportar Imagem"}
        <Download className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
