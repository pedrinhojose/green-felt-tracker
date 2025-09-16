import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { BlindLevel } from '@/lib/db/models';
import { useTimerPersistence } from '@/hooks/useTimerPersistence';
import { useWindowSync } from '@/hooks/useWindowSync';
import { useConnectivityDetection } from '@/hooks/useConnectivityDetection';
import { useAudioEffects } from '@/components/game/blindTimer/hooks/useAudioEffects';

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
  
  // Initialize audio effects with GitHub-hosted files
  const { audioRefs, playAudioSafely: playAudioSafelyHook, unlockAudio } = useAudioEffects();

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

  // Control flags to prevent sound repetition
  const lastPlayedRef = React.useRef<{ alert: boolean; countdown: number; complete: boolean }>({
    alert: false,
    countdown: -1,
    complete: false,
  });

  // Calculate alert states with proper timing
  const isAlertTime = timeRemainingInLevel === 60 && state.isRunning;
  const isFinalCountdown = timeRemainingInLevel <= 4 && timeRemainingInLevel > 0 && state.isRunning;
  const isNewBlindAlert = state.isRunning && 
    state.elapsedTimeInLevel < 3 && 
    state.currentLevelIndex >= 0 && 
    currentLevel && 
    !currentLevel.isBreak;

  // Play audio safely using the correct hooks
  const playAudioSafely = useCallback((audioRef: React.MutableRefObject<HTMLAudioElement | null>, enabled: boolean) => {
    playAudioSafelyHook(audioRef, enabled);
  }, [playAudioSafelyHook]);

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
            if (prev.soundEnabled) {
              playAudioSafely(audioRefs.levelCompleteAudioRef, prev.soundEnabled);
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
      if (state.soundEnabled) {
        setTimeout(() => playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled), 100);
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
    if (state.soundEnabled) {
      setTimeout(() => {
        playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      }, 500);
    }
  }, [state.soundEnabled, playAudioSafely, audioRefs.alertAudioRef]);

  const testAudio = useCallback(() => {
    console.log('TIMER: Testando áudio completo...');
    
    if (!state.soundEnabled) {
      console.log('TIMER: Som desabilitado, não testando');
      return;
    }
    
    // Unlock audio first
    unlockAudio();
    
    // Test alert sound
    setTimeout(() => {
      console.log('TIMER: Testando som de alerta...');
      playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
    }, 100);
    
    // Test level complete sound
    setTimeout(() => {
      console.log('TIMER: Testando som de conclusão...');
      playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
    }, 1500);
  }, [state.soundEnabled, playAudioSafely, audioRefs.alertAudioRef, audioRefs.levelCompleteAudioRef, unlockAudio]);

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

  // Play alert sounds with proper control flags
  useEffect(() => {
    if (!state.soundEnabled || !state.isRunning) {
      return;
    }

    // 1-minute alert - play only once at exactly 60 seconds
    if (timeRemainingInLevel === 60 && !lastPlayedRef.current.alert) {
      console.log('🚨 REPRODUZINDO ALERTA DE 1 MINUTO');
      playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      lastPlayedRef.current.alert = true;
    }

    // Final countdown - play for each of the last 4 seconds
    if (timeRemainingInLevel <= 4 && timeRemainingInLevel > 0 && lastPlayedRef.current.countdown !== timeRemainingInLevel) {
      console.log(`⏱️ REPRODUZINDO CONTAGEM: ${timeRemainingInLevel} segundos`);
      playAudioSafely(audioRefs.countdownAudioRef, state.soundEnabled);
      lastPlayedRef.current.countdown = timeRemainingInLevel;
    }

    // Reset flags when appropriate
    if (timeRemainingInLevel > 60) {
      lastPlayedRef.current.alert = false;
    }
    if (timeRemainingInLevel > 4) {
      lastPlayedRef.current.countdown = -1;
    }
  }, [timeRemainingInLevel, state.soundEnabled, state.isRunning, playAudioSafely, audioRefs.alertAudioRef, audioRefs.countdownAudioRef]);

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