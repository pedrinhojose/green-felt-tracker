
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AudioContextType {
  isAudioEnabled: boolean;
  isTimerAudioActive: boolean;
  enableTimerAudio: () => void;
  disableTimerAudio: () => void;
  setGlobalAudioEnabled: (enabled: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isTimerAudioActive, setIsTimerAudioActive] = useState(false);

  const enableTimerAudio = useCallback(() => {
    console.log("=== AUDIO CONTEXT - HABILITANDO TIMER AUDIO ===");
    console.log("Estado antes:", { isAudioEnabled, isTimerAudioActive });
    setIsTimerAudioActive(true);
    setIsAudioEnabled(true);
    console.log("Timer audio habilitado com sucesso");
  }, [isAudioEnabled, isTimerAudioActive]);

  const disableTimerAudio = useCallback(() => {
    console.log("=== AUDIO CONTEXT - DESABILITANDO TIMER AUDIO ===");
    console.log("Desabilitando áudio do timer");
    setIsTimerAudioActive(false);
  }, []);

  const setGlobalAudioEnabled = useCallback((enabled: boolean) => {
    console.log(`=== AUDIO CONTEXT - ÁUDIO GLOBAL ${enabled ? 'HABILITADO' : 'DESABILITADO'} ===`);
    console.log(`Configuração global de áudio: ${enabled ? 'habilitado' : 'desabilitado'}`);
    setIsAudioEnabled(enabled);
    
    if (enabled) {
      console.log("Áudio global habilitado - garantindo que timer audio também esteja ativo");
      setIsTimerAudioActive(true);
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isAudioEnabled,
        isTimerAudioActive,
        enableTimerAudio,
        disableTimerAudio,
        setGlobalAudioEnabled,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}
