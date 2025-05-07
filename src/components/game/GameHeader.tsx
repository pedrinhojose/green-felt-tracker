
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/dateUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { FileImage, Image } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface GameHeaderProps {
  gameNumber: number;
  gameDate: Date;
  isFinished: boolean;
  isExporting: boolean;
  isExportingImage: boolean;
  isFinishing: boolean;
  onExportReport: () => void;
  onExportReportAsImage: () => void;
  onFinishGame: () => void;
}

export default function GameHeader({
  gameNumber,
  gameDate,
  isFinished,
  isExporting,
  isExportingImage,
  isFinishing,
  onExportReport,
  onExportReportAsImage,
  onFinishGame,
}: GameHeaderProps) {
  const navigate = useNavigate();
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // Função para finalizar o jogo e mostrar o diálogo de relatório
  const handleFinishGame = async () => {
    await onFinishGame();
    setShowReportDialog(true);
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Partida #{gameNumber.toString().padStart(3, '0')}
        </h2>
        <p className="text-muted-foreground">{formatDate(gameDate)}</p>
      </div>
      
      <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
        <Button
          onClick={onExportReport}
          disabled={isExporting}
          variant="outline"
          size="sm"
        >
          {isExporting ? "Exportando..." : "Exportar Relatório"}
          <FileImage className="ml-2 h-4 w-4" />
        </Button>
        
        <Button
          onClick={onExportReportAsImage}
          disabled={isExportingImage}
          variant="outline"
          size="sm"
        >
          {isExportingImage ? "Exportando..." : "Exportar Imagem"}
          <Image className="ml-2 h-4 w-4" />
        </Button>
        
        {isFinished ? (
          <Button
            onClick={() => navigate('/partidas')}
            variant="outline"
            size="sm"
          >
            Voltar
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                size="sm"
              >
                Encerrar Partida
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar Partida</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja encerrar esta partida? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFinishGame}
                  disabled={isFinishing}
                >
                  {isFinishing ? "Encerrando..." : "Encerrar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {/* Diálogo de confirmação para exportar relatório após finalização da partida */}
        <Sheet open={showReportDialog} onOpenChange={setShowReportDialog}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Partida Encerrada</SheetTitle>
              <SheetDescription>
                Partida #{gameNumber.toString().padStart(3, '0')} finalizada com sucesso! Deseja obter o relatório detalhado da partida?
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex flex-col space-y-3">
              <Button 
                onClick={() => {
                  onExportReport();
                  setShowReportDialog(false);
                }}
                disabled={isExporting}
                variant="default"
                className="w-full"
              >
                {isExporting ? "Exportando..." : "Exportar como PDF"}
                <FileImage className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => {
                  onExportReportAsImage();
                  setShowReportDialog(false);
                }}
                disabled={isExportingImage}
                variant="outline"
                className="w-full"
              >
                {isExportingImage ? "Exportando..." : "Exportar como Imagem"}
                <Image className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => {
                  setShowReportDialog(false);
                  navigate('/partidas');
                }}
                variant="ghost"
                className="w-full"
              >
                Voltar à Lista de Partidas
              </Button>
            </div>
            <SheetFooter className="pt-4">
              <Button 
                onClick={() => setShowReportDialog(false)} 
                variant="ghost"
                size="sm"
              >
                Fechar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
