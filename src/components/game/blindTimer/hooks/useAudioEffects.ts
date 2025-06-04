
import { useEffect, useRef } from "react";
import { useLocalStorageAudio } from "./useLocalStorageAudio";
import { useAudioContext } from "@/contexts/AudioContext";

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
  
  // Use audio context instead of global listeners
  const { isTimerAudioActive } = useAudioContext();
  
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

  // Function to forcefully play audio - even on iOS (only when timer audio is active)
  const forcePlayAudio = (audioElement: HTMLAudioElement) => {
    if (!isTimerAudioActive) {
      console.log("Áudio do timer não está ativo, ignorando reprodução");
      return;
    }
    
    // Set audio to start from beginning
    audioElement.currentTime = 0;
    
    // Play with all the workarounds we can find
    const playPromise = audioElement.play();
    if (playPromise) {
      playPromise.catch(error => {
        console.warn("Erro ao reproduzir áudio:", error);
        
        // Special iOS workaround - add to DOM temporarily
        if (!document.body.contains(audioElement)) {
          document.body.appendChild(audioElement);
          audioElement.play().catch(e => console.error("Falha na reprodução mesmo adicionando ao DOM:", e));
          
          // Remove after playing (or after time interval to be safe)
          setTimeout(() => {
            if (document.body.contains(audioElement)) {
              document.body.removeChild(audioElement);
            }
          }, 3000);
        }
      });
    }
  };

  // Function to unlock audio on iOS/Safari (only when explicitly called by timer)
  const unlockAudio = () => {
    if (!isTimerAudioActive) {
      console.log("Áudio do timer não está ativo, não desbloqueando");
      return;
    }
    
    console.log("Desbloqueando áudio para o timer...");
    
    // Create array of all our audio elements
    const audioElements = [
      alertAudioRef.current,
      countdownAudioRef.current,
      levelCompleteAudioRef.current
    ].filter(Boolean) as HTMLAudioElement[];
    
    if (audioElements.length === 0) {
      console.warn("Nenhum elemento de áudio disponível para desbloquear");
      return;
    }
    
    // Add all audio elements to DOM temporarily (crucial for iOS)
    const audioContainer = document.createElement('div');
    audioContainer.style.display = 'none';
    document.body.appendChild(audioContainer);
    
    audioElements.forEach(audio => {
      if (!audio.parentElement) {
        audioContainer.appendChild(audio);
      }
      
      // Set volume to 0 for silent unlocking
      const originalVolume = audio.volume;
      audio.volume = 0.01;
      
      // Play and immediately pause
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
          console.log("Áudio desbloqueado com sucesso:", audio.src);
        })
        .catch(error => {
          console.warn("Não foi possível desbloquear áudio:", error);
          audio.volume = originalVolume;
        });
    });
    
    // Remove container after a short delay (giving browser time to process)
    setTimeout(() => {
      if (document.body.contains(audioContainer)) {
        document.body.removeChild(audioContainer);
      }
    }, 1000);
  };

  // Function to safely play audio with all our workarounds (only when timer audio is active)
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current || !isTimerAudioActive) {
      console.log("Som desativado, referência de áudio não disponível ou timer audio inativo");
      return;
    }
    
    try {
      const audio = audioRef.current;
      
      // Debug para verificar se o áudio está disponível
      console.log("Tentando reproduzir áudio:", audio.src, "Estado atual:", audio.readyState);
      
      // Garantir que estamos prontos para reproduzir
      if (audio.readyState < 2) { // HAVE_CURRENT_DATA = 2
        console.log("Áudio não está pronto, tentando pré-carregar primeiro");
        audio.load(); // Força pré-carregamento
        
        // Adicionar ao DOM temporariamente para ajudar no carregamento
        if (!audio.parentElement) {
          document.body.appendChild(audio);
          setTimeout(() => {
            if (document.body.contains(audio)) {
              document.body.removeChild(audio);
            }
          }, 1000);
        }
        
        // Espere um pouco para dar tempo ao carregamento
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Usar nosso método de força para garantir a reprodução
      forcePlayAudio(audio);
      
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
