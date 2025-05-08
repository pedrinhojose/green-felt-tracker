
import { useState, useEffect, useRef } from 'react';

// URLs for the audio files on GitHub
const AUDIO_URLS = {
  alert: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/alert.mpeg',
  countdown: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/countdown.mpeg',
  levelComplete: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/level-complete.mpeg'
};

// Local storage keys
const STORAGE_KEYS = {
  alert: 'poker_audio_alert',
  countdown: 'poker_audio_countdown',
  levelComplete: 'poker_audio_level_complete',
  version: 'poker_audio_version'
};

// Current version - increment this when audio files change
const CURRENT_VERSION = '1.0.0';

export interface AudioElements {
  alertAudio: HTMLAudioElement | null;
  countdownAudio: HTMLAudioElement | null;
  levelCompleteAudio: HTMLAudioElement | null;
}

export function useLocalStorageAudio() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [audioElements, setAudioElements] = useState<AudioElements>({
    alertAudio: null,
    countdownAudio: null,
    levelCompleteAudio: null
  });
  const [loadingErrors, setLoadingErrors] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize audio elements on mount
  useEffect(() => {
    if (isInitialized) return;

    const initializeAudio = async () => {
      try {
        console.log('Initializing audio from localStorage');
        setIsLoading(true);
        
        // Check if we need to update the audio files based on version
        const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
        const needsUpdate = !storedVersion || storedVersion !== CURRENT_VERSION;
        
        if (needsUpdate) {
          console.log('Audio version update needed, downloading new files');
          await Promise.all([
            downloadAndStoreAudio('alert'),
            downloadAndStoreAudio('countdown'),
            downloadAndStoreAudio('levelComplete')
          ]);
          
          // Update version
          localStorage.setItem(STORAGE_KEYS.version, CURRENT_VERSION);
        } else {
          console.log('Using cached audio files from localStorage');
        }
        
        // Create audio elements from localStorage data
        const alertAudio = createAudioFromLocalStorage(STORAGE_KEYS.alert);
        const countdownAudio = createAudioFromLocalStorage(STORAGE_KEYS.countdown);
        const levelCompleteAudio = createAudioFromLocalStorage(STORAGE_KEYS.levelComplete);
        
        setAudioElements({
          alertAudio,
          countdownAudio,
          levelCompleteAudio
        });
        
        console.log('Audio initialization completed');
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
        setLoadingErrors(prev => [...prev, String(error)]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAudio();
    
    return () => {
      // Cleanup
      console.log('Cleaning up audio elements');
    };
  }, [isInitialized]);
  
  // Function to download audio and store in localStorage
  const downloadAndStoreAudio = async (type: 'alert' | 'countdown' | 'levelComplete') => {
    try {
      console.log(`Downloading ${type} audio...`);
      const url = AUDIO_URLS[type];
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} audio: ${response.status}`);
      }
      
      // Get audio as blob and convert to base64
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS[type], base64);
      console.log(`${type} audio stored in localStorage`);
      
      return base64;
    } catch (error) {
      console.error(`Error downloading ${type} audio:`, error);
      throw error;
    }
  };
  
  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // Create an Audio element from localStorage data
  const createAudioFromLocalStorage = (key: string): HTMLAudioElement | null => {
    try {
      const audioData = localStorage.getItem(key);
      if (!audioData) {
        console.warn(`No audio data found in localStorage for key: ${key}`);
        return null;
      }
      
      const audio = new Audio(audioData);
      audio.preload = 'auto';
      
      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => console.log(`Audio ${key} loaded and ready to play`));
      audio.addEventListener('error', (e) => console.error(`Error loading audio ${key}:`, e));
      
      return audio;
    } catch (error) {
      console.error(`Error creating audio from localStorage for key: ${key}`, error);
      return null;
    }
  };
  
  // Manually force reload of audio files
  const reloadAudioFiles = async () => {
    setIsLoading(true);
    setLoadingErrors([]);
    
    try {
      await Promise.all([
        downloadAndStoreAudio('alert'),
        downloadAndStoreAudio('countdown'),
        downloadAndStoreAudio('levelComplete')
      ]);
      
      // Update version
      localStorage.setItem(STORAGE_KEYS.version, CURRENT_VERSION);
      
      // Recreate audio elements
      const alertAudio = createAudioFromLocalStorage(STORAGE_KEYS.alert);
      const countdownAudio = createAudioFromLocalStorage(STORAGE_KEYS.countdown);
      const levelCompleteAudio = createAudioFromLocalStorage(STORAGE_KEYS.levelComplete);
      
      setAudioElements({
        alertAudio,
        countdownAudio,
        levelCompleteAudio
      });
      
      console.log('Audio files reloaded successfully');
    } catch (error) {
      console.error('Error reloading audio files:', error);
      setLoadingErrors(prev => [...prev, String(error)]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    audioElements,
    isLoading,
    loadingErrors,
    reloadAudioFiles
  };
}
