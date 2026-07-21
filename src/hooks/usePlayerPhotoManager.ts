
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { applyPlayerPhotoMask } from "@/lib/utils/playerPhotoMask";
import { uploadImageToStorage } from "@/lib/utils/storageUtils";

export function usePlayerPhotoManager(initialPhotoUrl?: string) {
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialPhotoUrl);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "user" } },
        audio: false,
      });
      streamRef.current = stream;
      // Ativa a UI; o <video> só é montado após esta re-renderização,
      // então o srcObject é atribuído no useEffect abaixo.
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      const msg = error instanceof Error ? `${error.name}: ${error.message}` : "Não foi possível acessar a câmera.";
      toast({
        title: "Acesso à câmera falhou",
        description: msg,
        variant: "destructive",
      });
    }
  };

  // Atribui o stream ao <video> assim que ele é montado pela troca de estado.
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      // iOS Safari exige play() explícito mesmo com autoPlay/playsInline.
      videoRef.current.play().catch((err) => {
        console.warn("video.play() falhou:", err);
      });
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup ao desmontar (ex.: diálogo fechado com câmera aberta).
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  
  const capturePhoto = async () => {
    setIsProcessing(true);
    try {
      console.log('📸 Iniciando captura de foto da câmera...');
      
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/jpeg');
          console.log('🖼️ Imagem capturada, tamanho:', Math.round(imageDataUrl.length / 1024), 'KB');
          
          stopCamera();
          
          // Aplica máscara padrão (fundo preto + contorno branco) e comprime
          console.log('🎨 Aplicando máscara padrão...');
          const optimizedImageUrl = await applyPlayerPhotoMask(imageDataUrl);
          console.log('⚡ Máscara aplicada, novo tamanho:', Math.round(optimizedImageUrl.length / 1024), 'KB');
          
          // Upload to Supabase Storage - fotos bucket, players folder
          console.log('🚀 Fazendo upload para Supabase Storage: bucket=fotos, folder=players');
          const storageUrl = await uploadImageToStorage(optimizedImageUrl, 'fotos');
          console.log('✅ Foto capturada e salva! URL pública:', storageUrl);
          
          // Verify the URL format
          if (storageUrl.includes('fotos/players')) {
            console.log('✅ URL no formato correto: fotos/players');
          } else {
            console.warn('⚠️ URL pode não estar no formato esperado fotos/players');
          }
          
          setPhotoUrl(storageUrl);
          setIsProcessing(false);
          
          toast({
            title: "Foto capturada!",
            description: "A foto foi salva com sucesso no Storage.",
          });
          
          return storageUrl;
        }
      }
      setIsProcessing(false);
      return null;
    } catch (error) {
      console.error("💥 Erro ao capturar foto:", error);
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
      console.log('📁 Iniciando upload de arquivo:', file.name, 'Tamanho:', Math.round(file.size / 1024), 'KB');
      
      // Aceita arquivos grandes (celulares tiram fotos de 10-20MB); a máscara/compressão reduz para ~100KB.
      // Limite alto só para evitar travar o navegador com arquivos absurdos.
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 50MB. Escolha uma imagem menor.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return null;
      }
      
      const imageDataUrl = await readFileAsDataURL(file);
      console.log('🔄 Arquivo convertido para base64');
      
      // Aplica máscara padrão (fundo preto + contorno branco) e comprime
      console.log('🎨 Aplicando máscara padrão...');
      const optimizedImageUrl = await applyPlayerPhotoMask(imageDataUrl);
      console.log('⚡ Máscara aplicada');
      
      // Upload to Supabase Storage - fotos bucket, players folder
      console.log('🚀 Fazendo upload para Supabase Storage: bucket=fotos, folder=players');
      const storageUrl = await uploadImageToStorage(optimizedImageUrl, 'fotos');
      console.log('✅ Arquivo enviado com sucesso! URL pública:', storageUrl);
      
      // Verify the URL format
      if (storageUrl.includes('fotos/players')) {
        console.log('✅ URL no formato correto: fotos/players');
      } else {
        console.warn('⚠️ URL pode não estar no formato esperado fotos/players');
      }
      
      setPhotoUrl(storageUrl);
      setIsProcessing(false);
      
      toast({
        title: "Foto enviada!",
        description: "A foto foi salva com sucesso no Storage.",
      });
      
      return storageUrl;
    } catch (error) {
      console.error("💥 Erro ao processar arquivo:", error);
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
    console.log('🧹 Limpando foto - será salvo como NULL no banco');
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
