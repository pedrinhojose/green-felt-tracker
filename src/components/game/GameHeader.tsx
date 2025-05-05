
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

interface GameHeaderProps {
  gameNumber: number;
  gameDate: Date;
  isFinished: boolean;
  isExporting: boolean;
  isFinishing: boolean;
  onExportReport: () => void;
  onFinishGame: () => void;
}

export default function GameHeader({
  gameNumber,
  gameDate,
  isFinished,
  isExporting,
  isFinishing,
  onExportReport,
  onFinishGame,
}: GameHeaderProps) {
  const navigate = useNavigate();
  
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
                  onClick={onFinishGame}
                  disabled={isFinishing}
                >
                  {isFinishing ? "Encerrando..." : "Encerrar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
