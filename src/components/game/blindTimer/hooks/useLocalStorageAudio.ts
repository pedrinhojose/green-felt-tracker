
import { useState, useEffect, useRef } from 'react';

// URLs para os arquivos de áudio no GitHub (corrigido para .mp3)
const AUDIO_URLS = {
  alert: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/alert.mp3',
  countdown: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/countdown.mp3',
  levelComplete: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/level-complete.mp3'
};

// Chaves do localStorage
const STORAGE_KEYS = {
  alert: 'poker_audio_alert',
  countdown: 'poker_audio_countdown',
  levelComplete: 'poker_audio_level_complete',
  version: 'poker_audio_version'
};

// Versão atual - incremente quando os arquivos de áudio mudarem
const CURRENT_VERSION = '1.0.1'; // Incrementado para forçar a atualização com os novos arquivos

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

  // Inicializar elementos de áudio ao montar
  useEffect(() => {
    if (isInitialized) return;

    const initializeAudio = async () => {
      try {
        console.log('Inicializando áudio do localStorage');
        setIsLoading(true);
        
        // Verificar se precisamos atualizar os arquivos de áudio com base na versão
        const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
        const needsUpdate = !storedVersion || storedVersion !== CURRENT_VERSION;
        
        if (needsUpdate) {
          console.log('Atualização de versão de áudio necessária, baixando novos arquivos');
          await Promise.all([
            downloadAndStoreAudio('alert'),
            downloadAndStoreAudio('countdown'),
            downloadAndStoreAudio('levelComplete')
          ]);
          
          // Atualizar versão
          localStorage.setItem(STORAGE_KEYS.version, CURRENT_VERSION);
        } else {
          console.log('Usando arquivos de áudio em cache do localStorage');
        }
        
        // Criar elementos de áudio a partir dos dados do localStorage
        const alertAudio = createAudioFromLocalStorage(STORAGE_KEYS.alert);
        const countdownAudio = createAudioFromLocalStorage(STORAGE_KEYS.countdown);
        const levelCompleteAudio = createAudioFromLocalStorage(STORAGE_KEYS.levelComplete);
        
        setAudioElements({
          alertAudio,
          countdownAudio,
          levelCompleteAudio
        });
        
        console.log('Inicialização de áudio concluída');
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar áudio:', error);
        setLoadingErrors(prev => [...prev, String(error)]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAudio();
    
    return () => {
      // Limpeza
      console.log('Limpando elementos de áudio');
    };
  }, [isInitialized]);
  
  // Função para baixar áudio e armazenar no localStorage
  const downloadAndStoreAudio = async (type: 'alert' | 'countdown' | 'levelComplete') => {
    try {
      console.log(`Baixando áudio ${type}...`);
      const url = AUDIO_URLS[type];
      console.log(`URL do áudio: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar áudio ${type}: ${response.status} ${response.statusText}`);
      }
      
      // Obter áudio como blob e converter para base64
      const blob = await response.blob();
      console.log(`Tipo MIME do arquivo: ${blob.type}`); // Log do tipo MIME para debug
      
      const base64 = await blobToBase64(blob);
      
      // Armazenar no localStorage
      localStorage.setItem(STORAGE_KEYS[type], base64);
      console.log(`Áudio ${type} armazenado no localStorage`);
      
      return base64;
    } catch (error) {
      console.error(`Erro ao baixar áudio ${type}:`, error);
      throw error;
    }
  };
  
  // Converter blob para base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Falha ao converter blob para base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // Criar um elemento Audio a partir dos dados do localStorage
  const createAudioFromLocalStorage = (key: string): HTMLAudioElement | null => {
    try {
      const audioData = localStorage.getItem(key);
      if (!audioData) {
        console.warn(`Nenhum dado de áudio encontrado no localStorage para a chave: ${key}`);
        return null;
      }
      
      const audio = new Audio(audioData);
      audio.preload = 'auto';
      
      // Adicionar event listeners para debug
      audio.addEventListener('canplaythrough', () => console.log(`Áudio ${key} carregado e pronto para reproduzir`));
      audio.addEventListener('error', (e) => console.error(`Erro ao carregar áudio ${key}:`, e));
      
      return audio;
    } catch (error) {
      console.error(`Erro ao criar áudio do localStorage para chave: ${key}`, error);
      return null;
    }
  };
  
  // Forçar recarga manual dos arquivos de áudio
  const reloadAudioFiles = async () => {
    setIsLoading(true);
    setLoadingErrors([]);
    
    try {
      await Promise.all([
        downloadAndStoreAudio('alert'),
        downloadAndStoreAudio('countdown'),
        downloadAndStoreAudio('levelComplete')
      ]);
      
      // Atualizar versão
      localStorage.setItem(STORAGE_KEYS.version, CURRENT_VERSION);
      
      // Recriar elementos de áudio
      const alertAudio = createAudioFromLocalStorage(STORAGE_KEYS.alert);
      const countdownAudio = createAudioFromLocalStorage(STORAGE_KEYS.countdown);
      const levelCompleteAudio = createAudioFromLocalStorage(STORAGE_KEYS.levelComplete);
      
      setAudioElements({
        alertAudio,
        countdownAudio,
        levelCompleteAudio
      });
      
      console.log('Arquivos de áudio recarregados com sucesso');
    } catch (error) {
      console.error('Erro ao recarregar arquivos de áudio:', error);
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
