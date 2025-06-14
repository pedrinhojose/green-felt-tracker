
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
  console.log("=== LEVEL TIME DEBUG ===");
  console.log("useLevelTime chamado com:");
  console.log("- blindLevels length:", blindLevels?.length);
  console.log("- currentLevelIndex:", currentLevelIndex);
  console.log("- elapsedTimeInLevel:", elapsedTimeInLevel);
  
  // Verificar se o array de blinds é válido
  if (!Array.isArray(blindLevels) || blindLevels.length === 0) {
    console.log("ERRO: blindLevels inválido ou vazio");
    return {
      timeRemainingInLevel: 0,
      currentLevel: undefined,
      nextLevel: undefined,
    };
  }
  
  // Verificar se o índice é válido
  if (currentLevelIndex < 0 || currentLevelIndex >= blindLevels.length) {
    console.log("ERRO: currentLevelIndex inválido:", currentLevelIndex, "para array de tamanho:", blindLevels.length);
    return {
      timeRemainingInLevel: 0,
      currentLevel: undefined,
      nextLevel: undefined,
    };
  }
  
  const currentLevel = blindLevels[currentLevelIndex];
  const nextLevel = blindLevels[currentLevelIndex + 1];
  
  console.log("Acesso ao blind no índice", currentLevelIndex, ":");
  console.log("- currentLevel:", currentLevel);
  console.log("- currentLevel.smallBlind:", currentLevel?.smallBlind);
  console.log("- currentLevel.bigBlind:", currentLevel?.bigBlind);
  console.log("- nextLevel:", nextLevel);
  
  // Calcula o tempo restante no nível atual em segundos
  const timeRemainingInLevel = currentLevel 
    ? Math.max(0, currentLevel.duration * 60 - elapsedTimeInLevel)
    : 0;

  console.log("Tempo restante calculado:", timeRemainingInLevel);

  return {
    timeRemainingInLevel,
    currentLevel,
    nextLevel,
  };
}
