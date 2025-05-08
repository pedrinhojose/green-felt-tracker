
import { useState, useEffect, useRef } from 'react';

// URLs para os arquivos de áudio no GitHub (usando a URL raw para acesso direto)
const AUDIO_URLS = {
  alert: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/alert.mp3',
  countdown: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/countdown.mp3',
  levelComplete: 'https://raw.githubusercontent.com/pedrinhojose/AudiosPoker/main/level-complete.mp3'
};

// URLs de backup caso o GitHub falhe
const BACKUP_URLS = {
  alert: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
  countdown: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  levelComplete: 'https://assets.mixkit.co/active_storage/sfx/1008/1008-preview.mp3'
};

// Versão atual - para controle interno
const CURRENT_VERSION = '1.0.3';

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
  const [useBackupUrls, setUseBackupUrls] = useState<boolean>(false);
  
  // Referência para controle de tentativas
  const attemptsRef = useRef(0);

  // Inicializar elementos de áudio ao montar
  useEffect(() => {
    if (isInitialized) return;

    const initializeAudio = async () => {
      try {
        console.log('Inicializando áudio com arquivos diretos do GitHub');
        setIsLoading(true);
        
        // Escolher URLs baseado nas tentativas anteriores
        const urls = useBackupUrls ? BACKUP_URLS : AUDIO_URLS;
        
        // Criar elementos de áudio e configurá-los para carregamento imediato
        const alertAudio = createOptimizedAudio(urls.alert, 'alerta');
        const countdownAudio = createOptimizedAudio(urls.countdown, 'contagem regressiva');
        const levelCompleteAudio = createOptimizedAudio(urls.levelComplete, 'nível completo');
        
        setAudioElements({
          alertAudio,
          countdownAudio,
          levelCompleteAudio
        });
        
        // Tentar imediatamente pré-carregar todos os áudios
        await Promise.all([
          preloadAudioWithFallback(alertAudio),
          preloadAudioWithFallback(countdownAudio),
          preloadAudioWithFallback(levelCompleteAudio)
        ]);
        
        console.log('Todos os áudios inicializados e pré-carregados com sucesso');
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar áudio:', error);
        setLoadingErrors(prev => [...prev, String(error)]);
        
        // Se falhou e não estamos usando URLs de backup ainda, tente novamente com backup
        if (!useBackupUrls && attemptsRef.current < 3) {
          console.log('Tentando URLs de backup após falha...');
          setUseBackupUrls(true);
          attemptsRef.current++;
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAudio();
    
    // Limpar variáveis
    return () => {
      console.log('Limpando elementos de áudio');
    };
  }, [isInitialized, useBackupUrls]);
  
  // Cria um elemento Audio otimizado para reprodução
  const createOptimizedAudio = (url: string, name: string): HTMLAudioElement => {
    try {
      console.log(`Criando elemento de áudio otimizado para ${name}: ${url}`);
      
      const audio = new Audio();
      
      // Configurações ideais para reprodução rápida em dispositivos móveis
      audio.preload = 'auto';
      audio.autoplay = false;  // Importante: não tente autoplay
      audio.src = url;
      
      // Configurações para iOS/Safari
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.crossOrigin = 'anonymous'; // Permita CORS
      
      // Event listeners
      audio.addEventListener('canplaythrough', () => console.log(`Áudio ${name} carregado e pronto: ${url}`));
      audio.addEventListener('error', (e) => {
        console.error(`Erro ao carregar áudio ${name}:`, e, 
                      'código:', (audio.error ? audio.error.code : 'desconhecido'),
                      'mensagem:', (audio.error ? audio.error.message : 'desconhecida'));
      });
      
      return audio;
    } catch (error) {
      console.error(`Erro ao criar áudio para ${name}:`, error);
      setLoadingErrors(prev => [...prev, `Erro ao criar áudio para ${name}: ${error}`]);
      return new Audio(); // Retorna um elemento vazio em caso de erro
    }
  };
  
  // Função para pré-carregar áudio com fallback
  const preloadAudioWithFallback = async (audio: HTMLAudioElement): Promise<void> => {
    if (!audio || !audio.src) {
      console.warn('Tentativa de pré-carregar áudio inválido');
      return;
    }
    
    return new Promise((resolve) => {
      // Verificar se já está carregado
      if (audio.readyState >= 3) {
        console.log(`Áudio já está pré-carregado: ${audio.src}`);
        resolve();
        return;
      }
      
      // Ouvintes de eventos
      const onCanPlay = () => {
        console.log(`Áudio pré-carregado com sucesso: ${audio.src}`);
        cleanup();
        resolve();
      };
      
      const onError = () => {
        console.warn(`Falha ao pré-carregar áudio: ${audio.src}`, 
                     'código:', (audio.error ? audio.error.code : 'desconhecido'));
        cleanup();
        resolve(); // Resolver mesmo com erro para não bloquear
      };
      
      const onTimeout = () => {
        console.warn(`Tempo limite excedido para pré-carregar: ${audio.src}`);
        cleanup();
        resolve();
      };
      
      // Limpa os ouvintes
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        clearTimeout(timeoutId);
      };
      
      // Adicionar os ouvintes
      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);
      
      // Definir timeout para não bloquear por muito tempo
      const timeoutId = setTimeout(onTimeout, 5000);
      
      // Forçar carregamento
      audio.load();
      
      // Usar técnica hack para dispositivos móveis - adicionar ao DOM temporariamente
      if (!document.body.contains(audio)) {
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.width = '0';
        tempContainer.style.height = '0';
        tempContainer.style.overflow = 'hidden';
        tempContainer.appendChild(audio);
        document.body.appendChild(tempContainer);
        
        setTimeout(() => {
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        }, 5000);
      }
    });
  };
  
  // Força recarregamento dos elementos de áudio
  const reloadAudioFiles = async () => {
    console.log('Forçando recarregamento dos arquivos de áudio...');
    setIsLoading(true);
    setLoadingErrors([]);
    setIsInitialized(false); // Isso forçará a reinicialização
    attemptsRef.current = 0;
    setUseBackupUrls(false); // Resetar para URLs primárias
  };
  
  return {
    audioElements,
    isLoading,
    loadingErrors,
    reloadAudioFiles
  };
}
