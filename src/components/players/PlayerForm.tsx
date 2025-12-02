
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlayerPhotoManager } from "./PlayerPhotoManager";
import { cn } from "@/lib/utils";

interface PlayerFormProps {
  player: { 
    id?: string;
    name: string; 
    photoUrl?: string;
    phone?: string;
    city?: string;
    birthDate?: Date;
  };
  setPlayer: React.Dispatch<React.SetStateAction<any>>;
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

export function PlayerForm({
  player,
  setPlayer,
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
}: PlayerFormProps) {
  // Customize capturePhoto to update player state
  const handleCapturePhoto = async () => {
    const imageUrl = await capturePhoto();
    if (imageUrl) {
      setPlayer({ ...player, photoUrl: imageUrl });
    }
  };
  
  // Customize file upload to update player state
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = await handleFileUpload(e);
    if (imageUrl) {
      setPlayer({ ...player, photoUrl: imageUrl });
    }
    // Reset the file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="playerName">Nome</Label>
        <Input
          id="playerName"
          value={player.name}
          onChange={(e) => setPlayer({ ...player, name: e.target.value })}
          placeholder="Nome do jogador"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="playerPhone">Telefone</Label>
        <Input
          id="playerPhone"
          value={player.phone || ""}
          onChange={(e) => setPlayer({ ...player, phone: e.target.value })}
          placeholder="(00) 00000-0000"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="playerCity">Cidade</Label>
        <Input
          id="playerCity"
          value={player.city || ""}
          onChange={(e) => setPlayer({ ...player, city: e.target.value })}
          placeholder="Cidade do jogador"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Data de Nascimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !player.birthDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {player.birthDate ? (
                format(player.birthDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione a data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={player.birthDate}
              onSelect={(date) => setPlayer({ ...player, birthDate: date })}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label>Foto do Jogador</Label>
        <PlayerPhotoManager
          photoUrl={player.photoUrl}
          isCameraActive={isCameraActive}
          isProcessing={isProcessing}
          videoRef={videoRef}
          fileInputRef={fileInputRef}
          startCamera={startCamera}
          stopCamera={stopCamera}
          capturePhoto={handleCapturePhoto}
          handleFileUpload={handleFileInputChange}
          clearPhoto={clearPhoto}
        />
      </div>
    </div>
  );
}
