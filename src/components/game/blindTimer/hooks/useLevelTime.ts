
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
  const currentLevel = blindLevels[currentLevelIndex];
  const nextLevel = blindLevels[currentLevelIndex + 1];
  
  // Calcula o tempo restante no nível atual em segundos
  const timeRemainingInLevel = currentLevel 
    ? Math.max(0, currentLevel.duration * 60 - elapsedTimeInLevel)
    : 0;

  return {
    timeRemainingInLevel,
    currentLevel,
    nextLevel,
  };
}
