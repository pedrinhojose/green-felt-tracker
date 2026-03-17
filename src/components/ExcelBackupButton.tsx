import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { exportExcelBackup } from "@/lib/utils/excelBackupExport";

export default function ExcelBackupButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExcelBackup();
      toast({
        title: "✅ Backup Excel gerado!",
        description: "Arquivo exportado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao exportar Excel:", error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Exportando..." : "Backup Excel"}
    </Button>
  );
}
