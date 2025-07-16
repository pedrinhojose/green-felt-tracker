
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
  console.log("=== TIMER STATE - CORREÇÃO DEFINITIVA ===");
  console.log("blindLevels RAW recebidos:", blindLevels);
  console.log("Quantidade:", blindLevels?.length);
  
  // Verificar se temos dados válidos
  if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
    console.error("ERRO: Não há blinds configurados");
    return {
      state: {
        isRunning: false,
        currentLevelIndex: 0,
        elapsedTimeInLevel: 0,
        totalElapsedTime: 0,
        showAlert: false,
        soundEnabled: true,
      },
      setState: () => {},
      currentLevel: undefined,
      nextLevel: undefined,
      timeRemainingInLevel: 0,
      isAlertTime: false,
      isFinalCountdown: false,
      isLevelJustCompleted: false,
      isNewBlindAlert: false,
      nextBreak: null,
      levelsUntilBreak: null,
      sortedBlindLevels: [],
    };
  }
  
  // ORDENAÇÃO SIMPLES E CONFIÁVEL - garantir que level 1 seja sempre índice 0
  const sortedBlindLevels = [...blindLevels].sort((a, b) => {
    // Converter level para number se necessário
    const levelA = typeof a.level === 'number' ? a.level : parseInt(String(a.level), 10);
    const levelB = typeof b.level === 'number' ? b.level : parseInt(String(b.level), 10);
    
    // Verificar se a conversão foi bem-sucedida
    if (isNaN(levelA) || isNaN(levelB)) {
      console.error("ERRO: Levels inválidos encontrados:", { a: a.level, b: b.level });
      return 0;
    }
    
    return levelA - levelB;
  });
  
  console.log("=== APÓS ORDENAÇÃO CORRIGIDA ===");
  console.log("Blinds ordenados:", sortedBlindLevels);
  
  // VALIDAÇÃO CRÍTICA - verificar se o primeiro blind é o correto
  const firstBlind = sortedBlindLevels[0];
  console.log("PRIMEIRO BLIND (índice 0):", firstBlind);
  
  if (firstBlind) {
    console.log("Verificação do primeiro blind:");
    console.log("- Level:", firstBlind.level);
    console.log("- Small Blind:", firstBlind.smallBlind);
    console.log("- Big Blind:", firstBlind.bigBlind);
    console.log("- É o blind 100/200?", firstBlind.smallBlind === 100 && firstBlind.bigBlind === 200);
  }
  
  // FORÇAR ÍNDICE 0 - garantir que sempre iniciamos no primeiro blind
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    currentLevelIndex: 0, // SEMPRE COMEÇAR NO ÍNDICE 0
    elapsedTimeInLevel: 0,
    totalElapsedTime: 0,
    showAlert: false,
    soundEnabled: true,
  });

  console.log("=== ESTADO INICIAL FORÇADO ===");
  console.log("currentLevelIndex:", state.currentLevelIndex);
  console.log("Blind no índice atual:", sortedBlindLevels[state.currentLevelIndex]);
  
  // VALIDAÇÃO FINAL - confirmar que estamos acessando o blind correto
  const currentBlindFromArray = sortedBlindLevels[state.currentLevelIndex];
  if (currentBlindFromArray) {
    console.log("CONFIRMAÇÃO FINAL:");
    console.log("- Acessando índice:", state.currentLevelIndex);
    console.log("- Blind encontrado:", {
      level: currentBlindFromArray.level,
      smallBlind: currentBlindFromArray.smallBlind,
      bigBlind: currentBlindFromArray.bigBlind
    });
    
    // ALERTA se não for o blind esperado
    if (currentBlindFromArray.smallBlind !== 100 || currentBlindFromArray.bigBlind !== 200) {
      console.error("❌ ERRO: O primeiro blind não é 100/200!");
      console.error("Blind encontrado:", currentBlindFromArray);
      console.error("Esperado: smallBlind=100, bigBlind=200");
    } else {
      console.log("✅ SUCESSO: Primeiro blind correto (100/200)");
    }
  }

  // Use hooks with the corrected sorted blind levels
  const { timeRemainingInLevel, currentLevel, nextLevel } = useLevelTime(
    sortedBlindLevels, 
    state.currentLevelIndex, 
    state.elapsedTimeInLevel
  );
  
  const { isAlertTime, isFinalCountdown, isLevelJustCompleted, isNewBlindAlert } = useTimerAlerts(
    currentLevel,
    timeRemainingInLevel,
    state
  );
  
  const { nextBreak, levelsUntilBreak } = useBreakInfo(
    sortedBlindLevels,
    state.currentLevelIndex
  );

  console.log("=== RESULTADO FINAL DOS HOOKS ===");
  console.log("currentLevel retornado:", currentLevel);
  console.log("É o blind 100/200?", currentLevel?.smallBlind === 100 && currentLevel?.bigBlind === 200);

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
    sortedBlindLevels,
  };
}
