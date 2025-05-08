
import { useState, useEffect, useRef } from 'react';

// URLs para os arquivos de áudio no GitHub (usando a URL raw para acesso direto)
const AUDIO_URLS = {
  alert: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/alert.mp3',
  countdown: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/countdown.mp3',
  levelComplete: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/level-complete.mp3'
};

// Versão atual - para controle interno
const CURRENT_VERSION = '1.0.2';

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
        console.log('Inicializando áudio do GitHub');
        setIsLoading(true);
        
        // Criar elementos de áudio com as URLs diretas do GitHub
        const alertAudio = createAudioFromUrl(AUDIO_URLS.alert, 'alerta');
        const countdownAudio = createAudioFromUrl(AUDIO_URLS.countdown, 'contagem regressiva');
        const levelCompleteAudio = createAudioFromUrl(AUDIO_URLS.levelComplete, 'nível completo');
        
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
  
  // Criar um elemento Audio a partir de uma URL
  const createAudioFromUrl = (url: string, name: string): HTMLAudioElement => {
    try {
      console.log(`Criando elemento de áudio para ${name} a partir da URL: ${url}`);
      
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';
      
      // Adicionar event listeners para debug
      audio.addEventListener('canplaythrough', () => console.log(`Áudio ${name} carregado e pronto para reproduzir`));
      audio.addEventListener('error', (e) => console.error(`Erro ao carregar áudio ${name}:`, e.target));
      
      return audio;
    } catch (error) {
      console.error(`Erro ao criar áudio para ${name}:`, error);
      setLoadingErrors(prev => [...prev, `Erro ao criar áudio para ${name}: ${error}`]);
      return new Audio(); // Retorna um elemento de áudio vazio em caso de erro
    }
  };
  
  // Força recarregamento dos elementos de áudio
  const reloadAudioFiles = async () => {
    setIsLoading(true);
    setLoadingErrors([]);
    
    try {
      console.log('Recarregando arquivos de áudio do GitHub...');
      
      // Criar novos elementos de áudio
      const alertAudio = createAudioFromUrl(AUDIO_URLS.alert, 'alerta');
      const countdownAudio = createAudioFromUrl(AUDIO_URLS.countdown, 'contagem regressiva');
      const levelCompleteAudio = createAudioFromUrl(AUDIO_URLS.levelComplete, 'nível completo');
      
      // Tentar pré-carregar os áudios
      await Promise.all([
        preloadAudio(alertAudio, 'alerta'),
        preloadAudio(countdownAudio, 'contagem regressiva'),
        preloadAudio(levelCompleteAudio, 'nível completo')
      ]);
      
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
  
  // Função para pré-carregar áudio
  const preloadAudio = (audio: HTMLAudioElement, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audio) {
        reject(new Error(`Elemento de áudio para ${name} não foi criado`));
        return;
      }
      
      const onCanPlay = () => {
        console.log(`Áudio ${name} pré-carregado com sucesso`);
        audio.removeEventListener('canplaythrough', onCanPlay);
        resolve();
      };
      
      const onError = (e: Event) => {
        console.error(`Erro ao pré-carregar áudio ${name}:`, e);
        audio.removeEventListener('error', onError);
        reject(new Error(`Erro ao pré-carregar áudio ${name}`));
      };
      
      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);
      
      // Carregar os dados do áudio
      audio.load();
      
      // Definir um timeout para não ficar preso esperando indefinidamente
      setTimeout(() => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        console.log(`Tempo limite excedido para pré-carregar ${name}, continuando assim mesmo`);
        resolve();
      }, 5000);
    });
  };
  
  return {
    audioElements,
    isLoading,
    loadingErrors,
    reloadAudioFiles
  };
}
