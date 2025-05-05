
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, X } from "lucide-react";
import { Player } from "@/lib/db/models";

interface PlayerFormProps {
  player: { 
    id?: string;
    name: string; 
    photoUrl?: string;
    phone?: string;
    city?: string;
  };
  setPlayer: React.Dispatch<React.SetStateAction<any>>;
  isCameraActive: boolean;
  setIsCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  videoRef: React.RefObject<HTMLVideoElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearPhoto: () => void;
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
  clearPhoto
}: PlayerFormProps) {
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
        <Label>Foto do Jogador</Label>
        
        {isCameraActive ? (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full"
              />
              <Button 
                onClick={() => stopCamera()}
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={capturePhoto} 
              className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              Tirar Foto
            </Button>
          </div>
        ) : player.photoUrl ? (
          <div className="space-y-2">
            <div className="relative">
              <img 
                src={player.photoUrl} 
                alt="Foto do jogador" 
                className="w-full h-auto rounded-lg"
              />
              <Button 
                onClick={clearPhoto}
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={startCamera} 
              variant="outline" 
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" /> Usar Câmera
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              className="flex-1"
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Escolher Arquivo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
}
