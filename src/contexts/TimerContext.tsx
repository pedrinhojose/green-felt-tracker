import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { BlindLevel } from '@/lib/db/models';
import { useTimerPersistence } from '@/hooks/useTimerPersistence';
import { useWindowSync } from '@/hooks/useWindowSync';
import { useConnectivityDetection } from '@/hooks/useConnectivityDetection';

export interface TimerState {
  isRunning: boolean;
  currentLevelIndex: number;
  elapsedTimeInLevel: number;
  totalElapsedTime: number;
  showAlert: boolean;
  soundEnabled: boolean;
  isOnline: boolean;
  lastSyncTime: number;
}

export interface TimerContextType {
  // Timer State
  state: TimerState;
  
  // Timer Controls
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  goToNextLevel: () => void;
  goToPreviousLevel: () => void;
  setLevelProgress: (percentage: number) => void;
  
  // Audio Controls
  toggleSound: () => void;
  reloadAudio: () => void;
  testAudio: () => void;
  
  // Window Controls
  openInNewWindow: () => void;
  toggleFullScreen: () => void;
  
  // Timer Status
  currentLevel: BlindLevel | undefined;
  nextLevelData: BlindLevel | undefined;
  timeRemainingInLevel: number;
  progressPercentage: number;
  
  // Blind Levels
  blindLevels: BlindLevel[];
  
  // Alerts
  isAlertTime: boolean;
  isFinalCountdown: boolean;
  isNewBlindAlert: boolean;
  
  // Sync Status
  isMasterWindow: boolean;
  hasOpenedNewWindow: boolean;
  
  // Emergency Mode
  isEmergencyMode: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export interface TimerProviderProps {
  children: ReactNode;
  gameId: string;
  blindLevels: BlindLevel[];
}

export function TimerProvider({ children, gameId, blindLevels }: TimerProviderProps) {
  console.log('=== TIMER CONTEXT - INICIALIZANDO ===');
  console.log('GameId:', gameId);
  console.log('Blind levels recebidos:', blindLevels?.length || 0);
  
  // Sort blind levels to ensure consistency
  const sortedBlindLevels = React.useMemo(() => {
    if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
      console.error('TIMER CONTEXT: Blind levels inválidos');
      return [];
    }
    
    return [...blindLevels].sort((a, b) => {
      const levelA = typeof a.level === 'number' ? a.level : parseInt(String(a.level), 10);
      const levelB = typeof b.level === 'number' ? b.level : parseInt(String(b.level), 10);
      
      if (isNaN(levelA) || isNaN(levelB)) {
        console.error('TIMER CONTEXT: Levels inválidos encontrados:', { a: a.level, b: b.level });
        return 0;
      }
      
      return levelA - levelB;
    });
  }, [blindLevels]);

  // Initialize timer state with persistence
  const {
    state,
    setState,
    saveState,
    clearState,
    isStateValid
  } = useTimerPersistence(gameId, sortedBlindLevels);

  // Initialize window synchronization
  const {
    isMasterWindow,
    hasOpenedNewWindow,
    sendUpdate,
    openInNewWindow
  } = useWindowSync(gameId, state, setState, saveState);

  // Initialize connectivity detection
  const {
    isOnline,
    isEmergencyMode,
    handleConnectionChange
  } = useConnectivityDetection(state, setState);

  // Timer interval ref
  const timerRef = React.useRef<number | null>(null);
  const audioRefs = React.useRef({
    alertAudio: null as HTMLAudioElement | null,
    levelCompleteAudio: null as HTMLAudioElement | null
  });

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRefs.current.alertAudio = new Audio('/sounds/alert.mp3');
      audioRefs.current.levelCompleteAudio = new Audio('/sounds/level-complete.mp3');
      
