import { useState, useEffect, useCallback } from 'react';
import { BlindLevel } from '@/lib/db/models';
import { useLevelTime } from './hooks/useLevelTime';
import { useTimerAlerts } from './hooks/useTimerAlerts';
import { useBreakInfo } from './hooks/useBreakInfo';

export interface TimerState {
  isRunning: boolean;
  currentLevelIndex: number;
  elapsedTimeInLevel: number;
  totalElapsedTime: number;
  showAlert: boolean;
  soundEnabled: boolean;
}

export function useTimerState(blindLevels: BlindLevel[], seasonId?: string, gameId?: string) {
  console.log("=== TIMER STATE HOOK DEBUG ===");
  console.log("Blind levels received:", blindLevels?.length);
  console.log("Season ID:", seasonId);
  console.log("Game ID:", gameId);
  
  // Sort the blind levels to ensure correct order
  const sortedBlindLevels = blindLevels ? [...blindLevels].sort((a, b) => a.level - b.level) : [];
  
  console.log("Sorted blind levels:", sortedBlindLevels?.length);
  if (sortedBlindLevels?.length > 0) {
    console.log("First level:", sortedBlindLevels[0]);
    console.log("Last level:", sortedBlindLevels[sortedBlindLevels.length - 1]);
  }
  
  // Initialize timer state
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    currentLevelIndex: 0,
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
  });
  
  // Force timer to start at level 0 if necessary
  useEffect(() => {
    console.log("=== LEVEL VALIDATION ===");
    console.log("Current level index:", state.currentLevelIndex);
    console.log("Sorted blind levels length:", sortedBlindLevels?.length);
    
    if (sortedBlindLevels?.length > 0 && state.currentLevelIndex !== 0) {
      console.log("Forcing return to level 0");
      setState(prev => ({
        ...prev,
        currentLevelIndex: 0,
        elapsedTimeInLevel: 0,
        totalElapsedTime: 0,
        isRunning: false
      }));
    }
  }, [sortedBlindLevels, state.currentLevelIndex]);
  
  // Validate and fix invalid level indexes
  useEffect(() => {
    if (sortedBlindLevels?.length > 0) {
      if (state.currentLevelIndex < 0 || state.currentLevelIndex >= sortedBlindLevels.length) {
        console.log("Invalid index detected, resetting to 0");
        setState(prev => ({
          ...prev,
          currentLevelIndex: 0,
          elapsedTimeInLevel: 0,
          totalElapsedTime: 0,
          isRunning: false
        }));
      }
    }
  }, [state.currentLevelIndex, sortedBlindLevels]);
  
  // Log current state for debugging
  useEffect(() => {
    console.log("=== CURRENT TIMER STATE ===");
    console.log("Current level index:", state.currentLevelIndex);
    console.log("Is running:", state.isRunning);
    console.log("Elapsed time in level:", state.elapsedTimeInLevel);
    console.log("Total elapsed time:", state.totalElapsedTime);
    console.log("Show alert:", state.showAlert);
    console.log("Sound enabled:", state.soundEnabled);
  }, [state]);
  
  // Get current and next level information
  const currentLevel = sortedBlindLevels?.[state.currentLevelIndex] || null;
  const nextLevel = sortedBlindLevels?.[state.currentLevelIndex + 1] || null;
  const isLastLevel = state.currentLevelIndex === sortedBlindLevels.length - 1;
  
  // Calculate time remaining in current level
  const timeRemainingInLevel = currentLevel ? 
    Math.max(0, (currentLevel.duration * 60) - state.elapsedTimeInLevel) : 0;
  
  // Use timer alerts hook with correct parameters
  const alertState = useTimerAlerts(currentLevel, timeRemainingInLevel, state);
  
  // Use break info hook
  const breakInfo = useBreakInfo(sortedBlindLevels, state.currentLevelIndex);
  
  // Check if current level is a break
  const isBreakTime = currentLevel?.isBreak || false;
  
  return {
    state,
    setState,
    currentLevel,
    nextLevel,
    isLastLevel,
    showNextLevelAlert: alertState.isNewBlindAlert,
    showBreakAlert: alertState.showAlert,
    isBreakTime,
    breakInfo: breakInfo.nextBreak,
    sortedBlindLevels
  };
}