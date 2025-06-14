
import { BlindLevel } from "@/lib/db/models";

export interface LevelTimeInfo {
  timeRemainingInLevel: number;
  currentLevel: BlindLevel | undefined;
  nextLevel: BlindLevel | undefined;
}

export function useLevelTime(
  blindLevels: BlindLevel[],
  currentLevelIndex: number,
  elapsedTimeInLevel: number
): LevelTimeInfo {
  console.log("=== LEVEL TIME - ACESSO SIMPLIFICADO ===");
  console.log("blindLevels length:", blindLevels?.length);
  console.log("currentLevelIndex:", currentLevelIndex);
  console.log("elapsedTimeInLevel:", elapsedTimeInLevel);
  
  // Validação básica
  if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
    console.error("ERRO: Array de blinds inválido");
    return {
      timeRemainingInLevel: 0,
      currentLevel: undefined,
      nextLevel: undefined,
    };
  }
  
  // Validação do índice
  if (currentLevelIndex < 0 || currentLevelIndex >= blindLevels.length) {
    console.error("ERRO: Índice inválido:", currentLevelIndex);
    return {
      timeRemainingInLevel: 0,
      currentLevel: undefined,
      nextLevel: undefined,
    };
  }
  
  // ACESSO DIRETO - sem processamento adicional
  const currentLevel = blindLevels[currentLevelIndex];
  const nextLevel = blindLevels[currentLevelIndex + 1];
  
  console.log("ACESSO DIRETO ao índice", currentLevelIndex);
  console.log("currentLevel encontrado:", {
    level: currentLevel?.level,
    smallBlind: currentLevel?.smallBlind,
    bigBlind: currentLevel?.bigBlind,
    duration: currentLevel?.duration
  });
  
  // Cálculo do tempo restante
  const timeRemainingInLevel = currentLevel 
    ? Math.max(0, currentLevel.duration * 60 - elapsedTimeInLevel)
    : 0;

  console.log("Tempo restante calculado:", timeRemainingInLevel, "segundos");
  
  // VERIFICAÇÃO FINAL
  if (currentLevelIndex === 0 && currentLevel) {
    const isCorrectFirstBlind = currentLevel.smallBlind === 100 && currentLevel.bigBlind === 200;
    console.log(isCorrectFirstBlind ? "✅ CORRETO: Primeiro blind 100/200" : "❌ ERRO: Primeiro blind incorreto");
  }

  return {
    timeRemainingInLevel,
    currentLevel,
    nextLevel,
  };
}
