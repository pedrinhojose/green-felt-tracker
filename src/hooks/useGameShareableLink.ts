import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useGameShareableLink() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareableLink = async (gameId: string): Promise<string | null> => {
    try {
      setIsGenerating(true);
      
      // Gerar token único
      const shareToken = uuidv4();
      
      // Atualizar partida com o token
      const { error } = await supabase
        .from('games')
        .update({ public_share_token: shareToken })
        .eq('id', gameId);

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
      const shareableUrl = `${baseUrl}/public/game/${shareToken}`;
      
      // Copiar para clipboard
      try {
        await navigator.clipboard.writeText(shareableUrl);
        toast({
          title: "Link copiado!",
          description: "O link de compartilhamento foi copiado para a área de transferência.",
        });
      } catch (clipboardError) {
        console.warn('Erro ao copiar para clipboard:', clipboardError);
        toast({
          title: "Link gerado",
          description: "Link gerado com sucesso. Copie manualmente: " + shareableUrl,
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

  const removeShareableLink = async (gameId: string): Promise<boolean> => {
    try {
      setIsGenerating(true);
      
      const { error } = await supabase
        .from('games')
        .update({ public_share_token: null })
        .eq('id', gameId);

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
    generateShareableLink,
    removeShareableLink,
    isGenerating
  };
}