
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
  
  // Flag for audio loading state
  const audioLoadedRef = useRef<boolean>(false);

  // Initialize audio references with correct paths
  useEffect(() => {
    if (audioLoadedRef.current) return;
    
    try {
      // Usar caminhos absolutos para os arquivos de áudio
      alertAudioRef.current = new Audio("/sounds/alert.mp3");
      countdownAudioRef.current = new Audio("/sounds/countdown.mp3");
      levelCompleteAudioRef.current = new Audio("/sounds/level-complete.mp3");

      // Preload audio files
      const preloadAudio = async () => {
        try {
          if (alertAudioRef.current) {
            alertAudioRef.current.load();
            // Não vamos tentar reproduzir durante o carregamento para evitar erros
            // apenas carregamos o áudio
          }
          
          if (countdownAudioRef.current) {
            countdownAudioRef.current.load();
          }
          
          if (levelCompleteAudioRef.current) {
            levelCompleteAudioRef.current.load();
          }
          
          audioLoadedRef.current = true;
          console.log("Audio files preloaded successfully");
        } catch (e) {
          console.error("Error preloading audio:", e);
        }
      };
      
      preloadAudio();
    } catch (e) {
      console.error("Error initializing audio files:", e);
    }
  }, []);

  // Function to safely play audio
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current) return;
    
    try {
      audioRef.current.currentTime = 0; // Reset audio
      const playPromise = audioRef.current.play();
      
      // Handle the play promise to catch any errors
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Auto-play prevented:", error);
          // Podemos tentar reproduzir novamente em resposta a uma interação do usuário
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
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
