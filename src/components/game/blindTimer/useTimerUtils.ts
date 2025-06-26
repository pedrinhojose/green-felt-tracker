
import { BlindLevel } from "@/lib/db/models";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useTimerUtils() {
  // Formata o tempo em minutos:segundos
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Formata o tempo total decorrido em HH:MM:SS
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Retorna a hora atual formatada
  const getCurrentTime = (): string => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calcula quantos minutos faltam para o próximo intervalo - TEMPO REAL
  const getMinutesUntilBreak = (
    currentLevelIndex: number, 
    timeRemainingInLevel: number,
    blindLevels: BlindLevel[]
  ): number => {
    try {
      // Validação de entrada
      if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
        return 0;
      }
      
      if (currentLevelIndex < 0 || currentLevelIndex >= blindLevels.length) {
        return 0;
      }
      
      // Encontrar o próximo intervalo
      let nextBreakIndex = -1;
      for (let i = currentLevelIndex + 1; i < blindLevels.length; i++) {
        if (blindLevels[i] && blindLevels[i].isBreak) {
          nextBreakIndex = i;
          break;
        }
      }
      
      if (nextBreakIndex === -1) {
        return 0; // Não há próximo intervalo
      }
      
      let totalSecondsUntilBreak = 0;
      
      // Tempo restante no nível atual (já em segundos)
      totalSecondsUntilBreak += timeRemainingInLevel;
      
      // Somar o tempo dos níveis intermediários (converter minutos para segundos)
      for (let i = currentLevelIndex + 1; i < nextBreakIndex; i++) {
        if (i < blindLevels.length && blindLevels[i] && typeof blindLevels[i].duration === 'number') {
          totalSecondsUntilBreak += blindLevels[i].duration * 60;
        }
      }
      
      // Converter para minutos e arredondar para cima
      return Math.ceil(totalSecondsUntilBreak / 60);
    } catch (error) {
      console.error("Erro ao calcular minutos até o intervalo:", error);
      return 0;
    }
  };

  // Calcula quanto tempo falta para o próximo intervalo (versão string - mantida para compatibilidade)
  const getTimeUntilBreak = (
    currentLevelIndex: number, 
    elapsedTimeInLevel: number,
    blindLevels: BlindLevel[],
    nextBreakIndex: number
  ): string => {
    try {
      // Verificar se os índices são válidos e se temos níveis suficientes
      if (nextBreakIndex === -1 || !blindLevels || blindLevels.length === 0) {
        return "Não há intervalo programado";
      }
      
      // Verificar se o índice atual é válido
      if (currentLevelIndex < 0 || currentLevelIndex >= blindLevels.length) {
        return "Índice de nível inválido";
      }
      
      // Verificar se o próximo índice de intervalo é válido
      if (nextBreakIndex < 0 || nextBreakIndex >= blindLevels.length) {
        return "Índice de próximo intervalo inválido";
      }
      
      let timeUntilBreak = 0;
      
      // Tempo restante no nível atual
      const currentLevel = blindLevels[currentLevelIndex];
      if (!currentLevel || typeof currentLevel.duration !== 'number') {
        return "Configuração de nível inválida";
      }
      
      const remainingInCurrentLevel = (currentLevel.duration * 60) - elapsedTimeInLevel;
      timeUntilBreak += remainingInCurrentLevel;
      
      // Somar o tempo dos níveis intermediários
      for (let i = currentLevelIndex + 1; i < nextBreakIndex; i++) {
        if (i < blindLevels.length && blindLevels[i] && typeof blindLevels[i].duration === 'number') {
          timeUntilBreak += blindLevels[i].duration * 60;
        }
      }
      
      // Formato mais detalhado (minutos e segundos)
      const minutes = Math.floor(timeUntilBreak / 60);
      const seconds = Math.floor(timeUntilBreak % 60);
      return `${minutes}:${String(seconds).padStart(2, '0')} min`;
    } catch (error) {
      console.error("Erro ao calcular tempo até o intervalo:", error);
      return "Cálculo indisponível";
    }
  };

  return {
    formatTime,
    formatTotalTime,
    getCurrentTime,
    getTimeUntilBreak,
    getMinutesUntilBreak,
  };
}
