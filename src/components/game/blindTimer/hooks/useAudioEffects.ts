
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
  
  // Inicializar referências de áudio
  useEffect(() => {
    if (audioLoadedRef.current) return;
    
    try {
      // Verificar se estamos no navegador
      if (typeof window === 'undefined') return;
      
      console.log("Inicializando elementos de áudio");
      
      // Usar o construtor de Audio em vez de new Audio()
      const alertAudio = new Audio();
      alertAudio.src = "/sounds/alert.mp3";
      alertAudio.preload = "auto";
      alertAudioRef.current = alertAudio;
      
      const countdownAudio = new Audio();
      countdownAudio.src = "/sounds/countdown.mp3";
      countdownAudio.preload = "auto";
      countdownAudioRef.current = countdownAudio;
      
      const levelCompleteAudio = new Audio();
      levelCompleteAudio.src = "/sounds/level-complete.mp3";
      levelCompleteAudio.preload = "auto";
      levelCompleteAudioRef.current = levelCompleteAudio;

      // Verificar se os arquivos existem
      const checkAudioFiles = async () => {
        try {
          const files = [
            "/sounds/alert.mp3",
            "/sounds/countdown.mp3",
            "/sounds/level-complete.mp3"
          ];
          
          for (const file of files) {
            const response = await fetch(file, { method: 'HEAD' });
            if (!response.ok) {
              console.error(`Erro: Arquivo de áudio não encontrado: ${file}`);
            } else {
              console.log(`Arquivo de áudio encontrado: ${file}`);
            }
          }
        } catch (error) {
          console.error("Erro ao verificar arquivos de áudio:", error);
        }
      };
      
      checkAudioFiles();
      
      // Adicionar event listeners para debugging
      const addAudioEventListeners = (audio: HTMLAudioElement, name: string) => {
        audio.addEventListener('canplaythrough', () => console.log(`Áudio ${name} carregado e pronto para reprodução`));
        audio.addEventListener('error', (e) => console.error(`Erro ao carregar áudio ${name}:`, e));
      };
      
      if (alertAudioRef.current) addAudioEventListeners(alertAudioRef.current, 'alerta');
      if (countdownAudioRef.current) addAudioEventListeners(countdownAudioRef.current, 'contagem regressiva');
      if (levelCompleteAudioRef.current) addAudioEventListeners(levelCompleteAudioRef.current, 'conclusão de nível');

      // Marcar áudios como carregados
      audioLoadedRef.current = true;
      console.log("Áudios preparados para reprodução");
      
    } catch (e) {
      console.error("Erro ao inicializar arquivos de áudio:", e);
    }

    // Função de limpeza ao desmontar componente
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
  }, []);

  // Função para desbloquear áudio em iOS/Safari
  const unlockAudio = () => {
    console.log("Tentando desbloquear áudio...");
    // Criando áudio temporário para desbloquear
    const silentAudio = new Audio();
    silentAudio.play().then(() => {
      console.log("Áudio desbloqueado com sucesso");
    }).catch(error => {
      console.warn("Não foi possível desbloquear o áudio automaticamente:", error);
    });
    
    // Tentativa de desbloquear cada referência de áudio
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

  // Função para reproduzir áudio com segurança
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current) {
      console.log("Som desabilitado ou referência de áudio não disponível");
      return;
    }
    
    try {
      // Debug para verificar se o áudio está disponível
      console.log("Tentando reproduzir áudio:", audioRef.current.src, "Estado atual:", audioRef.current.readyState);
      
      // Reset do áudio
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      
      // Tentando desbloquear áudio primeiro
      unlockAudio();
      
      // Usar o método play() e tratar a promise resultante
      await audioRef.current.play()
        .then(() => console.log("Áudio iniciado com sucesso"))
        .catch((error) => {
          console.error("Erro na reprodução de áudio:", error);
          
          if (error.name === "NotAllowedError") {
            console.warn("Reprodução automática bloqueada. O usuário precisa interagir primeiro.");
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