      // Set volume
      if (audioRefs.current.alertAudio) audioRefs.current.alertAudio.volume = 0.7;
      if (audioRefs.current.levelCompleteAudio) audioRefs.current.levelCompleteAudio.volume = 0.7;
    }
  }, []);

  // Calculate current level info
  const currentLevel = React.useMemo(() => {
    if (state.currentLevelIndex >= 0 && state.currentLevelIndex < sortedBlindLevels.length) {
      return sortedBlindLevels[state.currentLevelIndex];
    }
    return undefined;
  }, [sortedBlindLevels, state.currentLevelIndex]);

  // Calculate next level info
  const nextLevelData = React.useMemo(() => {
    const nextIndex = state.currentLevelIndex + 1;
    if (nextIndex < sortedBlindLevels.length) {
      return sortedBlindLevels[nextIndex];
    }
    return undefined;
  }, [sortedBlindLevels, state.currentLevelIndex]);

  // Calculate time remaining in current level
  const timeRemainingInLevel = React.useMemo(() => {
    if (!currentLevel || typeof currentLevel.duration !== 'number') {
      return 0;
    }
    const totalLevelTime = currentLevel.duration * 60;
    return Math.max(0, totalLevelTime - state.elapsedTimeInLevel);
  }, [currentLevel, state.elapsedTimeInLevel]);

  // Calculate progress percentage
  const progressPercentage = React.useMemo(() => {
    if (!currentLevel || typeof currentLevel.duration !== 'number') {
      return 0;
    }
    const totalLevelTime = currentLevel.duration * 60;
    return Math.min(100, (state.elapsedTimeInLevel / totalLevelTime) * 100);
  }, [currentLevel, state.elapsedTimeInLevel]);

  // Calculate alert states
  const isAlertTime = timeRemainingInLevel <= 60 && timeRemainingInLevel > 55 && state.isRunning;
  const isFinalCountdown = timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning;
  const isNewBlindAlert = state.isRunning && 
    state.elapsedTimeInLevel < 3 && 
    state.currentLevelIndex >= 0 && 
    currentLevel && 
    !currentLevel.isBreak;

  // Play audio safely
  const playAudioSafely = useCallback((audio: HTMLAudioElement | null, enabled: boolean) => {
    if (!audio || !enabled) return;
    
    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio play failed:', error);
        });
      }
    } catch (error) {
      console.log('Audio play error:', error);
    }
  }, []);

  // Timer core logic
  const startTimer = useCallback(() => {
    if (!isMasterWindow) {
      console.log('TIMER: Não é janela master, ignorando comando de start');
      return;
    }

    console.log('TIMER: Iniciando timer...');
    
    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Update state
    const newState = { ...state, isRunning: true };
    setState(newState);
    saveState(newState);
    sendUpdate(newState);
    
    // Start interval
    timerRef.current = window.setInterval(() => {
      setState(prev => {
        if (!Array.isArray(sortedBlindLevels) || sortedBlindLevels.length === 0) {
          console.log('TIMER: Blind levels não configurados, parando timer');
          return prev;
        }
        
        const newElapsedTimeInLevel = prev.elapsedTimeInLevel + 1;
        const currentLevelData = sortedBlindLevels[prev.currentLevelIndex];
        
        if (!currentLevelData || typeof currentLevelData.duration !== 'number') {
          console.log('TIMER: Level inválido, parando timer');
          return prev;
        }
        
        console.log(`TIMER: ${newElapsedTimeInLevel}s / ${currentLevelData.duration * 60}s`);
        
        // Check if level is complete
        if (newElapsedTimeInLevel >= currentLevelData.duration * 60) {
          // Check if there's a next level
          if (prev.currentLevelIndex < sortedBlindLevels.length - 1) {
            // Move to next level
            console.log('TIMER: Nível completo, avançando para próximo');
            
            // Play level complete sound
            if (prev.soundEnabled && audioRefs.current.levelCompleteAudio) {
              playAudioSafely(audioRefs.current.levelCompleteAudio, prev.soundEnabled);
            }
            
            const newState = {
              ...prev,
              currentLevelIndex: prev.currentLevelIndex + 1,
              elapsedTimeInLevel: 0,
              totalElapsedTime: prev.totalElapsedTime + 1,
              showAlert: true,
              lastSyncTime: Date.now()
            };
            
            saveState(newState);
            sendUpdate(newState);
            return newState;
          } else {
            // End of all levels
            console.log('TIMER: Todos os níveis completos, parando timer');
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            const newState = {
              ...prev,
              isRunning: false,
              totalElapsedTime: prev.totalElapsedTime + 1,
              lastSyncTime: Date.now()
            };
            
            saveState(newState);
            sendUpdate(newState);
            return newState;
          }
        }
        
        // Normal timer update
        const newState = {
          ...prev,
          elapsedTimeInLevel: newElapsedTimeInLevel,
          totalElapsedTime: prev.totalElapsedTime + 1,
          lastSyncTime: Date.now()
        };
        
        // Save state every 10 seconds
        if (newElapsedTimeInLevel % 10 === 0) {
          saveState(newState);
          sendUpdate(newState);
        }
        
        return newState;
      });
    }, 1000);
    
    console.log('TIMER: Interval iniciado');
  }, [isMasterWindow, state, setState, saveState, sendUpdate, sortedBlindLevels, playAudioSafely]);

  const pauseTimer = useCallback(() => {
    if (!isMasterWindow) {
      console.log('TIMER: Não é janela master, ignorando comando de pause');
      return;
    }

    console.log('TIMER: Pausando timer');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const newState = { ...state, isRunning: false, lastSyncTime: Date.now() };
    setState(newState);
    saveState(newState);
    sendUpdate(newState);
  }, [isMasterWindow, state, setState, saveState, sendUpdate]);

  const resetTimer = useCallback(() => {
    if (!isMasterWindow) {
      console.log('TIMER: Não é janela master, ignorando comando de reset');
      return;
    }

    console.log('TIMER: Resetando timer');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const newState = {
      ...state,
      isRunning: false,
      currentLevelIndex: 0,
      elapsedTimeInLevel: 0,
      totalElapsedTime: 0,
      showAlert: false,
      lastSyncTime: Date.now()
    };
    
    setState(newState);
    saveState(newState);
    sendUpdate(newState);
  }, [isMasterWindow, state, setState, saveState, sendUpdate]);

  const goToNextLevel = useCallback(() => {
    if (!isMasterWindow) {
      console.log('TIMER: Não é janela master, ignorando comando next level');
      return;
    }

    if (state.currentLevelIndex < sortedBlindLevels.length - 1) {
      console.log(`TIMER: Avançando do nível ${state.currentLevelIndex} para ${state.currentLevelIndex + 1}`);
      
      const newState = {
        ...state,
        currentLevelIndex: state.currentLevelIndex + 1,
        elapsedTimeInLevel: 0,
        showAlert: false,
        lastSyncTime: Date.now()
      };
      
      // Play sound
      if (state.soundEnabled && audioRefs.current.levelCompleteAudio) {
        setTimeout(() => playAudioSafely(audioRefs.current.levelCompleteAudio, state.soundEnabled), 100);
      }
      
      setState(newState);
      saveState(newState);
      sendUpdate(newState);
    }
  }, [isMasterWindow, state, setState, saveState, sendUpdate, sortedBlindLevels, playAudioSafely]);

  const goToPreviousLevel = useCallback(() => {
    if (!isMasterWindow) {
      console.log('TIMER: Não é janela master, ignorando comando previous level');
      return;
    }

    if (state.currentLevelIndex > 0) {
      console.log(`TIMER: Voltando do nível ${state.currentLevelIndex} para ${state.currentLevelIndex - 1}`);
      
      const newState = {
        ...state,
        currentLevelIndex: state.currentLevelIndex - 1,
        elapsedTimeInLevel: 0,
        showAlert: false,
        lastSyncTime: Date.now()
      };
      
      setState(newState);
      saveState(newState);
      sendUpdate(newState);
    }
  }, [isMasterWindow, state, setState, saveState, sendUpdate]);

  const setLevelProgress = useCallback((percentage: number) => {
    if (!isMasterWindow) {
      console.log('TIMER: Não é janela master, ignorando comando set progress');
      return;
    }

    if (currentLevel) {
      const totalLevelTime = currentLevel.duration * 60;
      const newElapsedTime = Math.floor((percentage / 100) * totalLevelTime);
      
      console.log(`TIMER: Definindo progresso para ${percentage}%, tempo: ${newElapsedTime}s`);
      
      const newState = {
        ...state,
        elapsedTimeInLevel: newElapsedTime,
        lastSyncTime: Date.now()
      };
      
      setState(newState);
      saveState(newState);
      sendUpdate(newState);
    }
  }, [isMasterWindow, state, setState, saveState, sendUpdate, currentLevel]);

  const toggleSound = useCallback(() => {
    const newState = { ...state, soundEnabled: !state.soundEnabled, lastSyncTime: Date.now() };
    setState(newState);
    saveState(newState);
    sendUpdate(newState);
  }, [state, setState, saveState, sendUpdate]);

  const reloadAudio = useCallback(() => {
    console.log('TIMER: Recarregando áudio...');
    
    // Test audio playback
    if (state.soundEnabled && audioRefs.current.alertAudio) {
      setTimeout(() => {
        playAudioSafely(audioRefs.current.alertAudio, state.soundEnabled);
      }, 500);
    }
  }, [state.soundEnabled, playAudioSafely]);

  const testAudio = useCallback(() => {
    console.log('TIMER: Testando áudio completo...');
    
    if (!state.soundEnabled) {
      console.log('TIMER: Som desabilitado, não testando');
      return;
    }
    
    // Test alert sound
    setTimeout(() => {
      console.log('TIMER: Testando som de alerta...');
      playAudioSafely(audioRefs.current.alertAudio, state.soundEnabled);
    }, 100);
    
    // Test level complete sound
    setTimeout(() => {
      console.log('TIMER: Testando som de conclusão...');
      playAudioSafely(audioRefs.current.levelCompleteAudio, state.soundEnabled);
    }, 1500);
  }, [state.soundEnabled, playAudioSafely]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const timerContainer = document.querySelector('.timer-container') || document.documentElement;
      
      if (timerContainer.requestFullscreen) {
        timerContainer.requestFullscreen().catch(err => {
          console.error('Erro ao entrar em fullscreen:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Erro ao sair de fullscreen:', err);
        });
      }
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle connection changes
  useEffect(() => {
    if (!isOnline && state.isRunning && isMasterWindow) {
      console.log('TIMER: Conexão perdida, pausando timer');
      pauseTimer();
    }
  }, [isOnline, state.isRunning, isMasterWindow, pauseTimer]);

  // Play alert sounds
  useEffect(() => {
    if (isAlertTime && state.soundEnabled && audioRefs.current.alertAudio) {
      playAudioSafely(audioRefs.current.alertAudio, state.soundEnabled);
    }
  }, [isAlertTime, state.soundEnabled, playAudioSafely]);

  const contextValue: TimerContextType = {
    // Timer State
    state: { ...state, isOnline },
    
    // Timer Controls
    startTimer,
    pauseTimer,
    resetTimer,
    goToNextLevel,
    goToPreviousLevel,
    setLevelProgress,
    
    // Audio Controls
    toggleSound,
    reloadAudio,
    testAudio,
    
    // Window Controls
    openInNewWindow,
    toggleFullScreen,
    
    // Timer Status
    currentLevel,
    nextLevelData,
    timeRemainingInLevel,
    progressPercentage,
    
    // Blind Levels
    blindLevels: sortedBlindLevels,
    
    // Alerts
    isAlertTime,
    isFinalCountdown,
    isNewBlindAlert,
    
    // Sync Status
    isMasterWindow,
    hasOpenedNewWindow,
    
    // Emergency Mode
    isEmergencyMode
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  
  return context;
}