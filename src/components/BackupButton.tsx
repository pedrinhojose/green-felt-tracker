
import { Button } from "@/components/ui/button";
import { usePoker } from "@/contexts/PokerContext";
import { useState } from "react";

export default function BackupButton() {
  const { exportBackup } = usePoker();
  const [isExporting, setIsExporting] = useState(false);
  
  const handleBackup = async () => {
    try {
      setIsExporting(true);
      await exportBackup();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleBackup}
      disabled={isExporting}
      className="w-full bg-poker-navy/80 backdrop-blur-sm hover:bg-poker-navy border border-white/10 rounded-xl"
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exportando...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Fazer Backup
        </>
      )}
    </Button>
  );
}

// Exportação alternativa para compatibilidade
export { BackupButton };
