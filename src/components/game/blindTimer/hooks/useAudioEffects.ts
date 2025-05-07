
import { useEffect, useRef } from "react";

export interface AudioRefs {
  alertAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  countdownAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  levelCompleteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function useAudioEffects() {
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Flag para controlar o carregamento do áudio
  const audioLoadedRef = useRef<boolean>(false);

  // Inicializar referências de áudio com caminhos corretos
  useEffect(() => {
    if (audioLoadedRef.current) return;
    
    try {
      // Verificar se estamos no navegador
      if (typeof window === 'undefined') return;
      
      // Criar elementos de áudio para cada som com caminhos absolutos
      alertAudioRef.current = new Audio();
      alertAudioRef.current.src = "/sounds/alert.mp3";
      alertAudioRef.current.preload = "auto";
      
      countdownAudioRef.current = new Audio();
      countdownAudioRef.current.src = "/sounds/countdown.mp3";
      countdownAudioRef.current.preload = "auto";
      
      levelCompleteAudioRef.current = new Audio();
      levelCompleteAudioRef.current.src = "/sounds/level-complete.mp3";
      levelCompleteAudioRef.current.preload = "auto";

      // Marcar áudios como carregados
      audioLoadedRef.current = true;
      console.log("Áudios preparados para reprodução");
      
      // Tentar pré-carregar os arquivos de áudio
      const preloadPromises = [
        alertAudioRef.current.load(),
        countdownAudioRef.current.load(),
        levelCompleteAudioRef.current.load()
      ];
      
      // Registrar quando os áudios estiverem prontos
      Promise.all(preloadPromises)
        .then(() => console.log("Todos os áudios pré-carregados com sucesso"))
        .catch(error => console.error("Erro no pré-carregamento de áudio:", error));
      
    } catch (e) {
      console.error("Erro ao inicializar arquivos de áudio:", e);
    }

    // Função de limpeza ao desmontar componente
    return () => {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current = null;
      }
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current = null;
      }
      if (levelCompleteAudioRef.current) {
        levelCompleteAudioRef.current.pause();
        levelCompleteAudioRef.current = null;
      }
    };
  }, []);

  // Função para reproduzir áudio com segurança
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current) return;
    
    try {
      // Debug para verificar se o áudio está disponível
      console.log("Tentando reproduzir áudio:", audioRef.current.src);
      
      // Reset do áudio e tentativa de reprodução
      audioRef.current.currentTime = 0;
      
      // Garantir que o volume esteja adequado
      audioRef.current.volume = 1.0;
      
      // Usar o método play() e tratar a promise resultante
      await audioRef.current.play()
        .then(() => console.log("Áudio iniciado com sucesso"))
        .catch((error) => {
          console.error("Erro na reprodução de áudio:", error);
          
          // Se for um erro de interação do usuário, podemos tentar reproduzir novamente
          // após um evento de interação do usuário
          if (error.name === "NotAllowedError") {
            console.warn("Reprodução automática bloqueada. O usuário precisa interagir primeiro.");
          }
        });
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
    }
  };

  return {
    audioRefs: {
      alertAudioRef,
      countdownAudioRef,
      levelCompleteAudioRef
    },
    playAudioSafely
  };
}
