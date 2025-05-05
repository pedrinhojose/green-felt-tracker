
import { useState } from 'react';
import { pokerDB } from '../lib/db/database';
import { useToast } from "@/components/ui/use-toast";

export function usePokerUtils() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const exportBackup = async () => {
    try {
      const backupJson = await pokerDB.exportBackup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `apa-poker-backup-${timestamp}.json`;
      
      const blob = new Blob([backupJson], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Backup Exportado",
        description: "O backup foi exportado com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting backup:', error);
      toast({
        title: "Erro no Backup",
        description: "Não foi possível exportar o backup.",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    setIsLoading,
    exportBackup
  };
}
