
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
import { FileImage, Image, Trash2, Share, Edit3, Save, X } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
interface GameHeaderProps {
  gameNumber: number;
  gameDate: Date;
  isFinished: boolean;
  isExporting: boolean;
  isExportingImage: boolean;
  isFinishing: boolean;
  isDeleting: boolean;
  isGeneratingLink: boolean;
  isEditingFinishedGame?: boolean;
  onExportReport: () => void;
  onExportReportAsImage: () => void;
  onExportLink: () => void;
  onFinishGame: () => void;
  onDeleteGame: () => void;
  onReopenGame?: () => void;
  onSaveEditedGame?: () => void;
  onCancelEdit?: () => void;
}

export default function GameHeader({
  gameNumber,
  gameDate,
  isFinished,
  isExporting,
  isExportingImage,
  isFinishing,
  isDeleting,
  isGeneratingLink,
  isEditingFinishedGame = false,
  onExportReport,
  onExportReportAsImage,
  onExportLink,
  onFinishGame,
  onDeleteGame,
  onReopenGame,
  onSaveEditedGame,
  onCancelEdit,
}: GameHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isGuest = user?.email?.toLowerCase?.() === 'visitante@apapoker.com';
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // Função para finalizar o jogo e mostrar o diálogo de relatório
  const handleFinishGame = async () => {
    await onFinishGame();
    setShowReportDialog(true);
  };
  
  return (
    <div className={`flex flex-col ${isMobile ? 'space-y-4' : 'sm:flex-row'} justify-between items-start ${isMobile ? '' : 'sm:items-center'} mb-6`}>
      <div>
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
          Partida #{gameNumber.toString().padStart(3, '0')}
          {isEditingFinishedGame && (
            <span className="ml-2 text-sm bg-orange-500 text-white px-2 py-1 rounded">
              EDITANDO
            </span>
          )}
        </h2>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>{formatDate(gameDate)}</p>
      </div>
      
      <div className={`${isMobile ? 'w-full' : 'mt-4 sm:mt-0'} flex ${isMobile ? 'flex-col space-y-2' : 'flex-wrap gap-2'}`}>
        <Button
          onClick={onExportReport}
          disabled={isExporting}
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          className={isMobile ? "w-full justify-center" : ""}
        >
          {isExporting ? "Exportando..." : isMobile ? "PDF" : "Exportar Relatório"}
          <FileImage className="ml-2 h-4 w-4" />
        </Button>
        
        <Button
          onClick={onExportReportAsImage}
          disabled={isExportingImage}
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          className={isMobile ? "w-full justify-center" : ""}
        >
          {isExportingImage ? "Exportando..." : isMobile ? "Imagem" : "Exportar Imagem"}
          <Image className="ml-2 h-4 w-4" />
        </Button>
        
        {isFinished && (
          <Button
            onClick={onExportLink}
            disabled={isGeneratingLink}
            variant="outline"
            size={isMobile ? "sm" : "sm"}
            className={isMobile ? "w-full justify-center" : ""}
          >
            {isGeneratingLink ? "Gerando..." : isMobile ? "Link" : "Exportar Link"}
            <Share className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {/* Botões específicos para edição de partida finalizada */}
        {isEditingFinishedGame && (
          <>
            <Button
              onClick={onSaveEditedGame}
              variant="default"
              size={isMobile ? "sm" : "sm"}
              className={`${isMobile ? "w-full justify-center" : ""} bg-green-600 hover:bg-green-700`}
            >
              <Save className="mr-2 h-4 w-4" />
              {isMobile ? "Salvar" : "Salvar Alterações"}
            </Button>
            
            <Button
              onClick={onCancelEdit}
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={`${isMobile ? "w-full justify-center" : ""} border-red-500 text-red-500 hover:bg-red-500 hover:text-white`}
            >
              <X className="mr-2 h-4 w-4" />
              {isMobile ? "Cancelar" : "Cancelar Edição"}
            </Button>
          </>
        )}

        {isFinished && !isEditingFinishedGame ? (
          <>
            <Button
              onClick={onReopenGame}
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={`${isMobile ? "w-full justify-center" : ""} border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white`}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isMobile ? "Editar" : "Editar Partida"}
            </Button>
            
            <Button
              onClick={() => navigate('/games')}
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={isMobile ? "w-full justify-center" : ""}
            >
              Voltar
            </Button>
          </>
        ) : !isFinished && !isEditingFinishedGame ? (
          <>
            {/* Botão para cancelar partida */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  disabled={isDeleting}
                  className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${isMobile ? "w-full justify-center" : ""}`}
                >
                  {isDeleting ? "Cancelando..." : isMobile ? "Cancelar" : "Cancelar Partida"}
                  <Trash2 className="ml-2 h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Partida</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar esta partida? Esta ação não pode ser desfeita.
                    {isFinished && " Como a partida está finalizada, isso também reverterá os rankings e ajustes no jackpot."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteGame}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? "Cancelando..." : "Cancelar Partida"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Botão para encerrar partida */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  size={isMobile ? "sm" : "sm"}
                  className={isMobile ? "w-full justify-center" : ""}
                  disabled={isGuest}
                  title={isGuest ? "Ação indisponível no modo visitante" : undefined}
                >
                  {isMobile ? "Encerrar" : "Encerrar Partida"}
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
          </>
        ) : null}
        
        {/* Sheet for report export after finishing game */}
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
                  navigate('/games');
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
