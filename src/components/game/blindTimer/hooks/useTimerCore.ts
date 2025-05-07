
import { useRef } from "react";
import { BlindLevel } from "@/lib/db/models";
import { TimerState } from "../useTimerState";

export function useTimerCore(
  blindLevels: BlindLevel[],
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  playLevelCompleteSound: () => void
) {
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setState(prev => ({ ...prev, isRunning: true }));
    
    timerRef.current = window.setInterval(() => {
      setState(prev => {
        // Check if blind levels are configured
        if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
          return prev;
        }
        
        const newElapsedTimeInLevel = prev.elapsedTimeInLevel + 1;
        const currentLevel = blindLevels[prev.currentLevelIndex];
        
        // Check if current level is valid
        if (!currentLevel || typeof currentLevel.duration !== 'number') {
          return prev;
        }
        
        // If we've exceeded the current level's time
        if (newElapsedTimeInLevel >= currentLevel.duration * 60) {
          // Check if there's a next level
          if (prev.currentLevelIndex < blindLevels.length - 1) {
            // Play level completion sound if sound is enabled
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
            if (timerRef.current) {
              clearInterval(timerRef.current);
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
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState(prev => ({ ...prev, isRunning: false }));
  };

  // Clean up interval on unmount
  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return {
    startTimer,
    pauseTimer,
    cleanupTimer,
    timerRef
  };
}
