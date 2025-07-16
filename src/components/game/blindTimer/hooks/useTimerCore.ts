
import { useCallback, useRef } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "../useTimerState";

export function useTimerCore(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  playLevelCompleteSound: () => void
) {
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    console.log("=== TIMER CORE - INICIANDO ===");
    console.log("Blind levels disponíveis:", blindLevels?.length || 0);
    console.log("Estado atual:", state);
    
    // Validação robusta dos blind levels
    if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
      console.error("❌ ERRO: Blind levels não configurados ou vazios");
      return;
    }
    
    // Verificar se o nível atual é válido
    const currentLevel = blindLevels[state.currentLevelIndex];
    if (!currentLevel) {
      console.error("❌ ERRO: Nível atual inválido", state.currentLevelIndex);
      return;
    }
    
    if (typeof currentLevel.duration !== 'number' || currentLevel.duration <= 0) {
      console.error("❌ ERRO: Duração do nível inválida", currentLevel);
      return;
    }
    
    console.log("✅ Validação dos blind levels passou");
    console.log("Nível atual:", currentLevel);
    
    // Clear any existing interval
    if (timerRef.current) {
      console.log("Limpando timer existente");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Force timer to running state immediately
    setState(prev => {
      console.log("Forçando estado para isRunning: true");
      return { ...prev, isRunning: true };
    });
    
    // Start a new interval
    timerRef.current = window.setInterval(() => {
      console.log("=== TIMER TICK ===");
      setState(prev => {
        // Safety check: if timer is not running anymore, stop
        if (!prev.isRunning) {
          console.log("⚠️ Timer não está mais rodando, parando interval");
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }
        
        // Double-check blind levels inside interval
        if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
          console.error("❌ TICK: Blind levels perdidos");
          return prev;
        }
        
        const newElapsedTimeInLevel = prev.elapsedTimeInLevel + 1;
        const currentLevel = blindLevels[prev.currentLevelIndex];
        
        // Check if current level is valid
        if (!currentLevel || typeof currentLevel.duration !== 'number') {
          console.error("❌ TICK: Nível atual inválido", prev.currentLevelIndex);
          return prev;
        }
        
        const totalLevelTime = currentLevel.duration * 60;
        console.log(`Timer tick: ${newElapsedTimeInLevel}s / ${totalLevelTime}s (Level ${currentLevel.level})`);
        
        // If we've exceeded the current level's time
        if (newElapsedTimeInLevel >= totalLevelTime) {
          // Check if there's a next level
          if (prev.currentLevelIndex < blindLevels.length - 1) {
            // Play level completion sound if sound is enabled
            console.log("✅ Nível completo, mudando para próximo");
            playLevelCompleteSound();
            
            return {
              ...prev,
              currentLevelIndex: prev.currentLevelIndex + 1,
              elapsedTimeInLevel: 0,
              totalElapsedTime: prev.totalElapsedTime + 1,
              showAlert: true, // Show alert when changing levels
            };
          } else {
            // End of all levels
            console.log("✅ Todos os níveis completos, parando timer");
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return {
              ...prev,
              isRunning: false,
              totalElapsedTime: prev.totalElapsedTime + 1,
            };
          }
        }
        
        // Normal timer update
        return {
          ...prev,
          elapsedTimeInLevel: newElapsedTimeInLevel,
          totalElapsedTime: prev.totalElapsedTime + 1,
        };
      });
    }, 1000);
    
    console.log("✅ Timer interval configurado:", timerRef.current);
  }, [blindLevels, state, setState, playLevelCompleteSound]);

  const pauseTimer = useCallback(() => {
    console.log("Pausing timer");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log("Timer interval cleared");
    }
    setState(prev => ({ ...prev, isRunning: false }));
  }, [setState]);

  // Clean up interval on unmount
  const cleanupTimer = useCallback(() => {
    console.log("Cleaning up timer");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    startTimer,
    pauseTimer,
    cleanupTimer,
    timerRef
  };
}
