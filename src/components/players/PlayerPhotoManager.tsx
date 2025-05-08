
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, X, Loader2 } from "lucide-react";

interface PlayerPhotoManagerProps {
  photoUrl?: string;
  isCameraActive: boolean;
  isProcessing: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearPhoto: () => void;
}

export function PlayerPhotoManager({
  photoUrl,
  isCameraActive,
  isProcessing,
  videoRef,
  fileInputRef,
  startCamera,
  stopCamera,
  capturePhoto,
  handleFileUpload,
  clearPhoto
}: PlayerPhotoManagerProps) {
  
  // Handle photo capture
  const handleCapturePhoto = async () => {
    await capturePhoto();
  };
  
  return (
    <div>
      {isProcessing && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-poker-gold" />
          <span className="ml-2">Processando imagem...</span>
        </div>
      )}
      
      {isCameraActive && !isProcessing ? (
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
            onClick={handleCapturePhoto} 
            className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            Tirar Foto
          </Button>
        </div>
      ) : photoUrl && !isProcessing ? (
        <div className="space-y-2">
          <div className="relative">
            <img 
              src={photoUrl} 
              alt="Foto do jogador" 
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
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
      ) : !isProcessing && (
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
  );
}
