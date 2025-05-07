
import { useEffect, useRef } from "react";

export interface AudioRefs {
  alertAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  countdownAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  levelCompleteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function useAudioEffects() {
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Flag for audio loading state
  const audioLoadedRef = useRef<boolean>(false);

  // Initialize audio references
  useEffect(() => {
    if (audioLoadedRef.current) return;
    
    try {
      alertAudioRef.current = new Audio("/alert.mp3");
      countdownAudioRef.current = new Audio("/countdown.mp3");
      levelCompleteAudioRef.current = new Audio("/level-complete.mp3");

      // Preload audio files
      const preloadAudio = async () => {
        try {
          if (alertAudioRef.current) {
            alertAudioRef.current.load();
            await alertAudioRef.current.play();
            alertAudioRef.current.pause();
            alertAudioRef.current.currentTime = 0;
          }
          
          if (countdownAudioRef.current) {
            countdownAudioRef.current.load();
            await countdownAudioRef.current.play();
            countdownAudioRef.current.pause();
            countdownAudioRef.current.currentTime = 0;
          }
          
          if (levelCompleteAudioRef.current) {
            levelCompleteAudioRef.current.load();
            await levelCompleteAudioRef.current.play();
            levelCompleteAudioRef.current.pause();
            levelCompleteAudioRef.current.currentTime = 0;
          }
          
          audioLoadedRef.current = true;
          console.log("Audio files preloaded successfully");
        } catch (e) {
          console.error("Error preloading audio:", e);
        }
      };
      
      preloadAudio();
    } catch (e) {
      console.error("Error initializing audio files:", e);
    }
  }, []);

  // Function to safely play audio
  const playAudioSafely = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>, soundEnabled: boolean) => {
    if (!soundEnabled || !audioRef.current) return;
    
    try {
      audioRef.current.currentTime = 0; // Reset audio
      await audioRef.current.play();
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
    playAudioSafely
  };
}
