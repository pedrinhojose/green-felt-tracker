import { useState, useCallback, useEffect } from 'react';
import { BlindLevel } from '@/lib/db/models';
import { TimerState } from '@/contexts/TimerContext';

const STORAGE_KEY_PREFIX = 'poker_timer_state_';

export function useTimerPersistence(gameId: string, blindLevels: BlindLevel[]) {
  console.log('=== TIMER PERSISTENCE - INICIALIZANDO ===');
  console.log('GameId:', gameId);
  console.log('Blind levels:', blindLevels?.length || 0);

  const storageKey = `${STORAGE_KEY_PREFIX}${gameId}`;

  // Initialize state with default values
  const defaultState: TimerState = {
    isRunning: false,
    currentLevelIndex: 0,
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
    isOnline: navigator.onLine,
    lastSyncTime: Date.now()
  };

  const [state, setState] = useState<TimerState>(() => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved) as TimerState;
        console.log('PERSISTENCE: Estado carregado do localStorage:', parsedState);
        
        // Validate state integrity
        if (isStateValid(parsedState, blindLevels)) {
          return {
            ...parsedState,
            isOnline: navigator.onLine, // Always update online status
            isRunning: false // Never start with timer running
          };
        } else {
          console.log('PERSISTENCE: Estado inválido encontrado, usando padrão');
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('PERSISTENCE: Erro ao carregar estado:', error);
      localStorage.removeItem(storageKey);
    }
    
    console.log('PERSISTENCE: Usando estado padrão');
    return defaultState;
  });

  // Validate state integrity
  function isStateValid(timerState: TimerState, levels: BlindLevel[]): boolean {
    try {
      // Check basic structure
      if (!timerState || typeof timerState !== 'object') {
        console.log('PERSISTENCE: Estado não é um objeto válido');
        return false;
      }

      // Check required properties
      const requiredProps = ['currentLevelIndex', 'elapsedTimeInLevel', 'totalElapsedTime'];
      for (const prop of requiredProps) {
        if (typeof timerState[prop as keyof TimerState] !== 'number') {
          console.log(`PERSISTENCE: Propriedade ${prop} inválida`);
          return false;
        }
      }

      // Check level index bounds
      if (timerState.currentLevelIndex < 0 || 
          timerState.currentLevelIndex >= levels.length) {
        console.log('PERSISTENCE: currentLevelIndex fora dos limites');
        return false;
      }

      // Check elapsed time bounds
      const currentLevel = levels[timerState.currentLevelIndex];
      if (currentLevel && typeof currentLevel.duration === 'number') {
        const maxTime = currentLevel.duration * 60;
        if (timerState.elapsedTimeInLevel < 0 || 
            timerState.elapsedTimeInLevel > maxTime) {
          console.log('PERSISTENCE: elapsedTimeInLevel fora dos limites');
          return false;
        }
      }

      // Check timestamp recency (don't load very old states)
      if (timerState.lastSyncTime) {
        const timeDiff = Date.now() - timerState.lastSyncTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (timeDiff > maxAge) {
          console.log('PERSISTENCE: Estado muito antigo');
          return false;
        }
      }

      console.log('PERSISTENCE: Estado válido');
      return true;
    } catch (error) {
      console.error('PERSISTENCE: Erro na validação:', error);
      return false;
    }
  }

  // Save state to localStorage
  const saveState = useCallback((newState: TimerState) => {
    try {
      const stateToSave = {
        ...newState,
        lastSyncTime: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      console.log('PERSISTENCE: Estado salvo:', stateToSave);
    } catch (error) {
      console.error('PERSISTENCE: Erro ao salvar estado:', error);
      
      // If localStorage is full, try to clear old timer states
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_PREFIX) && key !== storageKey) {
            localStorage.removeItem(key);
            console.log('PERSISTENCE: Removido estado antigo:', key);
          }
        }
        // Try saving again
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (retryError) {
        console.error('PERSISTENCE: Falha ao salvar após limpeza:', retryError);
      }
    }
  }, [storageKey]);

  // Clear state from localStorage
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log('PERSISTENCE: Estado limpo');
    } catch (error) {
      console.error('PERSISTENCE: Erro ao limpar estado:', error);
    }
  }, [storageKey]);

  // Auto-save state when it changes
  useEffect(() => {
    saveState(state);
  }, [state, saveState]);

  // Clear old states periodically
  useEffect(() => {
    const cleanup = () => {
      try {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            try {
              const saved = localStorage.getItem(key);
              if (saved) {
                const parsedState = JSON.parse(saved) as TimerState;
                if (parsedState.lastSyncTime && 
                    (now - parsedState.lastSyncTime) > maxAge) {
                  localStorage.removeItem(key);
                  console.log('PERSISTENCE: Removido estado expirado:', key);
                }
              }
            } catch (parseError) {
              // Remove corrupted entries
              localStorage.removeItem(key);
              console.log('PERSISTENCE: Removido estado corrompido:', key);
            }
          }
        }
      } catch (error) {
        console.error('PERSISTENCE: Erro na limpeza:', error);
      }
    };

    // Run cleanup on mount and then periodically
    cleanup();
    const interval = setInterval(cleanup, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, []);

  return {
    state,
    setState,
    saveState,
    clearState,
    isStateValid: (timerState: TimerState) => isStateValid(timerState, blindLevels)
  };
}