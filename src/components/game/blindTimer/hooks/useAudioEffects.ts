
import { useEffect, useRef } from "react";
import { useLocalStorageAudio } from "./useLocalStorageAudio";

export interface AudioRefs {
  alertAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  countdownAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  levelCompleteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function useAudioEffects() {
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Flag to control audio loading
  const audioLoadedRef = useRef<boolean>(false);
  
  // Use our updated GitHub audio hook
  const { audioElements, isLoading } = useLocalStorageAudio();
  
  // Initialize audio references
  useEffect(() => {
    if (audioLoadedRef.current) return;
    if (isLoading) return; // Wait until audio is loaded from GitHub
    
    try {
      console.log("Inicializando elementos de áudio do GitHub");
      
      // Assign the audio elements from GitHub to our refs
      if (audioElements.alertAudio) {
        alertAudioRef.current = audioElements.alertAudio;
        console.log("Áudio de alerta carregado do GitHub");
      }
      
      if (audioElements.countdownAudio) {
        countdownAudioRef.current = audioElements.countdownAudio;
        console.log("Áudio de contagem regressiva carregado do GitHub");
      }
      
      if (audioElements.levelCompleteAudio) {
        levelCompleteAudioRef.current = audioElements.levelCompleteAudio;
        console.log("Áudio de conclusão de nível carregado do GitHub");
      }
      
      // Add event listeners for debugging
      const addAudioEventListeners = (audio: HTMLAudioElement, name: string) => {
        audio.addEventListener('canplaythrough', () => console.log(`Áudio ${name} carregado e pronto para reproduzir`));
        audio.addEventListener('error', (e) => console.error(`Erro ao carregar áudio ${name}:`, e));
      };
      
      if (alertAudioRef.current) addAudioEventListeners(alertAudioRef.current, 'alerta');
      if (countdownAudioRef.current) addAudioEventListeners(countdownAudioRef.current, 'contagem regressiva');
      if (levelCompleteAudioRef.current) addAudioEventListeners(levelCompleteAudioRef.current, 'conclusão de nível');

      // Mark audio as loaded
      audioLoadedRef.current = true;
      console.log("Todos os áudios preparados para reprodução");
      
    } catch (e) {
      console.error("Erro ao inicializar arquivos de áudio:", e);
    }

    // Cleanup function when component unmounts
    return () => {
      console.log("Limpando referências de áudio");
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
  }, [audioElements, isLoading]);

  // Function to unlock audio on iOS/Safari
  const unlockAudio = () => {
    console.log("Tentando desbloquear áudio...");
    // Create temporary audio to unlock
    const silentAudio = new Audio();
    silentAudio.play().then(() => {
      console.log("Áudio desbloqueado com sucesso");
    }).catch(error => {
      console.warn("Não foi possível desbloquear áudio automaticamente:", error);
    });
    
    // Try to unlock each audio reference
    [alertAudioRef, countdownAudioRef, levelCompleteAudioRef].forEach(ref => {
      if (ref.current) {
        const tempVolume = ref.current.volume;
        ref.current.volume = 0;
        ref.current.play().then(() => {
          ref.current!.pause();
          ref.current!.currentTime = 0;
          ref.current!.volume = tempVolume;
        }).catch(e => {
          console.warn("Tentativa de desbloquear áudio falhou:", e);
        });
      }
    });
  };

  // Function to safely play audio
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current) {
      console.log("Som desativado ou referência de áudio não disponível");
      return;
    }
    
    try {
      // Debug para verificar se o áudio está disponível
      console.log("Tentando reproduzir áudio:", audioRef.current.src, "Estado atual:", audioRef.current.readyState);
      
      // Resetar áudio
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      
      // Tentar desbloquear áudio primeiro
      unlockAudio();
      
      // Usar método play() e tratar a promessa resultante
      await audioRef.current.play()
        .then(() => console.log("Áudio iniciado com sucesso"))
        .catch((error) => {
          console.error("Erro ao reproduzir áudio:", error);
          
          if (error.name === "NotAllowedError") {
            console.warn("Reprodução automática bloqueada. Interação do usuário necessária primeiro.");
            unlockAudio();
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
    playAudioSafely,
    unlockAudio
  };
}
