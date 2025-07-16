
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
    console.log("Timer starting...");
    
    // Clear any existing interval
    if (timerRef.current) {
      console.log("Clearing existing timer interval");
      clearInterval(timerRef.current);
    }
    
    // Set timer to running state
    setState(prev => ({ ...prev, isRunning: true }));
    console.log("Timer state set to running");
    
    // Start a new interval
    timerRef.current = window.setInterval(() => {
      setState(prev => {
        // Check if blind levels are configured
        if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
          console.log("No blind levels found, stopping timer");
          return prev;
        }
        
        const newElapsedTimeInLevel = prev.elapsedTimeInLevel + 1;
        const currentLevel = blindLevels[prev.currentLevelIndex];
        
        // Check if current level is valid
        if (!currentLevel || typeof currentLevel.duration !== 'number') {
          console.log("Invalid current level, stopping timer");
          return prev;
        }
        
        console.log(`Timer tick: ${newElapsedTimeInLevel}s / ${currentLevel.duration * 60}s`);
        
        // If we've exceeded the current level's time
        if (newElapsedTimeInLevel >= currentLevel.duration * 60) {
          // Check if there's a next level
          if (prev.currentLevelIndex < blindLevels.length - 1) {
            // Play level completion sound if sound is enabled
            console.log("Level complete, moving to next level");
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
            console.log("All levels complete, stopping timer");
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
    
    console.log("Timer interval set", timerRef.current);
  }, [blindLevels, setState, playLevelCompleteSound]);

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
