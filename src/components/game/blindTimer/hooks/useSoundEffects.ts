
import { useEffect } from "react";
import { AudioRefs } from "./useAudioEffects";
import { TimerState } from "../useTimerState";

export function useSoundEffects(
  timeRemainingInLevel: number,
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  audioRefs: AudioRefs,
  playAudioSafely: (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => Promise<void>
) {
  // Handle sound effects based on timer state
  useEffect(() => {
    if (!state.soundEnabled) return;
    
    if (timeRemainingInLevel === 60 && state.isRunning) {
      // Alert for 1 minute remaining
      setState(prev => ({ ...prev, showAlert: true }));
      playAudioSafely(audioRefs.alertAudioRef, state.soundEnabled);
      
      // Clear alert after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 2000);
    } else if (timeRemainingInLevel <= 5 && timeRemainingInLevel > 0 && state.isRunning) {
      // Countdown sounds
      playAudioSafely(audioRefs.countdownAudioRef, state.soundEnabled);
    } else if (timeRemainingInLevel === 0 && state.isRunning) {
      // Level completion sound
      playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
      
      // Highlight new blinds for 2 seconds
      setState(prev => ({ ...prev, showAlert: true }));
      setTimeout(() => {
        setState(prev => ({ ...prev, showAlert: false }));
      }, 2000);
    }
  }, [timeRemainingInLevel, state.isRunning, state.soundEnabled]);

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    
    // Test if sound works when enabled
    if (!state.soundEnabled) {
      playAudioSafely(audioRefs.alertAudioRef, true);
    }
  };

  const playLevelCompleteSound = () => {
    playAudioSafely(audioRefs.levelCompleteAudioRef, state.soundEnabled);
  };

  return {
    toggleSound,
    playLevelCompleteSound
  };
}
