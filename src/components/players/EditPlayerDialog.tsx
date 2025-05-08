
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayerForm } from "./PlayerForm";
import { Player } from "@/lib/db/models";

interface EditPlayerDialogProps {
  editingPlayer: Player | null;
  setEditingPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  isSaving: boolean;
  handleEditPlayer: () => Promise<void>;
  isCameraActive: boolean;
  setIsCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  videoRef: React.RefObject<HTMLVideoElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<string | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  clearPhoto: () => void;
  isProcessing: boolean;
}

export function EditPlayerDialog({
  editingPlayer,
  setEditingPlayer,
  isSaving,
  handleEditPlayer,
  isCameraActive,
  setIsCameraActive,
  videoRef,
  fileInputRef,
  startCamera,
  stopCamera,
  capturePhoto,
  handleFileUpload,
  clearPhoto,
  isProcessing
}: EditPlayerDialogProps) {
  return (
    <Dialog 
      open={!!editingPlayer} 
      onOpenChange={(open) => {
        if (!open) stopCamera();
        if (!open) setEditingPlayer(null);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
        </DialogHeader>
        
        {editingPlayer && (
          <>
            <PlayerForm
              player={editingPlayer}
              setPlayer={setEditingPlayer}
              isCameraActive={isCameraActive}
              setIsCameraActive={setIsCameraActive}
              videoRef={videoRef}
              fileInputRef={fileInputRef}
              startCamera={startCamera}
              stopCamera={stopCamera}
              capturePhoto={capturePhoto}
              handleFileUpload={handleFileUpload}
              clearPhoto={clearPhoto}
              isProcessing={isProcessing}
            />
            
            <DialogFooter>
              <Button
                onClick={handleEditPlayer}
                disabled={isSaving || isProcessing || !editingPlayer.name.trim()}
                className="bg-poker-gold hover:bg-poker-gold/80 text-black"
              >
                {isSaving ? "Salvando..." : "Salvar"}
                {isProcessing && " (Processando imagem...)"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
