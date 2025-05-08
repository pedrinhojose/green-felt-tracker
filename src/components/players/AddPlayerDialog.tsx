
import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayerForm } from "./PlayerForm";

interface AddPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newPlayer: {
    name: string;
    photoUrl?: string;
    phone?: string;
    city?: string;
  };
  setNewPlayer: React.Dispatch<React.SetStateAction<{
    name: string;
    photoUrl?: string;
    phone?: string;
    city?: string;
  }>>;
  isSaving: boolean;
  handleAddPlayer: () => Promise<void>;
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

export function AddPlayerDialog({
  isOpen,
  onOpenChange,
  newPlayer,
  setNewPlayer,
  isSaving,
  handleAddPlayer,
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
}: AddPlayerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) stopCamera();
      onOpenChange(open);
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Jogador</DialogTitle>
        </DialogHeader>
        
        <PlayerForm
          player={newPlayer}
          setPlayer={setNewPlayer}
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
            onClick={handleAddPlayer}
            disabled={isSaving || isProcessing || !newPlayer.name.trim()}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            {isSaving ? "Salvando..." : "Adicionar"}
            {isProcessing && " (Processando imagem...)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
