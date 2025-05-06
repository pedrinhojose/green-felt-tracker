import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePoker } from "@/contexts/PokerContext";
import { BlindLevel } from "@/lib/db/models";
import { Play, Pause, SkipForward, SkipBack, Maximize, Minimize } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BlindTimerProps {
  initialTime?: number;
}

export default function BlindTimer({ initialTime = 15 * 60 }: BlindTimerProps) {
  const { activeSeason } = usePoker();
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [blindLevels, setBlindLevels] = useState<BlindLevel[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<Date>(new Date());
  const [currentGameTime, setCurrentGameTime] = useState<number>(0);
  const [showLevelChange, setShowLevelChange] = useState<boolean>(false);
  const timerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const countdownSoundStarted = useRef<boolean>(false);
  
  // Calcular a porcentagem de progresso
  const calculateProgress = () => {
    if (!blindLevels[currentLevelIndex]) return 0;
    const totalTime = blindLevels[currentLevelIndex].duration * 60;
    return ((totalTime - currentTime) / totalTime) * 100;
  };
  
  // Verificar se o próximo nível é um intervalo
  const isNextLevelBreak = () => {
    if (currentLevelIndex + 1 >= blindLevels.length) return false;
    return blindLevels[currentLevelIndex + 1].isBreak;
  };
  
  // Calcular tempo até o próximo intervalo
  const calculateTimeToBreak = () => {
    let timeToBreak = 0;
    let foundBreak = false;
    
    for (let i = currentLevelIndex + 1; i < blindLevels.length; i++) {
      if (blindLevels[i].isBreak) {
        foundBreak = true;
        break;
      }
      timeToBreak += blindLevels[i].duration;
    }
    
    if (!foundBreak) return "Nenhum intervalo restante";
    
    return `${timeToBreak} min`;
  };
  
  // Inicializar estrutura de blinds da temporada ativa
  useEffect(() => {
    if (activeSeason?.blindStructure && activeSeason.blindStructure.length > 0) {
      setBlindLevels(activeSeason.blindStructure);
      
      // Definir o timer inicial com base no primeiro nível
      if (activeSeason.blindStructure[0]) {
        setCurrentTime(activeSeason.blindStructure[0].duration * 60);
      }
    } else {
      // Fallback para blind padrão se não houver estrutura definida
      setBlindLevels([
        {
          id: "default-1",
          level: 1,
          smallBlind: 25,
          bigBlind: 50,
          ante: 0,
          duration: 15,
          isBreak: false,
        },
        {
          id: "default-2",
          level: 2,
          smallBlind: 50,
          bigBlind: 100,
          ante: 0,
          duration: 15,
          isBreak: false,
        }
      ]);
    }
    setGameStartTime(new Date());
  }, [activeSeason]);
  
  // Gerenciar tempo decorrido de jogo
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRunning) {
        const now = new Date();
        const diffInSecs = Math.floor((now.getTime() - gameStartTime.getTime()) / 1000);
        setCurrentGameTime(diffInSecs);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerRunning, gameStartTime]);
  
  // Controle principal do timer
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerRunning) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
          // Verificar os últimos 5 segundos para tocar som
          if (prev <= 5 && prev > 0 && !countdownSoundStarted.current) {
            countdownSoundStarted.current = true;
            playCountdownSound();
          }
          
          if (prev <= 1) {
            // Quando o tempo acaba, avançar para o próximo nível
            handleNextLevel();
            countdownSoundStarted.current = false;
            // Se ainda houver níveis, retornar o tempo do próximo nível
            const nextIndex = currentLevelIndex + 1;
            if (nextIndex < blindLevels.length) {
              return blindLevels[nextIndex].duration * 60;
            }
            // Se não houver mais níveis, parar o timer
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      countdownSoundStarted.current = false;
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, currentLevelIndex, blindLevels]);
  
  // Efeito de animação quando muda de nível
  useEffect(() => {
    if (showLevelChange) {
      playLevelChangeSound();
      
      // Remover a animação após 3 segundos
      const timeout = setTimeout(() => {
        setShowLevelChange(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [showLevelChange]);
  
  // Formatar tempo como MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Formatar tempo total decorrido
  function formatElapsedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Reproduzir som suave de contagem regressiva nos últimos 5 segundos
  function playCountdownSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Tocar um som suave para cada segundo restante
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 500; // Frequência mais suave
          gainNode.gain.value = 0.15; // Volume mais baixo
          
          oscillator.start();
          
          // Diminuir gradualmente o som
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
          
          setTimeout(() => {
            oscillator.stop();
          }, 300);
        }, i * 1000);
      }
    } catch (e) {
      console.error("Erro ao reproduzir som de contagem regressiva:", e);
    }
  }
  
  // Som específico para mudança de nível
  function playLevelChangeSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Som mais suave para mudança de nível
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 600;
      gain.gain.value = 0.2;
      
      osc.start();
      
      // Desenhar a forma de onda para criar um som mais agradável
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        osc.stop();
      }, 500);
    } catch (e) {
      console.error("Erro ao reproduzir som de mudança de nível:", e);
    }
  }
  
  // Avançar para o próximo nível
  const handleNextLevel = () => {
    if (currentLevelIndex + 1 < blindLevels.length) {
      setCurrentLevelIndex(prev => prev + 1);
      setCurrentTime(blindLevels[currentLevelIndex + 1].duration * 60);
      setShowLevelChange(true);
    }
  };
  
  // Voltar para o nível anterior
  const handlePreviousLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
      setCurrentTime(blindLevels[currentLevelIndex - 1].duration * 60);
      setShowLevelChange(true);
    }
  };
  
  // Pausar ou retomar o timer
  const toggleTimer = () => {
    setTimerRunning(prev => !prev);
  };
  
  // Permitir posicionar o tempo clicando na barra de progresso
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !blindLevels[currentLevelIndex]) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    // Calcular o novo tempo baseado na porcentagem clicada
    const totalLevelTime = blindLevels[currentLevelIndex].duration * 60;
    const newTime = Math.round(totalLevelTime - (totalLevelTime * percentage));
    
    // Atualizar o tempo atual
    setCurrentTime(Math.max(1, newTime)); // Evitar que chegue a 0
  };
  
  // Alternar modo tela cheia
  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else if (timerRef.current) {
      timerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };
  
  // Verificar se o nível atual é um intervalo
  const isCurrentLevelBreak = blindLevels[currentLevelIndex]?.isBreak || false;
  
  return (
    <Card 
      ref={timerRef} 
      className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} overflow-hidden`}
    >
      <CardContent className="p-0 relative bg-poker-dark-green">
        {/* Barra de ouro na parte superior */}
        <div className="h-1 w-full bg-poker-gold"></div>
        
        <div className="flex flex-col">
          {/* Cabeçalho com nível atual */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className={`text-xl text-gray-300 uppercase font-medium transition-all ${showLevelChange ? 'scale-110' : ''}`}>
              {isCurrentLevelBreak ? "INTERVALO" : `NÍVEL ${blindLevels[currentLevelIndex]?.level || 1}`}
            </div>
          </div>
          
          {/* Valor de Small Blind e Big Blind */}
          <div className="bg-poker-black py-6 px-6 text-center">
            {!isCurrentLevelBreak && blindLevels[currentLevelIndex] && (
              <div className={`text-4xl md:text-5xl font-bold text-poker-gold transition-all ${showLevelChange ? 'scale-110' : ''}`}>
                {blindLevels[currentLevelIndex].smallBlind} / {blindLevels[currentLevelIndex].bigBlind}
                {blindLevels[currentLevelIndex].ante > 0 && ` / ${blindLevels[currentLevelIndex].ante}`}
              </div>
            )}
          </div>
          
          {/* Barra de progresso */}
          <div 
            ref={progressRef}
            className="w-full cursor-pointer" 
            onClick={handleProgressBarClick}
          >
            <Progress value={calculateProgress()} className="h-1 bg-gray-800" barClassName="bg-poker-gold" />
          </div>
          
          {/* Timer grande com informações laterais */}
          <div className="bg-poker-dark-green grid grid-cols-3 py-8 md:py-12">
            {/* Coluna esquerda - Níveis */}
            <div className="flex flex-col justify-center items-center">
              <div className="text-lg text-gray-400 uppercase mb-2">NÍVEL ATUAL</div>
              <div className="text-4xl font-bold text-poker-gold">
                {isCurrentLevelBreak ? "INTERVALO" : `${blindLevels[currentLevelIndex]?.level || 1}`}
              </div>
              
              <div className="mt-4 text-lg text-gray-400 uppercase mb-2">PRÓXIMO NÍVEL</div>
              <div className="text-3xl font-bold text-white">
                {currentLevelIndex + 1 < blindLevels.length ? 
                  (blindLevels[currentLevelIndex + 1].isBreak ? 
                    "INTERVALO" : 
                    `${blindLevels[currentLevelIndex + 1].level}`) : 
                  "Final"}
              </div>
              
              <div className="mt-4 text-lg text-gray-400 uppercase mb-2">BLINDS</div>
              <div className="text-3xl font-bold text-poker-gold">
                {!isCurrentLevelBreak && blindLevels[currentLevelIndex] && (
                  <>
                    {blindLevels[currentLevelIndex].smallBlind}/{blindLevels[currentLevelIndex].bigBlind}
                    {blindLevels[currentLevelIndex].ante > 0 && `/${blindLevels[currentLevelIndex].ante}`}
                  </>
                )}
              </div>
            </div>
            
            {/* Coluna central - Timer */}
            <div className="flex justify-center items-center">
              <div className="text-7xl md:text-9xl font-bold tabular-nums text-white">
                {formatTime(currentTime)}
              </div>
            </div>
            
            {/* Coluna direita - Informações de intervalo */}
            <div className="flex flex-col justify-center items-center">
              <div className="text-lg text-gray-400 uppercase mb-2">PRÓXIMO INTERVALO</div>
              <div className="text-4xl font-bold text-poker-gold">
                {calculateTimeToBreak()}
              </div>
              
              <div className="mt-4 text-lg text-gray-400 uppercase mb-2">PRÓXIMOS BLINDS</div>
              <div className="text-3xl font-bold text-white">
                {currentLevelIndex + 1 < blindLevels.length && !blindLevels[currentLevelIndex + 1].isBreak ? 
                  `${blindLevels[currentLevelIndex + 1].smallBlind}/${blindLevels[currentLevelIndex + 1].bigBlind}` : 
                  "-"}
              </div>
              
              <div className="mt-4 text-lg text-gray-400 uppercase mb-2">HORA ATUAL</div>
              <div className="text-3xl font-bold text-poker-gold">
                {format(new Date(), 'HH:mm', { locale: ptBR })}
              </div>
            </div>
          </div>
          
          {/* Controles do timer */}
          <div className="bg-poker-black flex justify-between items-center px-8 py-6">
            <Button
              onClick={handlePreviousLevel}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gray-700 bg-transparent hover:bg-gray-800"
              disabled={currentLevelIndex === 0}
            >
              <SkipBack size={20} className="text-gray-300" />
            </Button>
            
            <Button
              onClick={toggleTimer}
              className={`h-16 w-16 rounded-full ${timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {timerRunning ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            
            <Button
              onClick={handleNextLevel}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gray-700 bg-transparent hover:bg-gray-800"
              disabled={currentLevelIndex >= blindLevels.length - 1}
            >
              <SkipForward size={20} className="text-gray-300" />
            </Button>
          </div>
          
          {/* Barra de rodapé */}
          <div className="flex justify-between items-center bg-poker-black px-4 py-2">
            <div className="text-xs text-gray-400">Tempo de jogo: {formatElapsedTime(currentGameTime)}</div>
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
