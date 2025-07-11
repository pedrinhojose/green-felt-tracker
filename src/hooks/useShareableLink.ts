import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { generateSafeUUID, sanitizeUUID, debugUUID } from '@/lib/utils/uuidUtils';
import { monitorUUID } from '@/lib/utils/uuidMonitor';

export function useShareableLink() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // Verificar se clipboard API está disponível
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback para dispositivos que não suportam clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.warn('Erro ao copiar para clipboard:', error);
      return false;
    }
  };

  const shareViaWebAPI = async (url: string, title: string): Promise<boolean> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: 'Confira o ranking e estatísticas desta temporada de poker!',
          url: url,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Erro ao compartilhar via Web Share API:', error);
      return false;
    }
  };

  const generateShareableLink = async (seasonId: string): Promise<string | null> => {
    try {
      setIsGenerating(true);
      
      // Validar e sanitizar o seasonId
      const sanitizedSeasonId = sanitizeUUID(seasonId);
      if (!sanitizedSeasonId) {
        console.error('ID da temporada inválido:', seasonId);
        toast({
          title: "Erro",
          description: "ID da temporada inválido.",
          variant: "destructive",
        });
        return null;
      }
      
      debugUUID(seasonId, 'generateShareableLink - seasonId');
      console.log('Gerando link compartilhável para temporada:', sanitizedSeasonId);
      
      // Gerar token único com validação
      const shareToken = generateSafeUUID();
      debugUUID(shareToken, 'generateShareableLink - shareToken');
      console.log('Token gerado:', shareToken);
      
      // Atualizar temporada com o token usando ID sanitizado
      const { error } = await supabase
        .from('seasons')
        .update({ public_share_token: shareToken })
        .eq('id', sanitizedSeasonId);

      if (error) {
        console.error('Erro ao gerar token de compartilhamento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o link de compartilhamento.",
          variant: "destructive",
        });
        return null;
      }

      // Construir URL do link
      const baseUrl = window.location.origin;
      const shareableUrl = `${baseUrl}/public/season/${shareToken}`;
      
      console.log('URL gerada:', shareableUrl);
      console.log('Base URL:', baseUrl);
      console.log('User agent:', navigator.userAgent);
      
      // Tentar compartilhar via Web Share API primeiro (melhor para mobile)
      const sharedViaWebAPI = await shareViaWebAPI(shareableUrl, 'Temporada de Poker');
      
      if (sharedViaWebAPI) {
        toast({
          title: "Link compartilhado!",
          description: "O link foi compartilhado com sucesso.",
        });
        return shareableUrl;
      }
      
      // Fallback: copiar para clipboard
      const copiedToClipboard = await copyToClipboard(shareableUrl);
      
      if (copiedToClipboard) {
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência.",
        });
      } else {
        // Último fallback: mostrar o link para cópia manual
        toast({
          title: "Link gerado",
          description: `Copie manualmente: ${shareableUrl}`,
          duration: 10000,
        });
      }

      return shareableUrl;
    } catch (error) {
      console.error('Erro ao gerar link compartilhável:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao gerar link de compartilhamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const removeShareableLink = async (seasonId: string): Promise<boolean> => {
    try {
      setIsGenerating(true);
      
      // Validar e sanitizar o seasonId
      const sanitizedSeasonId = sanitizeUUID(seasonId);
      if (!sanitizedSeasonId) {
        console.error('ID da temporada inválido:', seasonId);
        toast({
          title: "Erro",
          description: "ID da temporada inválido.",
          variant: "destructive",
        });
        return false;
      }
      
      debugUUID(seasonId, 'removeShareableLink - seasonId');
      
      const { error } = await supabase
        .from('seasons')
        .update({ public_share_token: null })
        .eq('id', sanitizedSeasonId);

      if (error) {
        console.error('Erro ao remover token de compartilhamento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o link de compartilhamento.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Link removido",
        description: "O link de compartilhamento foi desativado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao remover link compartilhável:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover link de compartilhamento.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateShareableLink: monitorUUID(generateShareableLink, 'useShareableLink.generateShareableLink'),
    removeShareableLink: monitorUUID(removeShareableLink, 'useShareableLink.removeShareableLink'),
    isGenerating
  };
}