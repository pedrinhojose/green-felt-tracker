
import { useEffect, useRef } from "react";
import { useLocalStorageAudio } from "./useLocalStorageAudio";

export interface AudioRefs {
  alertAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  countdownAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  levelCompleteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function useAudioEffects() {
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Flag to control audio loading
  const audioLoadedRef = useRef<boolean>(false);
  
  // Use our new localStorage audio hook
  const { audioElements, isLoading } = useLocalStorageAudio();
  
  // Initialize audio references
  useEffect(() => {
    if (audioLoadedRef.current) return;
    if (isLoading) return; // Wait until audio is loaded from localStorage
    
    try {
      console.log("Initializing audio elements from localStorage");
      
      // Assign the audio elements from localStorage to our refs
      if (audioElements.alertAudio) {
        alertAudioRef.current = audioElements.alertAudio;
        console.log("Alert audio loaded from localStorage");
      }
      
      if (audioElements.countdownAudio) {
        countdownAudioRef.current = audioElements.countdownAudio;
        console.log("Countdown audio loaded from localStorage");
      }
      
      if (audioElements.levelCompleteAudio) {
        levelCompleteAudioRef.current = audioElements.levelCompleteAudio;
        console.log("Level complete audio loaded from localStorage");
      }
      
      // Add event listeners for debugging
      const addAudioEventListeners = (audio: HTMLAudioElement, name: string) => {
        audio.addEventListener('canplaythrough', () => console.log(`Audio ${name} loaded and ready to play`));
        audio.addEventListener('error', (e) => console.error(`Error loading audio ${name}:`, e));
      };
      
      if (alertAudioRef.current) addAudioEventListeners(alertAudioRef.current, 'alerta');
      if (countdownAudioRef.current) addAudioEventListeners(countdownAudioRef.current, 'contagem regressiva');
      if (levelCompleteAudioRef.current) addAudioEventListeners(levelCompleteAudioRef.current, 'conclusão de nível');

      // Mark audio as loaded
      audioLoadedRef.current = true;
      console.log("All audio prepared for playback");
      
    } catch (e) {
      console.error("Error initializing audio files:", e);
    }

    // Cleanup function when component unmounts
    return () => {
      console.log("Cleaning up audio references");
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current = null;
      }
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current = null;
      }
      if (levelCompleteAudioRef.current) {
        levelCompleteAudioRef.current.pause();
        levelCompleteAudioRef.current = null;
      }
    };
  }, [audioElements, isLoading]);

  // Function to unlock audio on iOS/Safari
  const unlockAudio = () => {
    console.log("Trying to unlock audio...");
    // Create temporary audio to unlock
    const silentAudio = new Audio();
    silentAudio.play().then(() => {
      console.log("Audio unlocked successfully");
    }).catch(error => {
      console.warn("Could not automatically unlock audio:", error);
    });
    
    // Try to unlock each audio reference
    [alertAudioRef, countdownAudioRef, levelCompleteAudioRef].forEach(ref => {
      if (ref.current) {
        const tempVolume = ref.current.volume;
        ref.current.volume = 0;
        ref.current.play().then(() => {
          ref.current!.pause();
          ref.current!.currentTime = 0;
          ref.current!.volume = tempVolume;
        }).catch(e => {
          console.warn("Attempt to unlock audio failed:", e);
        });
      }
    });
  };

  // Function to safely play audio
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current) {
      console.log("Sound disabled or audio reference not available");
      return;
    }
    
    try {
      // Debug to check if audio is available
      console.log("Trying to play audio:", audioRef.current.src, "Current state:", audioRef.current.readyState);
      
      // Reset audio
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      
      // Try to unlock audio first
      unlockAudio();
      
      // Use play() method and handle the resulting promise
      await audioRef.current.play()
        .then(() => console.log("Audio started successfully"))
        .catch((error) => {
          console.error("Error playing audio:", error);
          
          if (error.name === "NotAllowedError") {
            console.warn("Autoplay blocked. User interaction required first.");
            unlockAudio();
          }
        });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return {
    audioRefs: {
      alertAudioRef,
      countdownAudioRef,
      levelCompleteAudioRef
    },
    playAudioSafely,
    unlockAudio
  };
}
