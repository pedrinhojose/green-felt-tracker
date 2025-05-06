
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePoker } from "@/contexts/PokerContext";
import { BlindLevel } from "@/lib/db/models";
import { Maximize, Minimize, SkipBack, SkipForward, Pause, Play } from "lucide-react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Reproduzir som suave de contagem regressiva nos últimos 5 segundos
  const playCountdownSound = () => {
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
          oscillator.frequency.value = 600; // Frequência mais suave
          gainNode.gain.value = 0.2; // Volume mais baixo
          
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
  };
  
  // Som específico para mudança de nível
  const playLevelChangeSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Som mais suave para mudança de nível
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      
      osc.start();
      
      // Desenhar a forma de onda para criar um som mais agradável
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        osc.stop();
      }, 500);
    } catch (e) {
      console.error("Erro ao reproduzir som de mudança de nível:", e);
    }
  };
  
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
      className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none flex flex-col' : ''}`}
    >
      <CardHeader className={`pb-2 ${isFullscreen ? 'flex-shrink-0' : ''}`}>
        <CardTitle className="flex justify-between items-center">
          <span>Cronômetro de Blinds</span>
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isFullscreen ? 'flex-grow flex flex-col justify-center' : ''}`}>
        <div className={`flex flex-col items-center ${isFullscreen ? 'h-full justify-center' : ''}`}>
          {/* Nível atual e valores */}
          <div className={`text-center mb-4 transition-all duration-300 ${showLevelChange ? 'scale-150 animate-pulse' : ''}`}>
            {blindLevels[currentLevelIndex] && (
              <>
                <div className="text-sm text-muted-foreground">
                  {isCurrentLevelBreak ? "INTERVALO" : `NÍVEL ${blindLevels[currentLevelIndex].level}`}
                </div>
                {!isCurrentLevelBreak && (
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                    SB: {blindLevels[currentLevelIndex].smallBlind} / 
                    BB: {blindLevels[currentLevelIndex].bigBlind}
                    {blindLevels[currentLevelIndex].ante > 0 && ` / Ante: ${blindLevels[currentLevelIndex].ante}`}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Timer grande */}
          <div className="text-6xl md:text-8xl font-bold tabular-nums mb-6">
            {formatTime(currentTime)}
          </div>
          
          {/* Barra de progresso clicável */}
          <div 
            ref={progressRef}
            className="w-full mb-6 cursor-pointer" 
            onClick={handleProgressBarClick}
          >
            <Progress value={calculateProgress()} className="h-4" />
          </div>
          
          {/* Informações adicionais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8 text-center">
            <div>
              <div className="text-xs text-muted-foreground">HORA ATUAL</div>
              <div className="text-base font-medium">
                {format(new Date(), 'HH:mm', { locale: ptBR })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">TEMPO DE JOGO</div>
              <div className="text-base font-medium">
                {formatElapsedTime(currentGameTime)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">PRÓXIMO INTERVALO</div>
              <div className="text-base font-medium">
                {calculateTimeToBreak()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">PRÓXIMO NÍVEL</div>
              <div className="text-base font-medium">
                {currentLevelIndex + 1 < blindLevels.length ? 
                  (blindLevels[currentLevelIndex + 1].isBreak ? 
                    "INTERVALO" : 
                    `${blindLevels[currentLevelIndex + 1].smallBlind}/${blindLevels[currentLevelIndex + 1].bigBlind}`) : 
                  "Final"}
              </div>
            </div>
          </div>
          
          {/* Controles do timer */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePreviousLevel}
              variant="outline"
              size="icon"
              className="h-10 w-10"
              disabled={currentLevelIndex === 0}
            >
              <SkipBack size={20} />
            </Button>
            
            <Button
              onClick={toggleTimer}
              className={`h-12 w-12 rounded-full ${timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {timerRunning ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            
            <Button
              onClick={handleNextLevel}
              variant="outline"
              size="icon"
              className="h-10 w-10"
              disabled={currentLevelIndex >= blindLevels.length - 1}
            >
              <SkipForward size={20} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
