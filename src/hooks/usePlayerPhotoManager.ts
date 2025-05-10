
import { useState, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { optimizeImage } from "@/lib/utils/imageUtils";
import { uploadImageToStorage } from "@/lib/utils/storageUtils";

export function usePlayerPhotoManager(initialPhotoUrl?: string) {
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialPhotoUrl);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Erro",
          description: "Seu navegador não suporta acesso à câmera.",
          variant: "destructive",
        });
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Acesso negado",
        description: "Não foi possível acessar a câmera.",
        variant: "destructive",
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  const capturePhoto = async () => {
    setIsProcessing(true);
    try {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/jpeg');
          stopCamera();
          
          // Optimize the image before uploading
          const optimizedImageUrl = await optimizeImage(imageDataUrl);
          
          // Upload to Supabase Storage - using 'fotos' bucket explicitly
          const storageUrl = await uploadImageToStorage(optimizedImageUrl, 'fotos');
          setPhotoUrl(storageUrl);
          setIsProcessing(false);
          return storageUrl;
        }
      }
      setIsProcessing(false);
      return null;
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a foto.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return null;
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    
    setIsProcessing(true);
    try {
      // Check file size before processing
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB. Por favor, escolha uma imagem menor.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return null;
      }
      
      const imageDataUrl = await readFileAsDataURL(file);
      // Optimize the image
      const optimizedImageUrl = await optimizeImage(imageDataUrl);
      
      // Upload to Supabase Storage - using 'fotos' bucket explicitly
      const storageUrl = await uploadImageToStorage(optimizedImageUrl, 'fotos');
      setPhotoUrl(storageUrl);
      setIsProcessing(false);
      return storageUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a imagem.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return null;
    }
  };

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const clearPhoto = () => {
    setPhotoUrl(undefined);
  };

  return {
    photoUrl,
    setPhotoUrl,
    isCameraActive,
    setIsCameraActive,
    isProcessing,
    videoRef,
    fileInputRef,
    startCamera,
    stopCamera,
    capturePhoto,
    handleFileUpload,
    clearPhoto
  };
}
