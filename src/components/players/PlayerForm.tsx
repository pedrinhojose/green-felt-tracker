import React, { useState, useEffect } from "react";
import { parse, isValid, format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlayerPhotoManager } from "./PlayerPhotoManager";
import { cn } from "@/lib/utils";

// Componente de input para data de nascimento com máscara
function BirthDateInput({ 
  value, 
  onChange 
}: { 
  value?: Date; 
  onChange: (date: Date | undefined) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  // Sincroniza o valor inicial
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy"));
    }
  }, []);

  const applyMask = (val: string) => {
    // Remove tudo que não é número
    const numbers = val.replace(/\D/g, "");
    
    // Aplica a máscara DD/MM/AAAA
    let masked = "";
    if (numbers.length > 0) masked = numbers.slice(0, 2);
    if (numbers.length > 2) masked += "/" + numbers.slice(2, 4);
    if (numbers.length > 4) masked += "/" + numbers.slice(4, 8);
    
    return masked;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value);
    setInputValue(masked);

    // Valida quando tiver 10 caracteres (DD/MM/AAAA)
    if (masked.length === 10) {
      const parsedDate = parse(masked, "dd/MM/yyyy", new Date());
      const now = new Date();
      const minDate = new Date("1900-01-01");
      
      if (isValid(parsedDate) && parsedDate <= now && parsedDate >= minDate) {
        setIsInvalid(false);
        onChange(parsedDate);
      } else {
        setIsInvalid(true);
        onChange(undefined);
      }
    } else {
      setIsInvalid(false);
      if (masked.length === 0) {
        onChange(undefined);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>Data de Nascimento</Label>
      <Input
        value={inputValue}
        onChange={handleChange}
        placeholder="DD/MM/AAAA"
        maxLength={10}
        className={cn(isInvalid && "border-destructive focus-visible:ring-destructive")}
      />
      {isInvalid && (
        <p className="text-sm text-destructive">Data inválida</p>
      )}
    </div>
  );
}

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
      
      <BirthDateInput
        value={player.birthDate}
        onChange={(date) => setPlayer({ ...player, birthDate: date })}
      />
      
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
