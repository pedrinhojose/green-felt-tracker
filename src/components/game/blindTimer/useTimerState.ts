
import { useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { useLevelTime } from "./hooks/useLevelTime";
import { useTimerAlerts } from "./hooks/useTimerAlerts";
import { useBreakInfo } from "./hooks/useBreakInfo";

export interface TimerState {
  isRunning: boolean;
  currentLevelIndex: number;
  elapsedTimeInLevel: number;
  totalElapsedTime: number;
  showAlert: boolean;
  soundEnabled: boolean;
}

export function useTimerState(blindLevels: BlindLevel[]) {
  console.log("=== TIMER STATE DEBUG - DADOS RECEBIDOS ===");
  console.log("blindLevels recebidos:", blindLevels);
  console.log("Tipo dos dados:", typeof blindLevels);
  console.log("É array?", Array.isArray(blindLevels));
  console.log("Quantidade de blinds:", blindLevels?.length);
  
  // Log detalhado de cada blind recebido
  blindLevels?.forEach((blind, index) => {
    console.log(`Blind ${index}:`, {
      id: blind.id,
      level: blind.level,
      smallBlind: blind.smallBlind,
      bigBlind: blind.bigBlind,
      ante: blind.ante,
      duration: blind.duration,
      isBreak: blind.isBreak
    });
  });

  // Garantir que os blinds estejam ordenados corretamente pelo nível
  const sortedBlindLevels = [...blindLevels].sort((a, b) => {
    const levelA = typeof a.level === 'number' ? a.level : parseInt(String(a.level));
    const levelB = typeof b.level === 'number' ? b.level : parseInt(String(b.level));
    return levelA - levelB;
  });
  
  console.log("=== TIMER STATE DEBUG - APÓS ORDENAÇÃO ===");
  console.log("Blinds ordenados:", sortedBlindLevels);
  
  // Log detalhado dos blinds ordenados
  sortedBlindLevels.forEach((blind, index) => {
    console.log(`Blind ordenado ${index}:`, {
      level: blind.level,
      smallBlind: blind.smallBlind,
      bigBlind: blind.bigBlind,
      originalIndex: blindLevels.findIndex(b => b.id === blind.id)
    });
  });
  
  console.log("Primeiro blind após ordenação:", sortedBlindLevels[0]);
  console.log("Segundo blind após ordenação:", sortedBlindLevels[1]);
  
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    currentLevelIndex: 0, // Sempre iniciar no primeiro nível (índice 0)
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
  });

  console.log("=== TIMER STATE DEBUG - ESTADO ATUAL ===");
  console.log("Estado do timer:", state);
  console.log("Índice atual:", state.currentLevelIndex);
  console.log("Blind no índice atual:", sortedBlindLevels[state.currentLevelIndex]);
  
  // Verificar se o blind no índice 0 é realmente o que esperamos
  if (sortedBlindLevels[0]) {
    console.log("VERIFICAÇÃO: Blind no índice 0 tem smallBlind:", sortedBlindLevels[0].smallBlind);
    console.log("VERIFICAÇÃO: Blind no índice 0 tem bigBlind:", sortedBlindLevels[0].bigBlind);
  }

  // Use our new focused hooks with sorted blind levels
  const { timeRemainingInLevel, currentLevel, nextLevel } = useLevelTime(
    sortedBlindLevels, 
    state.currentLevelIndex, 
    state.elapsedTimeInLevel
  );
  
  console.log("=== TIMER STATE DEBUG - HOOKS RESULT ===");
  console.log("useLevelTime retornou currentLevel:", currentLevel);
  console.log("useLevelTime retornou nextLevel:", nextLevel);
  
  const { isAlertTime, isFinalCountdown, isLevelJustCompleted, isNewBlindAlert } = useTimerAlerts(
    currentLevel,
    timeRemainingInLevel,
    state
  );
  
  const { nextBreak, levelsUntilBreak } = useBreakInfo(
    sortedBlindLevels,
    state.currentLevelIndex
  );

  return {
    state,
    setState,
    currentLevel,
    nextLevel,
    timeRemainingInLevel,
    isAlertTime,
    isFinalCountdown,
    isLevelJustCompleted,
    isNewBlindAlert,
    nextBreak,
    levelsUntilBreak,
    sortedBlindLevels, // Retornar os blinds ordenados
  };
}
