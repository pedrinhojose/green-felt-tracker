
import { BlindLevel } from "@/lib/db/models";

export interface BreakInfo {
  nextBreak: BlindLevel | null;
  levelsUntilBreak: number | null;
}

export function useBreakInfo(
  blindLevels: BlindLevel[],
  currentLevelIndex: number
): BreakInfo {
  // Encontra o próximo intervalo - com verificações de segurança
  let nextBreakIndex = -1;
  if (Array.isArray(blindLevels) && blindLevels.length > 0) {
    nextBreakIndex = blindLevels.findIndex((level, index) => 
      index > currentLevelIndex && level && level.isBreak
    );
  }
  
  const nextBreak = nextBreakIndex !== -1 ? blindLevels[nextBreakIndex] : null;
  const levelsUntilBreak = nextBreakIndex !== -1 ? nextBreakIndex - currentLevelIndex : null;

  return {
    nextBreak,
    levelsUntilBreak,
  };
}
