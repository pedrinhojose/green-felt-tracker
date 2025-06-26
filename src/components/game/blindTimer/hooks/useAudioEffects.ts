
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
  
  const audioLoadedRef = useRef<boolean>(false);
  const { audioElements, isLoading } = useLocalStorageAudio();
  const { isTimerAudioActive } = useAudioContext();
  
  // Initialize audio references
  useEffect(() => {
    if (audioLoadedRef.current) return;
    if (isLoading) return;
    
    try {
      console.log("=== INICIALIZANDO ÁUDIO - DEBUG COMPLETO ===");
      console.log("Estado do carregamento:", { isLoading });
      console.log("Elementos de áudio recebidos:", {
        alertAudio: !!audioElements.alertAudio,
        countdownAudio: !!audioElements.countdownAudio,
        levelCompleteAudio: !!audioElements.levelCompleteAudio
      });
      
      if (audioElements.alertAudio) {
        alertAudioRef.current = audioElements.alertAudio;
        console.log("Áudio de alerta carregado:", audioElements.alertAudio.src);
      }
      
      if (audioElements.countdownAudio) {
        countdownAudioRef.current = audioElements.countdownAudio;
        console.log("Áudio de contagem carregado:", audioElements.countdownAudio.src);
      }
      
      if (audioElements.levelCompleteAudio) {
        levelCompleteAudioRef.current = audioElements.levelCompleteAudio;
        console.log("Áudio de conclusão carregado:", audioElements.levelCompleteAudio.src);
      }
      
      // Add event listeners for debugging
      const addAudioEventListeners = (audio: HTMLAudioElement, name: string) => {
        audio.addEventListener('canplaythrough', () => {
          console.log(`Áudio ${name} pronto para reproduzir - readyState: ${audio.readyState}`);
        });
        audio.addEventListener('error', (e) => {
          console.error(`Erro no áudio ${name}:`, e, audio.error);
        });
        audio.addEventListener('loadstart', () => {
          console.log(`Início do carregamento do áudio ${name}`);
        });
        audio.addEventListener('loadeddata', () => {
          console.log(`Dados do áudio ${name} carregados`);
        });
      };
      
      if (alertAudioRef.current) addAudioEventListeners(alertAudioRef.current, 'alerta');
      if (countdownAudioRef.current) addAudioEventListeners(countdownAudioRef.current, 'contagem');
      if (levelCompleteAudioRef.current) addAudioEventListeners(levelCompleteAudioRef.current, 'conclusão');

      audioLoadedRef.current = true;
      console.log("Inicialização de áudio concluída");
      
    } catch (e) {
      console.error("Erro crítico ao inicializar áudio:", e);
    }

    return () => {
      console.log("Limpando referências de áudio");
      [alertAudioRef, countdownAudioRef, levelCompleteAudioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, [audioElements, isLoading]);

  // Function to forcefully play audio
  const forcePlayAudio = (audioElement: HTMLAudioElement) => {
    console.log("=== FORCE PLAY AUDIO ===");
    console.log("Estado do áudio:", {
      src: audioElement.src,
      readyState: audioElement.readyState,
      paused: audioElement.paused,
      volume: audioElement.volume
    });
    
    audioElement.currentTime = 0;
    
    const playPromise = audioElement.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log("Áudio reproduzido com sucesso");
        })
        .catch(error => {
          console.warn("Erro na reprodução, tentando workaround:", error);
          
          // iOS/Safari workaround
          if (!document.body.contains(audioElement)) {
            console.log("Adicionando áudio ao DOM temporariamente");
            document.body.appendChild(audioElement);
            audioElement.play()
              .then(() => console.log("Reprodução bem-sucedida após adicionar ao DOM"))
              .catch(e => console.error("Falha mesmo após adicionar ao DOM:", e));
            
            setTimeout(() => {
              if (document.body.contains(audioElement)) {
                document.body.removeChild(audioElement);
              }
            }, 3000);
          }
        });
    }
  };

  // Function to unlock audio
  const unlockAudio = () => {
    console.log("=== DESBLOQUEANDO ÁUDIO ===");
    
    const audioElements = [
      alertAudioRef.current,
      countdownAudioRef.current,
      levelCompleteAudioRef.current
    ].filter(Boolean) as HTMLAudioElement[];
    
    if (audioElements.length === 0) {
      console.warn("Nenhum elemento de áudio para desbloquear");
      return;
    }
    
    console.log(`Desbloqueando ${audioElements.length} elementos de áudio`);
    
    // Unlock each audio element
    audioElements.forEach((audio, index) => {
      const originalVolume = audio.volume;
      audio.volume = 0.01;
      
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
          console.log(`Áudio ${index + 1} desbloqueado com sucesso`);
        })
        .catch(error => {
          console.warn(`Falha ao desbloquear áudio ${index + 1}:`, error);
          audio.volume = originalVolume;
        });
    });
  };

  // Function to safely play audio
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    console.log("=== PLAY AUDIO SAFELY ===");
    console.log("Condições:", { soundEnabled, hasAudio: !!audioRef.current });
    
    if (!soundEnabled || !audioRef.current) {
      console.log("Condições não atendidas para reprodução");
      return;
    }
    
    try {
      const audio = audioRef.current;
      
      console.log("Estado do áudio antes da reprodução:", {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        paused: audio.paused
      });
      
      // Garantir carregamento
      if (audio.readyState < 2) {
        console.log("Áudio não carregado, forçando load...");
        audio.load();
        
        // Adicionar ao DOM se necessário
        if (!audio.parentElement) {
          document.body.appendChild(audio);
          setTimeout(() => {
            if (document.body.contains(audio)) {
              document.body.removeChild(audio);
            }
          }, 1000);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      forcePlayAudio(audio);
      
    } catch (error) {
      console.error("Erro crítico na reprodução:", error);
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
