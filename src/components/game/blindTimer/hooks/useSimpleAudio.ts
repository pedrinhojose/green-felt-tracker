import { useRef, useCallback } from 'react';

export interface SimpleAudioHook {
  playAlert: () => void;
  playCountdown: () => void;
  playLevelComplete: () => void;
  isAudioSupported: boolean;
}

export function useSimpleAudio(): SimpleAudioHook {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);

  // Inicializar AudioContext com manejo melhorado de estado
  const initAudioContext = useCallback(async () => {
    if (isInitializedRef.current && audioContextRef.current) {
      // Verificar se o contexto está suspenso
      if (audioContextRef.current.state === 'suspended') {
        try {
          console.log("🔧 AudioContext suspenso, tentando retomar...");
          await audioContextRef.current.resume();
          console.log("✅ AudioContext retomado com sucesso");
        } catch (error) {
          console.error("❌ Erro ao retomar AudioContext:", error);
        }
      }
      console.log(`📊 Estado do AudioContext: ${audioContextRef.current.state}`);
      return audioContextRef.current;
    }
    
    try {
      // @ts-ignore - AudioContext pode ter prefixos em browsers antigos
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        isInitializedRef.current = true;
        console.log("✅ AudioContext inicializado com sucesso");
        
        // Tentar retomar imediatamente se suspenso
        if (audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
            console.log("✅ AudioContext retomado após inicialização");
          } catch (error) {
            console.warn("⚠️ Não foi possível retomar AudioContext imediatamente:", error);
          }
        }
        
        console.log(`📊 Estado final do AudioContext: ${audioContextRef.current.state}`);
        return audioContextRef.current;
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar AudioContext:", error);
    }
    return null;
  }, []);

  // Função para criar um beep sintético com verificações melhoradas
  const createBeep = useCallback(async (frequency: number, duration: number, volume: number = 0.3) => {
    const context = await initAudioContext();
    
    if (!context) {
      console.error("❌ AudioContext não disponível para createBeep");
      return;
    }

    if (context.state !== 'running') {
      console.warn(`⚠️ AudioContext não está rodando: ${context.state}`);
      return;
    }

    return new Promise<void>((resolve) => {
      try {
        console.log(`🔊 Criando beep: ${frequency}Hz por ${duration}s, volume: ${volume}`);
        
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Configurar o som
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        oscillator.type = 'sine';

        // Configurar volume com fade
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

        // Conectar os nós
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        // Tocar o som
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration);

        oscillator.onended = () => {
          console.log(`✅ Som reproduzido com sucesso: ${frequency}Hz por ${duration}s`);
          resolve();
        };

        // Fallback timeout em caso de problemas
        setTimeout(() => {
          console.log(`⏰ Timeout para beep: ${frequency}Hz`);
          resolve();
        }, (duration + 0.1) * 1000);

      } catch (error) {
        console.error("❌ Erro ao criar beep:", error);
        resolve();
      }
    });
  }, [initAudioContext]);

  // Som de alerta (1 minuto restante) - tom mais grave e longo
  const playAlert = useCallback(async () => {
    console.log("🚨 TOCANDO ALERTA DE 1 MINUTO");
    try {
      await createBeep(800, 0.8, 0.4); // Tom mais grave e longo
    } catch (error) {
      console.error("Erro no alerta:", error);
    }
  }, [createBeep]);

  // Som de contagem regressiva (últimos 4 segundos) - beeps rápidos
  const playCountdown = useCallback(async () => {
    console.log("⏱️ TOCANDO CONTAGEM REGRESSIVA");
    try {
      await createBeep(1200, 0.2, 0.5); // Tom mais agudo e curto
    } catch (error) {
      console.error("Erro na contagem:", error);
    }
  }, [createBeep]);

  // Som de conclusão de nível - sequência de dois tons
  const playLevelComplete = useCallback(async () => {
    console.log("🎉 TOCANDO CONCLUSÃO DE NÍVEL");
    try {
      await createBeep(1000, 0.3, 0.4);
      await new Promise(resolve => setTimeout(resolve, 100));
      await createBeep(1500, 0.4, 0.4);
    } catch (error) {
      console.error("Erro na conclusão:", error);
    }
  }, [createBeep]);

  const isAudioSupported = useCallback(() => {
    // @ts-ignore
    return !!(window.AudioContext || window.webkitAudioContext);
  }, []);

  return {
    playAlert,
    playCountdown,
    playLevelComplete,
    isAudioSupported: isAudioSupported(),
  };
}