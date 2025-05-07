
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
      // Criar elementos de áudio para cada som
      alertAudioRef.current = new Audio();
      alertAudioRef.current.src = "/sounds/alert.mp3";
      alertAudioRef.current.preload = "auto";
      
      countdownAudioRef.current = new Audio();
      countdownAudioRef.current.src = "/sounds/countdown.mp3";
      countdownAudioRef.current.preload = "auto";
      
      levelCompleteAudioRef.current = new Audio();
      levelCompleteAudioRef.current.src = "/sounds/level-complete.mp3";
      levelCompleteAudioRef.current.preload = "auto";

      // Pré-carregar arquivos de áudio
      const preloadAudio = async () => {
        try {
          // Tentar pré-carregar áudio após uma interação do usuário para evitar restrições do navegador
          audioLoadedRef.current = true;
          console.log("Áudios preparados para reprodução");
        } catch (e) {
          console.error("Erro ao pré-carregar áudio:", e);
        }
      };
      
      preloadAudio();
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
      // Reset do áudio e tentativa de reprodução
      audioRef.current.currentTime = 0;
      
      // Garantir que o volume esteja adequado
      audioRef.current.volume = 1.0;
      
      const playPromise = audioRef.current.play();
      
      // Tratar a promise de reprodução para capturar erros
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Reprodução automática impedida:", error);
          // Registramos o erro mas não tentamos reproduzir novamente
          // A reprodução deve ocorrer após interação do usuário
        });
      }
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
