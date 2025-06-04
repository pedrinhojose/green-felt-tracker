
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
    console.log("Habilitando áudio do timer");
    setIsTimerAudioActive(true);
    setIsAudioEnabled(true);
  }, []);

  const disableTimerAudio = useCallback(() => {
    console.log("Desabilitando áudio do timer");
    setIsTimerAudioActive(false);
  }, []);

  const setGlobalAudioEnabled = useCallback((enabled: boolean) => {
    console.log(`Configuração global de áudio: ${enabled ? 'habilitado' : 'desabilitado'}`);
    setIsAudioEnabled(enabled);
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
