import { useEffect, useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useTimerUtils } from "./useTimerUtils";
import { Progress } from "@/components/ui/progress";

interface TimerDisplayProps {
  currentLevel: BlindLevel | undefined;
  nextLevel: BlindLevel | undefined;
  timeRemainingInLevel: number;
  totalElapsedTime: number;
  nextBreak: BlindLevel | null;
  levelsUntilBreak: number | null;
  showAlert: boolean;
  onProgressClick: (percentage: number) => void;
  blindLevels?: BlindLevel[]; // Adicionamos esta prop para passar os níveis de blind
}

export default function TimerDisplay({ 
  currentLevel,
  nextLevel,
  timeRemainingInLevel,
  totalElapsedTime,
  nextBreak,
  levelsUntilBreak,
  showAlert,
  onProgressClick,
  blindLevels = [] // Valor padrão como array vazio
}: TimerDisplayProps) {
  const { formatTime, formatTotalTime, getCurrentTime, getTimeUntilBreak } = useTimerUtils();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  
  // Atualiza o relógio do sistema a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calcular a porcentagem de tempo decorrido no nível atual
  const progressPercentage = currentLevel
    ? 100 - (timeRemainingInLevel / (currentLevel.duration * 60)) * 100
    : 0;
  
  // Determinar a cor da barra de progresso
  const getProgressColor = () => {
    if (progressPercentage >= 85) return 'bg-red-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handler para clique na barra de progresso
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;
    onProgressClick(percentage);
  };

  // Efeito de alerta para o tempo restante
  const timeRemainingClass = showAlert 
    ? 'animate-pulse scale-105 text-red-500'
    : '';
  
  // Efeito de alerta para blinds - aumentamos o tamanho e garantimos a cor amarela
  const blindsClass = showAlert && timeRemainingInLevel === 0
    ? 'animate-pulse scale-110 text-poker-gold'
    : 'text-poker-gold';
    
  if (!currentLevel) return null;

  // Função de segurança para obter o tempo até o próximo intervalo
  const getTimeUntilBreakSafely = () => {
    if (!currentLevel || !nextBreak) return "";
    
    try {
      // Verificar se temos todos os dados necessários
      if (!Array.isArray(currentLevel.level) && typeof currentLevel.level === 'number' && 
          !Array.isArray(nextBreak.level) && typeof nextBreak.level === 'number' &&
          typeof currentLevel.duration === 'number') {
        
        const currentLevelIndex = currentLevel.level - 1;
        const elapsedTimeInCurrentLevel = currentLevel.duration * 60 - timeRemainingInLevel;
        const nextBreakIndex = nextBreak.level - 1;
        
        // Usar a prop blindLevels ao invés de window.blindLevels
        if (blindLevels && blindLevels.length > 0) {
          return getTimeUntilBreak(
            currentLevelIndex,
            elapsedTimeInCurrentLevel,
            blindLevels,
            nextBreakIndex
          );
        }
      }
      return "Calculando...";
    } catch (error) {
      console.error("Erro ao calcular tempo até o intervalo:", error);
      return "Cálculo indisponível";
    }
  };

  return (
    <div className="text-center space-y-4">
      {/* Nível atual */}
      <div className="mb-2">
        <h2 className="text-xl text-white font-medium">
          {currentLevel.isBreak ? 'INTERVALO' : `NÍVEL ${currentLevel.level}`}
        </h2>
      </div>
      
      {/* Blinds atuais - Aumentamos o tamanho da fonte para 4xl e garantimos cor amarela */}
      {!currentLevel.isBreak ? (
        <div className={`text-4xl md:text-5xl font-bold ${blindsClass} transition-all`}>
          SB: {currentLevel.smallBlind} / BB: {currentLevel.bigBlind}
          {currentLevel.ante > 0 && ` / Ante: ${currentLevel.ante}`}
        </div>
      ) : (
        <div className="text-3xl text-poker-gold font-bold">
          Pausa para Descanso
        </div>
      )}
      
      {/* Tempo restante */}
      <div 
        className={`text-5xl md:text-7xl font-bold text-white ${timeRemainingClass} transition-all`}
      >
        {formatTime(timeRemainingInLevel)}
      </div>
      
      {/* Barra de progresso clicável */}
      <div 
        className="w-full bg-gray-700 rounded-full h-6 mt-4 cursor-pointer relative"
        onClick={handleProgressClick}
      >
        <Progress 
          value={progressPercentage} 
          className="h-6 rounded-full bg-gray-700" 
          barClassName={getProgressColor()}
        />
      </div>
      
      {/* Informações adicionais */}
      <div className="grid grid-cols-3 gap-4 text-gray-300 pt-4">
        <div>
          <div className="text-xs text-gray-400">Próximo Nível</div>
          {nextLevel ? (
            <div className="text-sm text-poker-gold">
              {nextLevel.isBreak ? 'INTERVALO' : `${nextLevel.smallBlind} / ${nextLevel.bigBlind}`}
            </div>
          ) : (
            <div className="text-sm text-poker-gold">Último Nível</div>
          )}
        </div>
        
        <div>
          <div className="text-xs text-gray-400">Tempo de Jogo</div>
          <div className="text-sm text-poker-gold">{formatTotalTime(totalElapsedTime)}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400">Hora Atual</div>
          <div className="text-sm text-poker-gold">{currentTime}</div>
        </div>
      </div>
      
      {/* Próximo intervalo */}
      {nextBreak && (
        <div className="bg-poker-navy/30 rounded-lg p-2 mt-2 text-sm">
          <div className="text-gray-400">Próximo Intervalo</div>
          <div className="text-white">
            {levelsUntilBreak && levelsUntilBreak > 0 ? (
              <>
                Faltam {levelsUntilBreak} níveis (Nível {nextBreak.level})
                {' - '}
                <span className="text-poker-gold font-medium">
                  {getTimeUntilBreakSafely()}
                </span>
              </>
            ) : (
              'Próximo nível'
            )}
          </div>
        </div>
      )}
    </div>
  );
}
